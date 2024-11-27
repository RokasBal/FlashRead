#include "ObjectInteractScript.h"

#include <wgleng/core/Components.h>
#include <wgleng/rendering/Text.h>

#include "../GameComponents.h"

ObjectInteractScript::ObjectInteractScript(GameScene& scene)
	: Script(scene) {
	m_listener = scene.actions.Listen(Action::Interact, [&] {
		// cancel interact
		if (m_readingData.reading) {
			StopReading();
			return;
		}

		// check if object is held
		const entt::entity heldObject = scene.player.objectCarry.GetCarriedEntity();
		if (heldObject == entt::null) return;

		// check if object is interactable
		const auto& flagComp = scene.registry.get<FlagComponent>(heldObject);
		if (!(flagComp.flags & EntityFlags::INTERACTABLE)) return;

		// check if object is a hint book
		const auto tagComp = scene.registry.try_get<TagComponent>(heldObject);
		if (!tagComp) return;
		if (tagComp->tag != "hintBook" && tagComp->tag != "goldenBook") return;
		if (tagComp->tag == "goldenBook") {
			scene.actions.Trigger(Action::WinGame);
		}

		StartReading(heldObject);
	});
}

void ObjectInteractScript::Update(TimeDuration dt) {
	const auto heldObject = scene.player.objectCarry.GetCarriedEntity();
	if (heldObject != entt::null) {
		const auto& flagComp = scene.registry.get<FlagComponent>(heldObject);
		const auto tagComp = scene.registry.try_get<TagComponent>(heldObject);
		if (flagComp.flags & EntityFlags::INTERACTABLE && tagComp) {
			if (tagComp->tag == "hintBook" || tagComp->tag == "goldenBook") {
				if (m_readingData.reading) scene.AddControlHint("E - stop reading");
				else scene.AddControlHint("E - read");
			}
		}
	}

	if (m_readingData.reading) {
		UpdateReading();
		return;
	}
}

void ObjectInteractScript::StartReading(entt::entity book) {
	m_readingData.reading = true;
	m_readingData.realBook = book;

	// hide real book
	if (const auto meshComp = scene.registry.try_get<MeshComponent>(m_readingData.realBook)) {
		meshComp->hiddenPersistent = true;
	}
	if (const auto rbComp = scene.registry.try_get<RigidBodyComponent>(m_readingData.realBook)) {
		if (!rbComp->body) return;
		PhysicsWorld::BodyDisableCollisions(rbComp->body);
		PhysicsWorld::BodyDisableGravity(rbComp->body);
	}

	// create fake book
	m_readingData.fakeBook = scene.registry.create();
	scene.registry.emplace<MeshComponent>(m_readingData.fakeBook, MeshComponent{
		.mesh = MeshRegistry::Get("openBook"),
		.rotation = {90, 90, 0}
	});
	m_readingData.fakeBookTransform = &scene.registry.emplace<TransformComponent>(m_readingData.fakeBook, TransformComponent{
		.position = {0, 0, 0},
		.scale = {0.7f, 0.7f, 0.7f}
	});

	// set text
	if (const auto hintComp = scene.registry.try_get<BookHintComponent>(m_readingData.realBook)) {
		std::shared_ptr<DrawableText> text = Text::CreateText("arial", hintComp->hint, 15);
		text->useOrtho = false;
		text->position = {-0.6, 0.55, 0.12};
		text->scale = glm::vec3{0.05f};

		// std::shared_ptr<DrawableText> text2 = Text::CreateText("arial", testText2, 15);
		// text2->useOrtho = false;
		// text2->position = text->position;
		// text2->position.x = 0.05;
		// text2->scale = text->scale;
		scene.registry.emplace<TextComponent>(m_readingData.fakeBook, TextComponent{
			.texts = {text}
		});
	} else if (scene.registry.try_get<GoldenBookComponent>(m_readingData.realBook)) {
		std::shared_ptr<DrawableText> text = Text::CreateText("arial", "You win!", 15);
		text->useOrtho = false;
		text->position = {-0.6, 0.55, 0.12};
		text->scale = glm::vec3{0.05f};

		scene.registry.emplace<TextComponent>(m_readingData.fakeBook, TextComponent{
			.texts = {text}
		});
	}


	scene.player.objectCarry.canDropByItself = false;
	scene.actions.Disable(Action::PickUp);
	scene.actions.Disable(Action::Throw);
}
void ObjectInteractScript::StopReading() {
	// destroy fake book
	if (scene.registry.valid(m_readingData.fakeBook)) {
		scene.registry.destroy(m_readingData.fakeBook);
	}

	// show real book
	if (scene.registry.valid(m_readingData.realBook)) {
		if (const auto meshComp = scene.registry.try_get<MeshComponent>(m_readingData.realBook)) {
			meshComp->hiddenPersistent = false;
		}
	}
	if (const auto rbComp = scene.registry.try_get<RigidBodyComponent>(m_readingData.realBook)) {
		if (!rbComp->body) return;
		PhysicsWorld::BodyEnableCollisions(rbComp->body);
		PhysicsWorld::BodyEnableGravity(rbComp->body);
	}
	m_readingData = {};

	scene.player.objectCarry.canDropByItself = true;
	scene.actions.Enable(Action::PickUp);
	scene.actions.Enable(Action::Throw);
}
void ObjectInteractScript::UpdateReading() const {
	if (!m_readingData.fakeBookTransform) return;

	// update fake book position
	const auto& camera = scene.player.GetCamera();
	if (!camera) return;

	const glm::quat q = glm::conjugate(glm::toQuat(
		glm::lookAt(glm::vec3{0}, camera->GetFront(), camera->GetUp())
	));
	const glm::vec3 rot = glm::degrees(glm::eulerAngles(q));

	m_readingData.fakeBookTransform->position = camera->position + camera->GetFront() * 1.5f;
	m_readingData.fakeBookTransform->rotation = rot;
}
