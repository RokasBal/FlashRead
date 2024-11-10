#include "TestScene.h"

#include "../io/Input.h"
#include "../core/Components.h"
#include "../rendering/Debug.h"
#include "../rendering/Highlights.h"
#include "ModelInit.h"

#include "../scenes/world1.h"

TestScene::TestScene()
    : m_player(registry, m_physicsWorld, {0, 5, 0}) {
    SetCamera(m_player.GetCamera());

    LoadModels(m_sceneBuilder);

    #ifndef SHADER_HOT_RELOAD
        m_sceneBuilder.Load(world1_stateCount, world1_states);
    #endif
}

void TestScene::Update(TimeDuration dt) {
    // "garbage collector"
    static TimePoint lastPhysicsUpdate;
	const TimePoint now;
    if (now - lastPhysicsUpdate > 1s) {
        m_physicsWorld.Update();
        lastPhysicsUpdate = now;
    }

    // scene builder
    m_sceneBuilder.Update();
    if (Input::JustPressed(SDL_SCANCODE_L)) {
        m_sceneBuilder.Play();
        if (m_sceneBuilder.IsPlaying()) {
            m_player = std::move(Player(registry, m_physicsWorld, {0, 5, 0}));
            SetCamera(m_player.GetCamera());
        }
    }
    
    // player movement
    m_player.fly = !m_sceneBuilder.IsPlaying();
    m_player.Update(dt.fMilli());

    // dont update if scene is not playing
    if (!m_sceneBuilder.IsPlaying()) return;

    // raycast for item picking
	const glm::vec3 rayFrom = m_player.GetCamera()->position;
	const glm::vec3 rayTo = rayFrom + m_player.GetCamera()->GetFront() * 50.0f;
	const auto hits = m_physicsWorld.RaycastWorld(rayFrom, rayTo, true,
        [](entt::entity entity, const btRigidBody* body, const glm::vec3& hitPos, const glm::vec3& hitNormal) {
            return body->getMass() != 0.f;
        });
	entt::entity firstHitEntity = entt::null;
    static uint8_t highlightId = Highlights::GetHighlightId("white");
	if (!hits.empty()) {
		const auto& firstHit = hits.front();
		firstHitEntity = firstHit.entity;
        if (const auto meshComp = registry.try_get<MeshComponent>(firstHit.entity)) {
            meshComp->highlightId = highlightId;
        }
	}

	// item pickup
	if (Input::JustPressed(SDL_SCANCODE_F)) {
		if (m_player.objectCarry.GetCarriedEntity() == entt::null) m_player.objectCarry.SetCarriedEntity(firstHitEntity);
		else m_player.objectCarry.DropCarriedEntity();
	}
    if (Input::JustPressedMouse(SDL_BUTTON_RIGHT)) {
        m_player.objectCarry.DropCarriedEntity(m_player.GetCamera()->GetFront(), 10.0f);
    }
	m_player.objectCarry.Update(m_player.GetCamera()->position, m_player.GetCamera()->GetFront());

 
    // physics
    m_physicsWorld.dynamicsWorld->stepSimulation(1, 1, dt.fSec() * 2.0); // this makes physics have the same speed at low fps, but makes it unstable
    m_physicsWorld.CheckObjectsTouchingGround();

    // camera
    m_player.UpdateCameraAfterPhysics();

    // debug 
    if (Input::JustPressed(SDL_SCANCODE_T)) {
        Mesh mesh = MeshRegistry::Get("pencil");
        const auto shape = m_physicsWorld.GetCapsuleCollider(0.5f, 1.0f);
        for (int i = 0; i < 100; i++) {
            const auto entity = registry.create();
            const auto body = m_physicsWorld.CreateRigidBody(entity, shape, 1.0f, m_player.GetCamera()->position + glm::vec3{0, 100, 0}, {0, 0, 0});
            
            registry.emplace<RigidBodyComponent>(entity, RigidBodyComponent{body});
            registry.emplace<MeshComponent>(entity, MeshComponent{mesh});
        }
    }
}