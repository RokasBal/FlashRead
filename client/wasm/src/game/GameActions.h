#pragma once

#include <wgleng/core/Actions.h>

enum class Action {
	PickUp,
	Throw,
	Interact,
	ActionCount
};

using GameActions = Actions<Action, static_cast<size_t>(Action::ActionCount)>;