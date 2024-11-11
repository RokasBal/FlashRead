#include <stdio.h>

#include <emscripten.h>
#include <emscripten/bind.h>

#include "Context.h"
#include "io/Input.h"
#include "game/GameScene.h"
#include "rendering/Mesh.h"
#include "rendering/Debug.h"
#include "rendering/Highlights.h"
#include "util/Timer.h"
#include "vendor/imgui/imgui.h"
#include "vendor/imgui/imgui_impl_sdl2.h"
#include "vendor/imgui/imgui_impl_opengl3.h"

Context* ctx = nullptr;
bool isHidden = false;

void mainLoop() {
	// timing
	static auto lastTime = TimePoint();
	const auto now = TimePoint();
	const auto dt = now - lastTime;
	lastTime = now;

	// start imgui frame
	ImGui_ImplOpenGL3_NewFrame();
	ImGui_ImplSDL2_NewFrame();
	ImGui::NewFrame();

	// input
	Input::Poll(false);
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

	// logic
	if (ctx->scene) ctx->scene->Update(dt);

	// rendering
	ctx->renderer.SetViewportSize(ctx->rt.width, ctx->rt.height);
	ctx->renderer.Render(isHidden, ctx->scene);
	ctx->rt.SwapBuffers();
}
void initialize() {
	// create context
	if (ctx != nullptr) {
		printf("Context already exists.\n");
		return;
	}
	Highlights::Init();
	ctx = new Context();
	if (!ctx->rt.IsValid()) {
		printf("Failed to create render target.\n");
		delete ctx;
		Highlights::Deinit();
		return;
	}
	DebugDraw::Init();

	// create scene (TODO: offload to game logic or something)
	ctx->scene = std::make_shared<GameScene>();
}
void deinitialize() {
	DebugDraw::Deinit();
	MeshRegistry::Clear();
	delete ctx;
	ctx = nullptr;
	Highlights::Deinit();
}

// embind stuff
bool start() {
	initialize();
	emscripten_set_main_loop(mainLoop, 0, 1);
	return true;
}
void stop() {
	deinitialize();
	emscripten_cancel_main_loop();
}
void setFocused(bool focused) {
	if (ctx == nullptr) return;
	ctx->rt.SetFocused(focused);
}
void setHidden(bool hidden) {
	if (ctx == nullptr) return;
	if (hidden == isHidden) return;

	isHidden = hidden;

	if (isHidden) {
		emscripten_cancel_main_loop();
		emscripten_set_main_loop(mainLoop, 5, 1);
	}
	else {
		emscripten_cancel_main_loop();
		emscripten_set_main_loop(mainLoop, 0, 1);
	}
}

// export functions to JS
EMSCRIPTEN_BINDINGS (my_module) {
	emscripten::function("start", &start);
	emscripten::function("stop", &stop);
	emscripten::function("setFocused", &setFocused);
	emscripten::function("setHidden", &setHidden);
}
