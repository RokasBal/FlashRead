#include <wgleng/core/EntryPoint.h>
#include <wgleng/vendor/imgui/imgui.h>
#include <wgleng/io/Input.h>
#include <wgleng/rendering/Debug.h>

#include "game/GameScene.h"

WGLENG_INIT_ENGINE

void onInit(Context* ctx) {
	ctx->scene = std::make_shared<GameScene>();
}
void onDeinit(Context* ctx) {
	ctx->scene.reset();
}
void onTick(Context* ctx, TimeDuration dt) {
	// debug input
	if (Input::IsHeld(SDL_SCANCODE_LCTRL) && Input::JustPressed(SDL_SCANCODE_O)) {
		if (DebugDraw::IsEnabled()) DebugDraw::Disable();
		else DebugDraw::Enable();
	}
	if (Input::IsHeld(SDL_SCANCODE_LCTRL) && Input::JustPressed(SDL_SCANCODE_P)) ctx->renderer.ReloadShaders();

	// get frametime
	static bool showFrametime = false;
	static float frametimeAccum = 0;
	static float frametime = 0;
	static TimePoint lastFrametimeUpdate = TimePoint();
	TimePoint now;
	static int frames = 0;
	if (Input::IsHeld(SDL_SCANCODE_LCTRL) && Input::JustPressed(SDL_SCANCODE_U)) showFrametime = !showFrametime;
	if (showFrametime) {
		if (now - lastFrametimeUpdate > 250ms) {
			frametime = frametimeAccum / static_cast<float>(frames);
			frametimeAccum = 0;
			frames = 0;
			lastFrametimeUpdate = now;
		}
		ImGui::PushStyleColor(ImGuiCol_WindowBg, ImVec4{0, 0, 0, 0.2});
		if (ImGui::Begin("Frametime", &showFrametime, ImGuiWindowFlags_AlwaysAutoResize | ImGuiWindowFlags_NoCollapse |
			ImGuiWindowFlags_NoDecoration | ImGuiWindowFlags_NoResize)) {
			ImGui::Text("Frametime: %.3f ms", frametime);
		}
		ImGui::End();
		ImGui::PopStyleColor();
		frametimeAccum += dt.fMilli();
		frames++;
	}
}