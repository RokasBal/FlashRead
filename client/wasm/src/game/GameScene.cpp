#include "GameScene.h"

#include <wgleng/io/Input.h>
#include <wgleng/core/Components.h>
#include <wgleng/core/EntityCreator.h>
#include <wgleng/rendering/Debug.h>
#include <wgleng/rendering/Highlights.h>
#include "ModelInit.h"
#include "Script.h"
#include "scripts/MainScript.h"

#include "../scenes/world1.h"

GameScene::GameScene()
    : player(registry, m_physicsWorld, { 0, 5, 0 }) {
    SetCamera(player.GetCamera());

    LoadModels(m_sceneBuilder);

    #ifndef SHADER_HOT_RELOAD
        m_sceneBuilder.Load(world1_stateCount, world1_states);
    #endif

	mainScript = new MainScript(*this);

    keyMapper.AddMapping().PressKey(SDL_SCANCODE_F).Then([&] {
        actions.Trigger(Action::PickUp);
    });
	keyMapper.AddMapping().PressMouse(SDL_BUTTON_RIGHT).Then([&] {
		actions.Trigger(Action::Throw);
	});
	keyMapper.AddMapping().PressKey(SDL_SCANCODE_E).Then([&] {
        actions.Trigger(Action::Interact);
    });
}

GameScene::~GameScene() {
    delete mainScript;
}

void GameScene::Update(TimeDuration dt) {
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
            player = std::move(Player(registry, m_physicsWorld, {0, 5, 0}));
            SetCamera(player.GetCamera());
        }
    }

    // player movement
    player.fly = !m_sceneBuilder.IsPlaying();
    player.Update(dt.fMilli());

    // dont update if scene is not playing
    if (!m_sceneBuilder.IsPlaying()) return;

    keyMapper.Update();

    // physics
    m_physicsWorld.dynamicsWorld->stepSimulation(1, 1, dt.fSec() * 2.0); // this makes physics have the same speed at low fps, but makes it unstable
    m_physicsWorld.CheckObjectsTouchingGround();

    // camera
    player.UpdateCameraAfterPhysics();

    // run scripts
	mainScript->Update(dt);
}
