#pragma once

#include <entt/entt.hpp>
#include <memory>

#include "../core/Camera.h"
#include "../core/PhysicsWorld.h"
#include "../util/Timer.h"
#include "ObjectCarry.h"

class Player {
public:
	Player(entt::registry& registry, PhysicsWorld& physicsWorld, const glm::vec3& position);
	~Player();
	Player(const Player&) = delete;
	Player& operator=(const Player&) = delete;
	Player(Player&& other) noexcept;
	Player& operator=(Player&& other) noexcept;

	void Update(float dt);
	void UpdateCameraAfterPhysics() const;

	void SetCamera(const std::shared_ptr<Camera>& camera) { m_camera = camera; }
	const std::shared_ptr<Camera>& GetCamera() const { return m_camera; }

	ObjectCarry objectCarry;

	float mouseSensitivity = 0.5f;
	float moveSpeed = 20.0f;
	bool fly = false;

private:
	void Cleanup();
	void UpdateInput(float dt);
	std::reference_wrapper<PhysicsWorld> m_physicsWorld;
	btRigidBody* m_rigidBody;
	std::shared_ptr<Camera> m_camera;
	TimePoint m_lastJump;
	entt::entity m_entity;
	std::reference_wrapper<entt::registry> m_registry;
};
