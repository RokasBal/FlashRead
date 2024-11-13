import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Mode3Page from '../../pages/mode3/mode3Page';
import { vi } from 'vitest';
import { loadWasmModule } from '../../pages/mode3/wasmLoader';

vi.mock('../../pages/mode3/wasmLoader', () => ({
    loadWasmModule: vi.fn().mockResolvedValue({
        start: vi.fn(),
        stop: vi.fn(),
        setHidden: vi.fn(),
        setFocused: vi.fn(),
    }),
}));

describe('Mode3Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders Mode3Page components', async () => {
        render(
            <MemoryRouter>
                <Mode3Page />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('W')).toBeInTheDocument();
            expect(screen.getByText('A')).toBeInTheDocument();
            expect(screen.getByText('S')).toBeInTheDocument();
            expect(screen.getByText('D')).toBeInTheDocument();
            expect(screen.getByText('Shift')).toBeInTheDocument();
            expect(screen.getByText('*')).toBeInTheDocument();
            expect(screen.getByText('Return')).toBeInTheDocument();
        });
    });
});