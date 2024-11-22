#pragma once

#include <wgleng/util/Timer.h>

#include "GameScene.h"

class Script {
public:
	Script(GameScene& scene) : scene(scene) {}
	virtual ~Script() = default;
	virtual void Update(TimeDuration dt) = 0;

	void MarkForDestruction() {
		m_markedForDestruction = true;
	}
	bool IsMarkedForDestruction() const {
		return m_markedForDestruction;
	}

protected:
	GameScene& scene;

private:
	bool m_markedForDestruction = false;
};
