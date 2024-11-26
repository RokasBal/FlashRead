#include <wgleng/core/EntryPoint.h>
#include <wgleng/io/Input.h>
#include <wgleng/rendering/Debug.h>
#include <wgleng/vendor/imgui/imgui.h>

#include "game/GameScene.h"
#include "game/ModelInit.h"
#include "game/SettingsScreen.h"
#include "wgleng/util/Metrics.h"

WGLENG_INIT_ENGINE

SettingsScreen* settingsScreen;

void onInit(Context* ctx) {
	settingsScreen = new SettingsScreen();
	ctx->scene = std::make_shared<GameScene>();
}
void onDeinit(Context* ctx) {
	ctx->scene.reset();
	delete settingsScreen;
	settingsScreen = nullptr;
}
void onTick(Context* ctx, TimeDuration dt) {
	// debug input
	if (Input::IsHeld(SDL_SCANCODE_LCTRL)) {
		if (Input::JustPressed(SDL_SCANCODE_P)) {
			ctx->renderer.ReloadShaders();
		}
		if (Input::JustPressed(SDL_SCANCODE_O)) {
			if (DebugDraw::IsEnabled()) DebugDraw::Disable();
			else DebugDraw::Enable();
		}
		if (Input::JustPressed(SDL_SCANCODE_I)) {
			const bool show = !ctx->renderer.IsWireframeShown();
			ctx->renderer.ShowWireframe(show);
			ReloadModels(show);
		}
		if (Input::JustPressed(SDL_SCANCODE_U)) {
			if (Metrics::IsEnabled(Metric::ALL_METRICS)) Metrics::Disable(Metric::ALL_METRICS);
			else Metrics::Enable(Metric::ALL_METRICS);
		}
	} else {
		if (Input::JustPressed(SDL_SCANCODE_P)) {
			settingsScreen->SetShown(!settingsScreen->IsShown());
		}
	}
	settingsScreen->Draw(&ctx->renderer);
}
