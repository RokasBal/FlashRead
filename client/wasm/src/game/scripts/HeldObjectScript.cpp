#include "HeldObjectScript.h"

#include <wgleng/core/Components.h>
#include <wgleng/rendering/Highlights.h>

HeldObjectScript::HeldObjectScript(GameScene& scene)
	: Script(scene) {
	m_highlightId = Highlights::GetHighlightId("white");
	m_pickupListener = scene.actions.Listen(Action::PickUp, [&] {
		m_shouldPickup = true;
	});
	m_throwListener = scene.actions.Listen(Action::Throw, [&] {
		scene.player.objectCarry.DropCarriedEntity(scene.player.GetCamera()->GetFront(), 10.0f);
	});
}

void HeldObjectScript::Update(TimeDuration dt) {
	auto& player = scene.player;

	entt::entity firstHitEntity = entt::null;

	// raycast for item picking
	if (player.objectCarry.GetCarriedEntity() == entt::null) {
		const glm::vec3 rayFrom = player.GetCamera()->position;
		const glm::vec3 rayTo = rayFrom + player.GetCamera()->GetFront() * 50.0f;
		const auto hits = scene.GetPhysicsWorld().RaycastWorld(rayFrom, rayTo, true,
			[&](entt::entity entity, const btRigidBody* body, const glm::vec3& hitPos, const glm::vec3& hitNormal) {
				if (player.objectCarry.GetCarriedEntity() == entity) return false;
				const auto& flagComp = scene.registry.get<FlagComponent>(entity);
				const bool validHit = flagComp.flags & (EntityFlags::PICKABLE);
				return validHit;
			});

		// select first entity
		if (!hits.empty()) {
			const auto& firstHit = hits.front();
			firstHitEntity = firstHit.entity;
			if (const auto meshComp = scene.registry.try_get<MeshComponent>(firstHit.entity)) {
				meshComp->highlightId = m_highlightId;
			}
			scene.AddControlHint("F - pickup");
		}
	}

	if (player.objectCarry.GetCarriedEntity() != entt::null) {
		if (scene.actions.IsEnabled(Action::PickUp)) scene.AddControlHint("F - drop");
		if (scene.actions.IsEnabled(Action::Throw)) scene.AddControlHint("Q - throw");
	}

	// item pickup
	if (m_shouldPickup) {
		m_shouldPickup = false;
		if (player.objectCarry.GetCarriedEntity() == entt::null) player.objectCarry.SetCarriedEntity(firstHitEntity);
		else player.objectCarry.DropCarriedEntity();
	}
	player.objectCarry.Update(player.GetCamera()->position, player.GetCamera()->GetFront());
}
