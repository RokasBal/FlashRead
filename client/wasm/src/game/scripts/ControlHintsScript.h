#pragma once

#include <string>
#include <vector>

#include "../Script.h"

class ControlHintsScript : public Script {
public:
	ControlHintsScript(GameScene& scene);
	~ControlHintsScript() override = default;

	void Update(TimeDuration dt) override;

private:
	std::vector<std::string> m_controlHints;
	std::vector<std::shared_ptr<DrawableText>> m_controlHintTexts;
	uint8_t m_highlightId = 0;
};
