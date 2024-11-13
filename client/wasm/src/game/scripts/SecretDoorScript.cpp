#include "SecretDoorScript.h"

#include <wgleng/core/Components.h>
#include <wgleng/rendering/Highlights.h>

SecretDoorScript::SecretDoorScript(GameScene& scene)
	: Script(scene) {
	m_highlightId = Highlights::GetHighlightId("white");
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
    
        if (tagComp->tag == "codeEnter") {
            printf("Code entered: %s\n", m_enteredCode.c_str());

            if (m_enteredCode == "123") {
                scene.registry.destroy(firstHitEntity);
                for (auto&& [entity, tagComp] : scene.registry.view<TagComponent>().each()) {
                    if (tagComp.tag == "secretDoor") {
                        scene.registry.destroy(entity);
                        break;
                    }
                }
            }
            m_enteredCode.clear();
            return;
        }
        if (tagComp->tag == "code1") {
            m_enteredCode += '1';
        } else if (tagComp->tag == "code2") {
            m_enteredCode += '2';
        } else if (tagComp->tag == "code3") {
            m_enteredCode += '3';
        }
	});
}

void SecretDoorScript::Update(TimeDuration dt) {
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

    if (hits.empty()) return;
    const auto& firstHit = hits.front();
    if (const auto meshComp = scene.registry.try_get<MeshComponent>(firstHit.entity)) {
        meshComp->highlightId = m_highlightId;
    }
}
