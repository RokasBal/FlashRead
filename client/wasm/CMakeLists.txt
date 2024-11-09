cmake_minimum_required(VERSION 3.12)
project(wasmgame)
set(CMAKE_CXX_STANDARD 23)

set(SOURCE_LOC src)
set(DEPS_LOC dependencies)
set(OUTPUT_LOC interface)

file(GLOB_RECURSE SRC_FILES CONFIGURE_DEPENDS "${SOURCE_LOC}/*.cpp")
set_property(GLOBAL PROPERTY USE_FOLDERS ON)

set(CMAKE_EXECUTABLE_SUFIX ".wasm")
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/${OUTPUT_LOC})
set(COMMON_COMP_OPT
    --std=c++23
    -sUSE_SDL=2 	
	-DGLM_FORCE_PURE
	-DGLM_ENABLE_EXPERIMENTAL
)
set(COMMON_LINK_OPT
    --emit-tsd wasmInterface.d.ts
    -lembind
    -lSDL2
    -sMODULARIZE=1
    -sEXPORT_ES6=1
    -sENVIRONMENT="web"
    -sMIN_WEBGL_VERSION=2
    -sMAX_WEBGL_VERSION=2
    -sALLOW_MEMORY_GROWTH=1
    -sFILESYSTEM=0
)

# for visual studio
# set(CMAKE_CXX_STANDARD 23)
# include_directories(${EMSCRIPTEN_ROOT_PATH}/system/include)

# app
add_executable(wasmgame ${SRC_FILES})
set_target_properties(wasmgame PROPERTIES OUTPUT_NAME "wasmInterface")

# deps
set(BUILD_BULLET2_DEMOS OFF CACHE BOOL "Build Bullet2 demos")
set(BUILD_EXTRAS OFF CACHE BOOL "Build Bullet Extras")
set(BUILD_UNIT_TESTS OFF CACHE BOOL "Build Bullet Unit Tests")
set(BUILD_CPU_DEMOS OFF CACHE BOOL "Build Bullet CPU Demos")
set(BUILD_OPENGL3_DEMOS OFF CACHE BOOL "Build OpenGL3 Demos")
set(BUILD_ROBOTICS OFF CACHE BOOL "Build Bullet Robotics")
add_subdirectory(${DEPS_LOC}/bullet3)
target_include_directories(wasmgame PRIVATE ${DEPS_LOC}/bullet3/src)

target_include_directories(wasmgame PRIVATE ${DEPS_LOC}/glm/include)
target_include_directories(wasmgame PRIVATE ${DEPS_LOC}/entt/include)
target_link_libraries(wasmgame PRIVATE BulletDynamics BulletCollision LinearMath)

file(GLOB_RECURSE DEPS_FILES_FOR_WARNING_DISABLE CONFIGURE_DEPENDS "${DEPS_LOC}/*" "${SOURCE_LOC}/vendor/*")
set_source_files_properties(
  ${DEPS_FILES_FOR_WARNING_DISABLE}
  PROPERTIES
  COMPILE_FLAGS "..."
)

# flags
if (CMAKE_BUILD_TYPE STREQUAL "Debug")
    message(STATUS "Configuring for Debug build")
    target_compile_options(wasmgame PRIVATE ${COMMON_COMP_OPT}
        -O2
        --profiling
        -DSHADER_HOT_RELOAD
    )
    target_link_options(wasmgame PRIVATE ${COMMON_LINK_OPT}
        -O2
        -sFETCH
        -sASSERTIONS
        --profiling-funcs
    )
elseif (CMAKE_BUILD_TYPE STREQUAL "Release")
    message(STATUS "Configuring for Release build")
    target_compile_options(wasmgame PRIVATE ${COMMON_COMP_OPT}
        -O3
        -flto=full
        -fno-exceptions
        # Cant get no-rtti to work with embind
        # -fno-rtti
        # -DEMSCRIPTEN_HAS_UNBOUND_TYPE_NAMES=0
    )
    target_link_options(wasmgame PRIVATE ${COMMON_LINK_OPT}
        -O3
        -flto=full
        --closure 1
    )
else ()
    message(FATAL_ERROR "Unknown build type. Should be either Debug or Release")
endif ()