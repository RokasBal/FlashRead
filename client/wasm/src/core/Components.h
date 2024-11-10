#pragma once

#include <btBulletDynamicsCommon.h>
#include <entt/entt.hpp>
#include <glm/glm.hpp>
#include <string>

#include "../rendering/Mesh.h"

struct MeshComponent {
	Mesh mesh;
	glm::vec3 position;
	glm::vec3 rotation;
	glm::vec3 scale{ 1 };
	uint8_t highlightId{ 0 };
};

struct TransformComponent {
	glm::vec3 position;
	glm::vec3 rotation;
	glm::vec3 scale{1};
};

struct RigidBodyComponent {
	btRigidBody* body;
};

struct TagComponent {
	std::string tag;
};

struct PlayerComponent {};
