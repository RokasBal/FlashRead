#include "TestScene.h"

#include "../io/Input.h"
#include "../core/Components.h"
#include "../rendering/Mesh.h"

#include "../meshes/candle.h"
#include "../meshes/chair.h"
#include "../meshes/closedBook.h"
#include "../meshes/emptyBookshelf.h"
#include "../meshes/fullBookshelf.h"
#include "../meshes/lectern.h"
#include "../meshes/openBook.h"
#include "../meshes/pencil.h"
#include "../meshes/table.h"
#include "../meshes/globe.h"

#define LOAD_MESH(name) do { \
    Mesh mesh = MeshRegistry::Create(#name); \
    mesh->Load(name##_vertexCount, name##_vertices, name##_materialCount, name##_materials); \
    m_sceneBuilder.AddModel(#name); \
} while(0)

TestScene::TestScene()
    : m_player(m_physicsWorld, {0, 5, 0}) {
    SetCamera(m_player.GetCamera());

    LOAD_MESH(candle);
    LOAD_MESH(chair);
    LOAD_MESH(closedBook);
    LOAD_MESH(emptyBookshelf);
    LOAD_MESH(fullBookshelf);
    LOAD_MESH(lectern);
    LOAD_MESH(openBook);
    LOAD_MESH(pencil);
    LOAD_MESH(table);
    LOAD_MESH(globe);

// #ifndef SHADER_HOT_RELOAD
//     m_sceneBuilder.Load(testscene_stateCount, testscene_states);
// #endif

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
    dynamicsWorld->stepSimulation(dt.fMilli(), 1);
    m_physicsWorld.CheckObjectsTouchingGround();

    // camera
    m_player.UpdateCameraAfterPhysics();

    // random stuff
    // create entity
    if (Input::IsHeld(SDL_SCANCODE_B)) {
        auto rabbit = registry.create();
        // attach mesh
        Mesh mesh = MeshRegistry::Get("candle");
        registry.emplace<MeshComponent>(rabbit, MeshComponent{mesh});
        // attach rigid body
        const auto& boxCol = m_physicsWorld.GetBoxCollider({2, 2, 2});
        auto rb = m_physicsWorld.CreateRigidBody(boxCol, 10.f, {0, 1000, 0}, {0, 0, 0});
        registry.emplace<RigidBodyComponent>(rabbit, RigidBodyComponent{rb});
    }
}