#pragma once

#include <string>

// may not be present
struct BookHintComponent {
    std::string hint;
};

// may not be present
struct GoldenBookComponent {
    bool nothing; // not used. just to disable empty struct optimization in entt
};