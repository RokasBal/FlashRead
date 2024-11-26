#include "ModelInit.h"

#include <wgleng/rendering/Mesh.h>

#include "../meshes/candle.h"
#include "../meshes/chair.h"
#include "../meshes/closedBook.h"
#include "../meshes/emptyBookshelf.h"
#include "../meshes/fullBookshelf.h"
#include "../meshes/lectern.h"
#include "../meshes/openBook.h"
#include "../meshes/pencil.h"
#include "../meshes/table.h"
#include "../meshes/globe.h"

// DO NOT CHANGE THE ORDER OF MESHES, it will break saved scenes
#define XFUNC(func) \
    func(candle); \
    func(chair); \
    func(closedBook); \
    func(emptyBookshelf); \
    func(fullBookshelf); \
    func(lectern); \
    func(openBook); \
    func(pencil); \
    func(table); \
    func(globe);

void LoadModels(SceneBuilder& sceneBuilder) {
    #define LOAD_MESH(name) do { \
        Mesh mesh = MeshRegistry::Create(#name); \
        mesh->Load(name##_vertices, name##_materials, name##_indices); \
        sceneBuilder.AddModel(#name); \
    } while(0)

    MeshRegistry::Clear();
	XFUNC(LOAD_MESH)
}
void ReloadModels(bool showWireframe) {
	#define RELOAD_MESH(name) do { \
        Mesh mesh = MeshRegistry::Get(#name); \
        mesh->Load(name##_vertices, name##_materials, name##_indices, true, showWireframe); \
    } while(0)

	XFUNC(RELOAD_MESH)
}
