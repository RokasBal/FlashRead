# Some controls:
CTRL + P - reload shaders
CTRL + O - show collision shapes
CTRL + I - show wireframe
CTRL + U - show frametime
L - exit editor, start game


# To create .cpp files from .obj:
```
make
```
# To create wasm module and bindings:
`Debug` allows shader hot reloading, saving scenes. Needs `debug_api.py` to be running.
```
mkdir build
cd build
emcmake cmake -DCMAKE_BUILD_TYPE=Debug|Release ..
cmake --build .
```