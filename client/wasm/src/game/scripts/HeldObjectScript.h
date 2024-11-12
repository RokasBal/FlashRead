#pragma once

#include <stdint.h>

#include "../Script.h"

class HeldObjectScript : public Script {
public:
	HeldObjectScript(GameScene& scene);
	~HeldObjectScript() override = default;

	void Update(TimeDuration dt) override;

private:
	GameActions::Listener m_pickupListener;
	GameActions::Listener m_throwListener;
	bool m_shouldPickup = false;
	uint8_t m_highlightId = 0;
};