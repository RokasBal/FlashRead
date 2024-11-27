#pragma once

#include <memory>
#include <vector>

#include "../Script.h"

class MainScript final : public Script {
public:
	MainScript(GameScene& scene);
	~MainScript() override = default;

	void Update(TimeDuration dt) override;

private:
	std::vector<std::unique_ptr<Script>> m_scripts;
};
