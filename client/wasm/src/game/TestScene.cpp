#include "TestScene.h"

#include "../io/Input.h"
#include "../core/Components.h"
#include "ModelInit.h"

#include "../scenes/world1.h"

TestScene::TestScene()
    : m_player(m_physicsWorld, {0, 5, 0}) {
    SetCamera(m_player.GetCamera());

    LoadModels(m_sceneBuilder);

    #ifndef SHADER_HOT_RELOAD
        m_sceneBuilder.Load(world1_stateCount, world1_states);
    #endif
}

void TestScene::Update(TimeDuration dt) {
    // "garbage collector"
    static TimePoint lastPhysicsUpdate; TimePoint now;
    if (now - lastPhysicsUpdate > 1s) {
        m_physicsWorld.Update();
        lastPhysicsUpdate = now;
    }

    // scene builder
    m_sceneBuilder.Update();
    if (Input::JustPressed(SDL_SCANCODE_L)) {
        m_sceneBuilder.Play();
        if (m_sceneBuilder.IsPlaying()) {
            m_player = std::move(Player(m_physicsWorld, {0, 5, 0}));
            SetCamera(m_player.GetCamera());
        }
    }
    
    // player movement
    m_player.fly = !m_sceneBuilder.IsPlaying();
    m_player.Update(dt.fMilli());

    // dont update if scene is not playing
    if (!m_sceneBuilder.IsPlaying()) return;

    // logic

    // physics
    auto& dynamicsWorld = m_physicsWorld.dynamicsWorld;
    dynamicsWorld->stepSimulation(1, 1, dt.fSec() * 2.0); // this makes physics have the same speed at low fps, but makes it unstable
    m_physicsWorld.CheckObjectsTouchingGround();

    // camera
    m_player.UpdateCameraAfterPhysics();

    // debug 
    if (Input::JustPressed(SDL_SCANCODE_T)) {
        Mesh mesh = MeshRegistry::Get("pencil");
        auto shape = m_physicsWorld.GetCapsuleCollider(0.5f, 1.0f);
        for (int i = 0; i < 100; i++) {
            auto body = m_physicsWorld.CreateRigidBody(shape, 1.0f, m_player.GetCamera()->position + glm::vec3{0, 100, 0}, {0, 0, 0});
            
            auto entity = registry.create();
            registry.emplace<RigidBodyComponent>(entity, RigidBodyComponent{body});
            registry.emplace<MeshComponent>(entity, MeshComponent{mesh});
        }
    }
}