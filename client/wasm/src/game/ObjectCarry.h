#pragma once

#include <btBulletDynamicsCommon.h>
#include <entt/entt.hpp>
#include <glm/glm.hpp>

class ObjectCarry {
public:
	ObjectCarry(entt::registry& registry, float dropDist = 55.f);

	void SetCarriedEntity(entt::entity entity);
	entt::entity GetCarriedEntity() const { return m_carriedEntity; }
	void DropCarriedEntity(const glm::vec3& direction = {0, 0, 0}, float force = 0);

	void Update(const glm::vec3& holderPos, const glm::vec3& holderFront);

	bool canDropByItself = true;

private:
	entt::registry& m_registry;
	float m_dropDistance;

	entt::entity m_carriedEntity{entt::null};
	btRigidBody* m_body{nullptr};

	float m_pickupDistance{0};
};
