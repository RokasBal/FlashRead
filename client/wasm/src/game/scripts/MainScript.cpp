#include "MainScript.h"

#include "ControlHintsScript.h"
#include "HeldObjectScript.h"
#include "ObjectInteractScript.h"
#include "SecretDoorScript.h"

MainScript::MainScript(GameScene& scene)
	: Script(scene) {
	m_scripts.push_back(std::make_unique<HeldObjectScript>(scene));
	m_scripts.push_back(std::make_unique<ObjectInteractScript>(scene));
	m_scripts.push_back(std::make_unique<SecretDoorScript>(scene));
	m_scripts.push_back(std::make_unique<ControlHintsScript>(scene));
}

void MainScript::Update(TimeDuration dt) {
	for (std::size_t i = 0; i < m_scripts.size(); i++) {
		if (m_scripts[i]->IsMarkedForDestruction()) {
			std::swap(m_scripts[i], m_scripts.back());
			m_scripts.pop_back();
			i--;
			continue;
		}
		m_scripts[i]->Update(dt);
	}
}
