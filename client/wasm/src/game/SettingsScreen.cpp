#include "SettingsScreen.h"

#include <array>
#include <span>
#include <utility>
#include <wgleng/rendering/Renderer.h>
#include <wgleng/vendor/imgui/imgui.h>

SettingsScreen::SettingsScreen() {
	m_settings = new RendererSettings();
	m_settingsOld = new RendererSettings();
}
SettingsScreen::~SettingsScreen() {
	delete m_settings;
	delete m_settingsOld;
	m_settings = nullptr;
	m_settingsOld = nullptr;
}

template <typename T>
bool DropdownSetting(const char* settingName, const std::vector<std::pair<std::string, T>>& vals, T& selection) {
	bool changed = false;
	ImGui::Text("%s", settingName);
	ImGui::SameLine();
	ImGui::PushID(999);
	ImGui::PushID(settingName);
	const char* preview = nullptr;
	for (const auto& [name, val] : vals) {
		if (selection == val) {
			preview = name.c_str();
			break;
		}
	}
	if (ImGui::BeginCombo("##c", preview)) {
		for (const auto& [name, val] : vals) {
			const bool selected = selection == val;
			if (ImGui::Selectable(name.c_str(), selected)) {
				selection = val;
				changed = true;
			}
			if (selected) {
				ImGui::SetItemDefaultFocus();
			}
		}
		ImGui::EndCombo();
	}
	ImGui::PopID();
	ImGui::PopID();
	return changed;
}

bool SettingsFXAA(RendererSettings* settings) {
	static const std::vector<std::pair<std::string, RendererSettings::FXAAPreset>> vals = {
		std::pair("Off", RendererSettings::FXAAPreset::OFF),
		std::pair("Low", RendererSettings::FXAAPreset::LOW),
		std::pair("High", RendererSettings::FXAAPreset::HIGH)
	};
	return DropdownSetting("FXAA    ", vals, settings->fxaa);
}
bool SettingsShadows(RendererSettings* settings) {
	static const std::vector<std::pair<std::string, RendererSettings::ShadowPreset>> vals = {
		std::pair("Off", RendererSettings::ShadowPreset::OFF),
		std::pair("Low", RendererSettings::ShadowPreset::LOW),
		std::pair("Medium", RendererSettings::ShadowPreset::MEDIUM),
		std::pair("High", RendererSettings::ShadowPreset::HIGH)
	};
	return DropdownSetting("Shadows ", vals, settings->shadows);
}
bool SettingsOutlines(RendererSettings* settings) {
	static const std::vector<std::pair<std::string, RendererSettings::OutlinePreset>> vals = {
		std::pair("Off", RendererSettings::OutlinePreset::OFF),
		std::pair("On", RendererSettings::OutlinePreset::ON)
	};
	return DropdownSetting("Outlines", vals, settings->outlines);
}

void SettingsScreen::SetShown(bool shown) {
	m_shown = shown;
	m_fetchSettings = true;
}
void SettingsScreen::Draw(Renderer* renderer) {
	if (!m_shown) return;
	if (m_fetchSettings) {
		m_fetchSettings = false;
		*m_settings = renderer->GetSettings();
		*m_settingsOld = *m_settings;
	}
 	
	ImGui::PushStyleColor(ImGuiCol_WindowBg, ImVec4{0, 0, 0, 0.8f});
	const auto& io = ImGui::GetIO();
	ImGui::SetNextWindowSize(io.DisplaySize);
	ImGui::SetNextWindowPos({0, 0});
	if (ImGui::Begin("SettingsBackground", nullptr, ImGuiWindowFlags_NoCollapse | ImGuiWindowFlags_NoMove |
		ImGuiWindowFlags_NoDecoration | ImGuiWindowFlags_NoResize)) {
		ImGui::SetNextWindowPos(ImVec2(io.DisplaySize.x * 0.5f, io.DisplaySize.y * 0.5f),
			ImGuiCond_Always, ImVec2(0.5f, 0.5f));
		if (ImGui::BeginChild(1, {0, 0}, ImGuiChildFlags_AlwaysAutoResize |
			ImGuiChildFlags_AutoResizeX | ImGuiChildFlags_AutoResizeY,
			ImGuiWindowFlags_NoCollapse | ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoDecoration |
			ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoBackground)) {
			SettingsFXAA(m_settings);
			SettingsShadows(m_settings);
			SettingsOutlines(m_settings);
			renderer->SetSettings(*m_settings, false);

			if (ImGui::Button("Save")) {
				*m_settingsOld = *m_settings;
				renderer->SetSettings(*m_settings, true);
			}
			ImGui::SameLine();
			if (ImGui::Button("Close")) {
				*m_settings = *m_settingsOld;
				renderer->SetSettings(*m_settings, false);
				m_shown = false;
			}
		}
		ImGui::EndChild();
	}
	ImGui::End();
	ImGui::PopStyleColor();
}
