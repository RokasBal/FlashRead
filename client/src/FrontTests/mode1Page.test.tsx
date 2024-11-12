import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Mode1Page from '../pages/mode1/mode1Page';
import { AuthProvider } from '../context/AuthContext';
import { VisualSettingsProvider } from '../context/VisualSettingsContext';
import * as mode1Task from '../pages/mode1/mode1Task';
import { vi } from 'vitest';

vi.mock('../pages/mode1/mode1Task');

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <AuthProvider>
            <VisualSettingsProvider>
                <MemoryRouter initialEntries={[route]}>
                    <Routes>
                        <Route path="/" element={ui} />
                        <Route path="/home" element={<div>Home Page</div>} />
                    </Routes>
                </MemoryRouter>
            </VisualSettingsProvider>
        </AuthProvider>
    );
};

describe('Mode1Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders Mode1Page components', async () => {
        renderWithRouter(<Mode1Page />);
        await waitFor(() => {
            const elements = screen.getAllByText('Theme:');
            expect(elements[0]).toBeInTheDocument();
            const difficulties = screen.getAllByText('Difficulty:');
            expect(difficulties[0]).toBeInTheDocument();
            expect(screen.getByLabelText('Timer:')).toBeInTheDocument();
            expect(screen.getByText('Return')).toBeInTheDocument();
        });
    });

    test('navigates to home page on Return button click', async () => {
        renderWithRouter(<Mode1Page />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Return'));
            expect(screen.getByText('Home Page')).toBeInTheDocument();
        });
    });

    test('starts the task on Start button click', async () => {
        vi.mocked(mode1Task.requestTask1Data).mockResolvedValue({
            text: 'Sample text',
            questions: [],
            statistics: { correct: 0, total: 0, wpm: 0, score: 0 },
        });

        renderWithRouter(<Mode1Page />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Start'));
        });

        await waitFor(() => {
            expect(mode1Task.requestTask1Data).toHaveBeenCalled();
            expect(screen.getByText('S')).toBeInTheDocument();
        });
    });

    test('stops the task on Stop button click', async () => {
        renderWithRouter(<Mode1Page />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Start'));
        });
        await waitFor(() => {
            fireEvent.click(screen.getByText('Stop'));
        });

        await waitFor(() => {
            expect(screen.queryByText('Sample text')).not.toBeInTheDocument();
            expect(screen.getByText('Confirm')).toBeInTheDocument();
        });
    });

    test('confirms the task on Confirm button click', async () => {
        vi.mocked(mode1Task.submitTask1Answers).mockResolvedValue({
            answers: [],
            statistics: { correct: 0, total: 0, wpm: 0, score: 0 },
        });

        renderWithRouter(<Mode1Page />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Start'));
        });
        await waitFor(() => {
            fireEvent.click(screen.getByText('Stop'));
        });
        await waitFor(() => {
            fireEvent.click(screen.getByText('Confirm'));
        });

        await waitFor(() => {
            expect(mode1Task.submitTask1Answers).toHaveBeenCalled();
            expect(screen.getByText('Correct answers:')).toBeInTheDocument();
        });
    });

    test('restarts the task on Again button click', async () => {
        renderWithRouter(<Mode1Page />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Start'));
        });
        await waitFor(() => {
            fireEvent.click(screen.getByText('Stop'));
        });
        await waitFor(() => {
            fireEvent.click(screen.getByText('Confirm'));
        });
        await waitFor(() => {
            fireEvent.click(screen.getByText('Again'));
        });

        await waitFor(() => {
            expect(screen.getByText('Start')).toBeInTheDocument();
        });
    });
});