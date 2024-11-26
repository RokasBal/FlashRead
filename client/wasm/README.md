# Some controls:
CTRL + P - reload shaders
CTRL + O - show collision shapes
CTRL + I - show wireframe
CTRL + U - show performance metrics
L - enter/exit editor

# dependencies:
- wgleng

# To create wasm module and bindings:
Replace `{target}` with `wasmgame-release` or `wasmgame-debug`  
`wasmgame-debug` allows shader hot reloading, saving scenes. Needs `debug_api.py` to be running.  
```
cmake --preset wasmgame-{target}
cmake --build build/wasmgame-{target}
```