#include "GameScene.h"

#include <wgleng/core/Components.h>
#include <wgleng/io/Input.h>

#include "../scenes/firstmap.h"
#include "ModelInit.h"
#include "scripts/MainScript.h"
#include "wgleng/util/Metrics.h"

GameScene::GameScene()
	: player(registry, m_physicsWorld, {0, 5, 0}) {
	SetCamera(player.GetCamera());
	sunlightDir = glm::normalize(glm::vec3{1, 2, 1});

	LoadModels(m_sceneBuilder);

	// #ifndef SHADER_HOT_RELOAD
	m_sceneBuilder.Load(firstmap_stateCount, firstmap_states);
	// #endif

	mainScript = new MainScript(*this);

	keyMapper.AddMapping().PressKey(SDL_SCANCODE_F).Then([&] {
		actions.Trigger(Action::PickUp);
	});
	keyMapper.AddMapping().PressKey(SDL_SCANCODE_Q).Then([&] {
		actions.Trigger(Action::Throw);
	});
	keyMapper.AddMapping().PressKey(SDL_SCANCODE_E).Then([&] {
		actions.Trigger(Action::Interact);
	});

	m_sceneBuilder.Play();
}

GameScene::~GameScene() {
	delete mainScript;
}

void GameScene::Update(TimeDuration dt) {
	// "garbage collector"
	static TimePoint lastPhysicsUpdate;
	const TimePoint now;
	if (now - lastPhysicsUpdate > 5s) {
		m_physicsWorld.CollectGarbageMemory();
		lastPhysicsUpdate = now;
	}

	// scene builder
	m_sceneBuilder.Update();
	if (Input::JustPressed(SDL_SCANCODE_L)) {
		m_sceneBuilder.Play();
		if (m_sceneBuilder.IsPlaying()) {
			player = Player(registry, m_physicsWorld, {0, 5, 0});
			SetCamera(player.GetCamera());
		}
	}

	// for testing purposes create lots of entities
	if (Input::JustPressed(SDL_SCANCODE_T)) {
		auto clshape = m_physicsWorld.GetBoxCollider({ 1, 1, 1 });
		const Mesh meshes[] = {
			MeshRegistry::Get("candle"),
			MeshRegistry::Get("globe"),
		};
		for (int i = 0; i < 50; i++) {
			auto entity = registry.create();
			auto rb = m_physicsWorld.CreateRigidBody(entity, clshape, 100.f,
				player.GetCamera()->position+glm::vec3{0, 100, 0}, {});
			registry.emplace<RigidBodyComponent>(entity, rb);
			registry.emplace<MeshComponent>(entity, meshes[i % 2]);
		}
	}

	// player movement
	player.fly = !m_sceneBuilder.IsPlaying();
	player.Update(dt.fMilli());

	// dont update if scene is not playing
	if (!m_sceneBuilder.IsPlaying()) return;

	keyMapper.Update();

	// scene metrics
	if (Metrics::IsEnabled(Metric::ENTITY_COUNT)) {
		Metrics::SetStaticMetric(Metric::ENTITY_COUNT,
			static_cast<uint64_t>(registry.storage<entt::entity>().size()));
	}

	// physics
	Metrics::MeasureDurationStart(Metric::PHYICS);
	m_physicsWorld.Update(dt);
	player.UpdateCameraAfterPhysics();
	Metrics::MeasureDurationStop(Metric::PHYICS);

	// run scripts
	Metrics::MeasureDurationStart(Metric::SCRIPTS);
	mainScript->Update(dt);
	Metrics::MeasureDurationStop(Metric::SCRIPTS);
}