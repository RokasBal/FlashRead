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

# app
add_executable(wasmgame ${SRC_FILES})
set_target_properties(wasmgame PROPERTIES OUTPUT_NAME "wasmInterface")

# deps
if (CMAKE_BUILD_TYPE STREQUAL "Debug")
    set(WGLENG_SHADER_HOT_RELOAD ON CACHE BOOL "use WGLENG_SHADER_HOT_RELOAD")
    set(WGLENG_PROFILING ON CACHE BOOL "use WGLENG_PROFILING")
else ()
    set(WGLENG_SHADER_HOT_RELOAD OFF CACHE BOOL "use WGLENG_SHADER_HOT_RELOAD")
    set(WGLENG_PROFILING OFF CACHE BOOL "use WGLENG_PROFILING")
endif()
add_subdirectory(${DEPS_LOC}/wgleng)
target_link_libraries(wasmgame PUBLIC wgleng)
target_include_directories(wasmgame PUBLIC ${DEPS_LOC}/wgleng/src)

# final
target_compile_options(wasmgame PRIVATE ${WGLENG_COMP_OPT})
target_link_options(wasmgame PRIVATE ${WGLENG_LINK_OPT})