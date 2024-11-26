#pragma once

#include <stdint.h>
#include <string>
#include <wgleng/util/Timer.h>

#include "../Script.h"

class SecretDoorScript : public Script {
public:
	SecretDoorScript(GameScene& scene);
	~SecretDoorScript() override = default;

	void Update(TimeDuration dt) override;

private:
	void Win();

	bool m_won = false;
	TimePoint m_startTime{};
	TimePoint m_endTime{};
	std::shared_ptr<DrawableText> m_timerText;
	GameActions::Listener m_listener;
	GameActions::Listener m_winGameListener;
	std::string m_enteredCode;
	uint8_t m_highlightId = 0;
	uint8_t m_goldenHighlightId = 0;
	bool m_initBookHints = true;
};
