#include "ModelInit.h"

#include "../rendering/Mesh.h"

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

void LoadModels(SceneBuilder& sceneBuilder) {
    #define LOAD_MESH(name) do { \
        Mesh mesh = MeshRegistry::Create(#name); \
        mesh->Load(name##_vertexCount, name##_vertices, name##_materialCount, name##_materials); \
        sceneBuilder.AddModel(#name); \
    } while(0)
    
    MeshRegistry::Clear();
    // DO NOT CHANGE THE ORDER OF MESHES, it will break saved scenes
    LOAD_MESH(candle);
    LOAD_MESH(chair);
    LOAD_MESH(closedBook);
    LOAD_MESH(emptyBookshelf);
    LOAD_MESH(fullBookshelf);
    LOAD_MESH(lectern);
    LOAD_MESH(openBook);
    LOAD_MESH(pencil);
    LOAD_MESH(table);
    LOAD_MESH(globe);
}