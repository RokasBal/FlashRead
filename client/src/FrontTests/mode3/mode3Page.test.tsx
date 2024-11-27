import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Mode3Page from '../../pages/mode3/mode3Page';
import { vi } from 'vitest';
import { loadWasmModule } from '../../pages/mode3/wasmLoader';
import axios from '../../components/axiosWrapper';

vi.mock('../../pages/mode3/wasmLoader', () => ({
    loadWasmModule: vi.fn().mockResolvedValue({
        start: vi.fn(),
        stop: vi.fn(),
        setHidden: vi.fn(),
        setFocused: vi.fn(),
        checkDoorCodeResponse: vi.fn(),
        setBookHints: vi.fn(),
        StringList: vi.fn().mockImplementation(() => ({
            push_back: vi.fn(),
        })),
    }),
}));

vi.mock('../../components/axiosWrapper', () => {
    const actual = vi.importActual('../../components/axiosWrapper');
    return {
        ...actual,
        default: {
            post: vi.fn(),
        },
    };
});

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

    test('saveTimeTakenAsync function', async () => {
        axios.post.mockResolvedValue({});

        render(
            <MemoryRouter>
                <Mode3Page />
            </MemoryRouter>
        );

        const saveTimeTaken = (window as any).winGame;
        await saveTimeTaken(120);
        expect(axios.post).toHaveBeenCalledWith('/api/SaveTask3TimeTaken?seconds=120');
    });

    test('useOnScreen hook', async () => {
        render(
            <MemoryRouter>
                <Mode3Page />
            </MemoryRouter>
        );

        const canvas = screen.getByRole('presentation');
        expect(canvas).toBeInTheDocument();
    });

    test('useEffect hooks', async () => {
        render(
            <MemoryRouter>
                <Mode3Page />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(loadWasmModule).toHaveBeenCalled();
        });

        const canvas = screen.getByRole('presentation');
        fireEvent.resize(window);
        expect(canvas).toBeInTheDocument();
    });

    test('useEffect hooks for resizing canvas', async () => {
        render(
            <MemoryRouter>
                <Mode3Page />
            </MemoryRouter>
        );

        const canvas = screen.getByRole('presentation');
        expect(canvas).toBeInTheDocument();

        // Simulate window resize
        fireEvent.resize(window);
        await waitFor(() => {
            expect(canvas).toBeInTheDocument();
        });
    });

});