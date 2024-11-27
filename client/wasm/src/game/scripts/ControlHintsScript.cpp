#include "ControlHintsScript.h"

#include <wgleng/rendering/Highlights.h>

ControlHintsScript::ControlHintsScript(GameScene& scene)
	: Script(scene) {
	m_highlightId = Highlights::GetHighlightId("white");
	scene.SetControlHintHandler([this](std::string_view hint) {
		m_controlHints.emplace_back(hint);
		});
}

void ControlHintsScript::Update(TimeDuration dt) {
	constexpr float textScale = 0.025f;
	m_controlHintTexts.clear();
	glm::vec2 maxSize{0};
	for (const auto& hint : m_controlHints) {
		auto text = Text::CreateText("arial-big", std::format("$<{}>", m_highlightId) + hint);
		scene.AddText(text);
		m_controlHintTexts.push_back(text);

		const auto textSize = text->GetTextSize() * textScale;
		maxSize = glm::max(maxSize, textSize);
	}

	float currentHeight = 0.01;
	for (const auto& text : m_controlHintTexts) {
		text->scale = glm::vec3{textScale};
		text->position = {1.0 - maxSize.x - 0.01, currentHeight, 0.0};
		text->normalizedCoordinates = true;
		currentHeight += maxSize.y + 0.01;
	}

	m_controlHints.clear();
}
