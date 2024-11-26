#include "Player.h"

#include <glm/gtx/norm.hpp>
#include <wgleng/core/Components.h>
#include <wgleng/io/Input.h>

Player::Player(entt::registry& registry, PhysicsWorld& physicsWorld, const glm::vec3& position)
	: objectCarry{registry}, m_physicsWorld{physicsWorld}, m_entity{registry.create()}, m_registry{registry} {
	m_camera = std::make_shared<Camera>();
	m_camera->position = position;

	const auto collider = m_physicsWorld.get().GetCapsuleCollider(10, 20);
	m_rigidBody = m_physicsWorld.get().CreateRigidBody(m_entity, collider, 50.f, position, {0, 0, 0});
	m_rigidBody->setAngularFactor(btVector3(0, 0, 0));
	m_rigidBody->setFriction(8.f);
	m_rigidBody->setGravity({0, -100, 0});

	registry.emplace<PlayerComponent>(m_entity, PlayerComponent{});
	registry.emplace<RigidBodyComponent>(m_entity, RigidBodyComponent{m_rigidBody});
}
Player::~Player() {
	Cleanup();
}
Player::Player(Player&& other) noexcept
	: objectCarry{other.m_registry}, m_physicsWorld{other.m_physicsWorld}, m_rigidBody{other.m_rigidBody}, m_camera{other.m_camera},
	  m_entity{other.m_entity}, m_registry{other.m_registry} {
	other.m_rigidBody = nullptr;
}
Player& Player::operator=(Player&& other) noexcept {
	if (this != &other) {
		Cleanup();
		m_physicsWorld = other.m_physicsWorld;
		m_rigidBody = other.m_rigidBody;
		m_camera = std::move(other.m_camera);
		m_entity = other.m_entity;
		m_registry = other.m_registry;
		other.m_rigidBody = nullptr;
	}
	return *this;
}
void Player::Cleanup() {
	if (!m_rigidBody) return;
	m_rigidBody = nullptr;
	m_registry.get().destroy(m_entity);
}

void Player::Update(float dt) {
	UpdateInput(dt);
}
void Player::UpdateCameraAfterPhysics() const {
	btTransform transform;
	if (m_rigidBody->getMotionState()) m_rigidBody->getMotionState()->getWorldTransform(transform);
	else transform = m_rigidBody->getWorldTransform();

	m_camera->position = {transform.getOrigin().x(), transform.getOrigin().y() + 15.f, transform.getOrigin().z()};
}
void Player::UpdateInput(float dt) {
	// user data
	auto userData = static_cast<RigidBodyUserData*>(m_rigidBody->getUserPointer());

	// mouse
	glm::vec2 mousePos = Input::GetMousePosition();
	static glm::vec2 lastMousePos = mousePos;
	glm::vec2 mouseDelta = (mousePos - lastMousePos) * mouseSensitivity;
	lastMousePos = mousePos;

	if (Input::IsHeldMouse(SDL_BUTTON_LEFT)) m_camera->Rotate(mouseDelta.x, -mouseDelta.y);

	// keyboard
	glm::vec3 front = m_camera->GetFront();
	if (!fly) {
		front.y = 0;
		front = glm::normalize(front);
	}

	float speed = moveSpeed;
	glm::vec3 velocity{0};
	if (Input::IsHeld(SDL_SCANCODE_LSHIFT)) speed *= 2.f;

	if (Input::IsHeld(SDL_SCANCODE_W)) velocity += front;
	if (Input::IsHeld(SDL_SCANCODE_S)) velocity -= front;
	if (Input::IsHeld(SDL_SCANCODE_A)) velocity -= glm::cross(front, m_camera->GetUp());
	if (Input::IsHeld(SDL_SCANCODE_D)) velocity += glm::cross(front, m_camera->GetUp());
	// normalize velocity to avoid faster diagonal movement
	if (glm::length2(velocity) > 0) {
		velocity = glm::normalize(velocity) * speed * glm::sqrt(dt); // not correct but kinda works independently of fps
	}

	glm::vec3 vertical = m_camera->GetUp() * moveSpeed * 4.f;
	if (fly && Input::IsHeld(SDL_SCANCODE_C)) velocity -= vertical;
	if ((fly || (userData->onGround && TimePoint() - m_lastJump > 250ms)) && Input::IsHeld(SDL_SCANCODE_SPACE)) {
		velocity += vertical;
		m_lastJump.reset();
	}
	if (!userData->onGround) {
		velocity *= 0.5f;
	}

	if (glm::length2(velocity) > 0) {
		if (fly) {
			m_camera->position += velocity * 0.05f;
		}
		else {
			m_rigidBody->activate(true);
			float oldY = m_rigidBody->getLinearVelocity().getY();
			velocity.y += oldY;
			m_rigidBody->setLinearVelocity({velocity.x, velocity.y, velocity.z});
		}
	}
}
