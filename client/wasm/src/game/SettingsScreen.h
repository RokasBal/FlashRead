#pragma once

class Renderer;
struct RendererSettings;
class SettingsScreen {
public:
	SettingsScreen();
	~SettingsScreen();
	SettingsScreen(const SettingsScreen&) = delete;
	SettingsScreen& operator=(const SettingsScreen&) = delete;
	SettingsScreen(SettingsScreen&&) = delete;
	SettingsScreen& operator=(SettingsScreen&&) = delete;

	void SetShown(bool shown);
	bool IsShown() const { return m_shown; }
	void Draw(Renderer* renderer);

private:
	bool m_shown = false;
	bool m_fetchSettings = true;
	RendererSettings* m_settings = nullptr;
	RendererSettings* m_settingsOld = nullptr;
};