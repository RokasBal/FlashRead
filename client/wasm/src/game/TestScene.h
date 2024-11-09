#pragma once

#include "../core/Scene.h"
#include "Player.h"

class TestScene : public Scene {
public:
    TestScene();
    ~TestScene() override = default;

    void Update(TimeDuration dt) override;

private:
    Player m_player;
};