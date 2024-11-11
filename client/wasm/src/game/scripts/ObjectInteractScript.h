#pragma once

#include "../Script.h"

struct TransformComponent;
class ObjectInteractScript : public Script {
public:
	ObjectInteractScript(GameScene& scene);
	~ObjectInteractScript() override = default;

	void Update(TimeDuration dt) override;

private:
	GameActions::Listener m_listener;

	struct ReadingBookData {
		bool reading{ false };
		entt::entity realBook{ entt::null };
		entt::entity fakeBook{ entt::null };
		TransformComponent* fakeBookTransform{ nullptr };
	} m_readingData;
	void StartReading(entt::entity book);
	void StopReading();
	void UpdateReading() const;
};
