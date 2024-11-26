#include "SecretDoorScript.h"

#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#include <functional>
#include <string>
#include <vector>
#include <wgleng/core/Components.h>
#include <wgleng/rendering/Highlights.h>
#include <wgleng/util/Timer.h>

#include "../GameComponents.h"

TimePoint lastCheckTime;
std::function<void(bool)> checkDoorCodeCallback;
void checkDoorCodeResponse(bool success) {
	checkDoorCodeCallback(success);
}

std::function<void(std::vector<std::string>)> setBookHintsCallback;
void setBookHints(const std::vector<std::string>& hints) {
	setBookHintsCallback(hints);
}

EMSCRIPTEN_BINDINGS(my_module) {
	emscripten::register_vector<std::string>("StringList");

	emscripten::function("checkDoorCodeResponse", &checkDoorCodeResponse);
	emscripten::function("setBookHints", &setBookHints);
}

SecretDoorScript::SecretDoorScript(GameScene& scene)
	: Script(scene) {
	m_highlightId = Highlights::GetHighlightId("white");
	m_goldenHighlightId = Highlights::GetHighlightId("yellow");

	// listen for win game action
	m_winGameListener = scene.actions.Listen(Action::WinGame, [&] {
		Win();
	});

	// listen for interact action
	lastCheckTime = TimePoint();
	m_listener = scene.actions.Listen(Action::Interact, [&] {
		const auto& player = scene.player;
		if (player.objectCarry.GetCarriedEntity() != entt::null) return;

		const glm::vec3 rayFrom = player.GetCamera()->position;
		const glm::vec3 rayTo = rayFrom + player.GetCamera()->GetFront() * 50.0f;
		const auto hits = scene.GetPhysicsWorld().RaycastWorld(rayFrom, rayTo, true,
			[&](entt::entity entity, const btRigidBody* body, const glm::vec3& hitPos, const glm::vec3& hitNormal) {
				const auto tagComp = scene.registry.try_get<TagComponent>(entity);
				if (!tagComp) return false;

				const auto& flagComp = scene.registry.get<FlagComponent>(entity);
				const bool validHit = flagComp.flags & EntityFlags::INTERACTABLE;
				return validHit;
			});

		// select first entity
		if (hits.empty()) return;

		const auto& firstHit = hits.front();
		const auto firstHitEntity = firstHit.entity;
		const auto tagComp = scene.registry.try_get<TagComponent>(firstHitEntity);
		if (!tagComp) return;

		if (tagComp->tag == "goldenBook") {
			return;
		}

		// secret door stuff
		if (tagComp->tag == "codeEnter") {
			if (TimePoint() - lastCheckTime < 1s) return;

			lastCheckTime = TimePoint();
			checkDoorCodeCallback = [&](bool success) {
				if (!success) return;
				for (auto&& [entity, tagComp] : scene.registry.view<TagComponent>().each()) {
					if (tagComp.tag == "secretDoor" || tagComp.tag == "codeEnter") {
						scene.registry.destroy(entity);
					}
				}
			};

			EM_ASM({
				checkDoorCode(UTF8ToString($0));
				}, m_enteredCode.c_str());
			m_enteredCode.clear();
			return;
		}
		if (tagComp->tag == "code1") {
			m_enteredCode += '1';
		}
		else if (tagComp->tag == "code2") {
			m_enteredCode += '2';
		}
		else if (tagComp->tag == "code3") {
			m_enteredCode += '3';
		}
	});
}

void SecretDoorScript::Update(TimeDuration dt) {
    // init book hints
    if (m_initBookHints) {
        m_initBookHints = false;
        // setup book hints
        int bookHintCount = 0;
        for (auto&& [entity, tagComp] : scene.registry.view<TagComponent>().each()) {
            if (tagComp.tag == "hintBook") {
                bookHintCount++;
            }
        }
        setBookHintsCallback = [&](std::vector<std::string> hints) {
            int bookHintIndex = 0;
            for (auto&& [entity, tagComp] : scene.registry.view<TagComponent>().each()) {
                if (tagComp.tag != "hintBook") continue;
                if (bookHintIndex >= hints.size()) break;
                scene.registry.emplace<BookHintComponent>(entity, BookHintComponent{hints[bookHintIndex]});
                bookHintIndex++;
            }
        };
        EM_ASM({
            getBookHints($0);
            }, bookHintCount);

        // add golden book component
        for (auto&& [entity, tagComp] : scene.registry.view<TagComponent>().each()) {
            if (tagComp.tag != "goldenBook") continue;
            scene.registry.emplace<GoldenBookComponent>(entity, GoldenBookComponent{});
            break;
        }
    }

    // highlight golden book
    for (auto&& [entity, gbComp, meshComp] : scene.registry.view<GoldenBookComponent, MeshComponent>().each()) {
        meshComp.highlightId = m_goldenHighlightId;
    }

    // highlight interactable objects
    const auto& player = scene.player;
    if (player.objectCarry.GetCarriedEntity() == entt::null) {
        const glm::vec3 rayFrom = player.GetCamera()->position;
        const glm::vec3 rayTo = rayFrom + player.GetCamera()->GetFront() * 50.0f;
        const auto hits = scene.GetPhysicsWorld().RaycastWorld(rayFrom, rayTo, true,
            [&](entt::entity entity, const btRigidBody* body, const glm::vec3& hitPos, const glm::vec3& hitNormal) {
                const auto tagComp = scene.registry.try_get<TagComponent>(entity);
                if (!tagComp) return false;

                const auto& flagComp = scene.registry.get<FlagComponent>(entity);
                const bool validHit = flagComp.flags & EntityFlags::INTERACTABLE;
                return validHit;
            });
        if (!hits.empty()) {
            const auto& firstHit = hits.front();
            if (const auto meshComp = scene.registry.try_get<MeshComponent>(firstHit.entity)) {
                meshComp->highlightId = m_highlightId;
            }
			const auto tagComp = scene.registry.try_get<TagComponent>(firstHit.entity);
			if (tagComp) {
				if (tagComp->tag == "code1") scene.AddControlHint("E - enter 1");
				else if (tagComp->tag == "code2") scene.AddControlHint("E - enter 2");
				else if (tagComp->tag == "code3") scene.AddControlHint("E - enter 3");
				else if (tagComp->tag == "codeEnter") scene.AddControlHint("E - enter code");
			}
        }
    }

    // display timer
    if (!m_won) m_endTime = TimePoint();
    const TimeDuration dur = m_endTime - m_startTime;
	const std::string timerText = std::format("$<{}>{:02d}:{:02d}", m_highlightId, dur.iSec() / 60, dur.iSec() % 60);
    m_timerText = Text::CreateText("arial-big", timerText);
    scene.AddText(m_timerText);

	const auto textSize = m_timerText->GetTextSize() * 0.035f;
    m_timerText->scale = glm::vec3{0.035};
    m_timerText->position = {0.5 - textSize.x * 0.5, 1.0 - textSize.y, 0.0};
	m_timerText->normalizedCoordinates = true;
}
void SecretDoorScript::Win() {
	if (m_won) return;
	m_won = true;
	EM_ASM({
		winGame($0);
	}, static_cast<int32_t>((m_endTime - m_startTime).iSec()));
}
