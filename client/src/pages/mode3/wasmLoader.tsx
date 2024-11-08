import MainModuleFactory, { MainModule } from '../../../wasm/interface/wasmInterface';

export async function loadWasmModule(): Promise<MainModule> {
    return MainModuleFactory();
}