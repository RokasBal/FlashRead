#pragma once

#include "../core/Scene.h"
#include "../util/Timer.h"
#include "GameActions.h"
#include "Player.h"
#include "../core/KeyMapper.h"

class MainScript;

class GameScene final : public Scene {
public:
	GameScene();
	~GameScene() override;
	GameScene(const GameScene&) = delete;
	GameScene& operator=(const GameScene&) = delete;
	GameScene(GameScene&&) = delete;
	GameScene& operator=(GameScene&&) = delete;

	void Update(TimeDuration dt) override;

	GameActions actions;
	Player player;
	MainScript* mainScript;
	KeyMapper keyMapper;
};
