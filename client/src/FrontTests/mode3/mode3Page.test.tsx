import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Mode3Page from '../../pages/mode3/mode3Page';
import { vi } from 'vitest';
import { loadWasmModule } from '../../pages/mode3/wasmLoader';
import axios from '../../components/axiosWrapper';
import { checkDoorCodeAsync, getBookHintsAsync, saveTimeTakenAsync } from '../../pages/mode3/mode3Page';

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

    test('checkDoorCodeAsync function', async () => {
        const taskRef = { current: 1 };
        const code = '1234';
        const mockResponse = { data: { data: { isCorrect: true } } };
        axios.post.mockResolvedValue(mockResponse);
    
        let result = await checkDoorCodeAsync(taskRef, code);
        expect(axios.post).toHaveBeenCalledWith('/api/CheckSecretDoorCode', {
            taskVersion: taskRef.current,
            data: { code: code },
        });
        expect(result).toBe(true);
    });

    test('getBookHintsAsync function', async () => {
        const taskRef = { current: 1 };
        const mockResponse = { data: { data: { hints: ['hint1', 'hint2'] } } };
        axios.post.mockResolvedValue(mockResponse);
    
        let result = await getBookHintsAsync(taskRef, 2);
        expect(result).toEqual(['hint1', 'hint2']);
    });

    test('saveTimeTakenAsync function', async () => {
        axios.post.mockResolvedValue({});

        render(
            <MemoryRouter>
                <Mode3Page />
            </MemoryRouter>
        );

        await saveTimeTakenAsync(120);
        expect(axios.post).toHaveBeenCalledWith('/api/SaveTask3TimeTaken?seconds=120');
    });

    test('checkDoorCode function', async () => {
        (window as any).checkDoorCode('1234');
    });
    test('getBookHints function', async () => {
        (window as any).getBookHints(3);
    });
    test('winGame function', async () => {
        (window as any).winGame(42);
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