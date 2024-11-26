#pragma once

#include <functional>
#include <string_view>
#include <wgleng/core/KeyMapper.h>
#include <wgleng/core/Scene.h>
#include <wgleng/util/Timer.h>

#include "GameActions.h"
#include "Player.h"

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

	void SetControlHintHandler(const std::function<void(std::string_view)>& handler) {
		m_controlHint = handler;
	}
	void AddControlHint(std::string_view hint) const {
		m_controlHint(hint);
	}

	GameActions actions;
	Player player;
	MainScript* mainScript;
	KeyMapper keyMapper;

private:
	std::function<void(std::string_view)> m_controlHint = [](std::string_view){};
};
