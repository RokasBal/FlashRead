import { describe, it, expect, vi } from 'vitest';
import { loadWasmModule } from '../../pages/mode3/wasmLoader';
import MainModuleFactory, { MainModule } from '../../../wasm/interface/wasmInterface';

// Mock MainModuleFactory
vi.mock('../../../wasm/interface/wasmInterface', () => ({
  default: vi.fn(),
}));

describe('wasmLoader', () => {
  it('should load the WASM module successfully', async () => {
    const mockModule = {} as MainModule;
    (MainModuleFactory as vi.Mock).mockResolvedValue(mockModule);

    const result = await loadWasmModule();

    expect(result).toBe(mockModule);
    expect(MainModuleFactory).toHaveBeenCalled();
  });

  it('should handle errors when loading the WASM module', async () => {
    const error = new Error('Failed to load WASM module');
    (MainModuleFactory as vi.Mock).mockRejectedValue(error);

    await expect(loadWasmModule()).rejects.toThrow('Failed to load WASM module');
    expect(MainModuleFactory).toHaveBeenCalled();
  });
});