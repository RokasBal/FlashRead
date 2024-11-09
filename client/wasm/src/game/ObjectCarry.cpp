#include "ObjectCarry.h"

#include "../core/Components.h"

ObjectCarry::ObjectCarry(entt::registry& registry, float dropDist)
	: m_registry{ registry }, m_dropDistance{ dropDist } {}

void ObjectCarry::SetCarriedEntity(entt::entity entity) {
	if (m_carriedEntity != entt::null) DropCarriedEntity();
	if (entity == entt::null) return;

	// get rigid body
	const auto* rigidBody = m_registry.try_get<RigidBodyComponent>(entity);
	if (!rigidBody) return;
	m_body = rigidBody->body;
	if (!m_body) return;

	m_carriedEntity = entity;
}
void ObjectCarry::DropCarriedEntity(const glm::vec3& direction, float force) {
	if (m_body) {
		m_body->setLinearVelocity(m_body->getLinearVelocity() * 0.1f);
		force *= 1000.f;
		if (force > 0.f) m_body->applyImpulse({ direction.x * force, direction.y * force, direction.z * force }, { 0, 0, 0 });
	}

	m_carriedEntity = entt::null;
	m_body = nullptr;
	m_pickupDistance = 0;
}
void ObjectCarry::Update(const glm::vec3& holderPos, const glm::vec3& holderFront) {
	if (m_carriedEntity == entt::null) return;

	// get current position
	btTransform transform;
	if (m_body->getMotionState()) m_body->getMotionState()->getWorldTransform(transform);
	else transform = m_body->getWorldTransform();
	const glm::vec3 pos = { transform.getOrigin().x(), transform.getOrigin().y(), transform.getOrigin().z() };

	// get distance
	float distance = glm::distance(pos, holderPos);
	if (m_pickupDistance == 0) m_pickupDistance = distance;

	// move to new position based on previous distance
	const glm::vec3 newPos = holderPos + holderFront * m_pickupDistance;
	glm::vec3 posDiff = newPos - pos;
	if (glm::length(posDiff) >= m_dropDistance) {
		DropCarriedEntity();
		return;
	}
	posDiff *= 4.0f;
	m_body->activate(true);
	m_body->setLinearVelocity({ posDiff.x, posDiff.y, posDiff.z });
	m_body->setAngularVelocity({ 0, 0, 0 });
}
