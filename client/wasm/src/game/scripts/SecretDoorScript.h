#pragma once

#include <stdint.h>
#include <string>

#include "../Script.h"

class SecretDoorScript : public Script {
public:
	SecretDoorScript(GameScene& scene);
	~SecretDoorScript() override = default;

	void Update(TimeDuration dt) override;

private:
	GameActions::Listener m_listener;
    std::string m_enteredCode;
	uint8_t m_highlightId = 0;
};
