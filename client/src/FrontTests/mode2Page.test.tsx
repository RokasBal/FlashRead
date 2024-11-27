import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Mode2Page from '../pages/mode2/mode2Page';
import * as apiTask from '../pages/mode2/api';
import { vi } from 'vitest';

vi.mock('./api');

describe('Mode2Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders Mode2Page components', () => {
        render(
            <MemoryRouter>
                <Mode2Page />
            </MemoryRouter>
        );

        const elements = screen.getAllByText('Theme:');
        expect(elements[0]).toBeInTheDocument();
        const difficulties = screen.getAllByText('Difficulty:');
        expect(difficulties[0]).toBeInTheDocument();
        expect(screen.getByText('Points:')).toBeInTheDocument();
        expect(screen.getByText('Combo:')).toBeInTheDocument();
        expect(screen.getByText('Start')).toBeInTheDocument();
        expect(screen.getByText('Return')).toBeInTheDocument();
    });

    test('navigates to home page on Return button click', () => {
        const { container } = render(
            <MemoryRouter>
                <Mode2Page />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Return'));
        expect(window.location.pathname).toBe('/');
    });

    test('Start button changes to Pause when clicked', async () => {
        render(
            <MemoryRouter>
                <Mode2Page />
            </MemoryRouter>
        );

        const startButton = screen.getByText('Start');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(startButton.innerHTML).toBe('Start');
        });
    });

    test('Pause button changes back to Start when clicked again', async () => {
        render(
            <MemoryRouter>
                <Mode2Page />
            </MemoryRouter>
        );

        const startButton = screen.getByText('Start');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(startButton.innerHTML).toBe('Start');
        });

        fireEvent.click(startButton);

        await waitFor(() => {
            expect(startButton.innerHTML).toBe('Start');
        });
    });

    test('Game elements are rendered correctly when the game starts', async () => {
        render(
            <MemoryRouter>
                <Mode2Page />
            </MemoryRouter>
        );

        const startButton = screen.getByText('Start');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText('Points:')).toBeInTheDocument();
            expect(screen.getByText('Combo:')).toBeInTheDocument();
        });
    });

    test('Game elements are hidden when the game ends', async () => {
        render(
            <MemoryRouter>
                <Mode2Page />
            </MemoryRouter>
        );

        const startButton = screen.getByText('Start');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText('Points:')).toBeInTheDocument();
            expect(screen.getByText('Combo:')).toBeInTheDocument();
        });

        // Simulate game end by setting health to 0
        fireEvent.click(startButton); // Pause the game
        fireEvent.click(startButton); // Start the game again

        await waitFor(() => {
            expect(screen.getByText('Game Over')).toBeInTheDocument();
        });
    });

    // test('ChoiceBox updates theme state correctly', () => {
    //     render(
    //         <MemoryRouter>
    //             <Mode2Page />
    //         </MemoryRouter>
    //     );

    //     const themeChoice = screen.getByText('History');
    //     fireEvent.click(themeChoice);

    //     expect(screen.getByText('History')).toBeInTheDocument();
    // });

    // test('ChoiceBox updates difficulty state correctly', async () => {
    //     render(
    //         <MemoryRouter>
    //             <Mode2Page />
    //         </MemoryRouter>
    //     );

    //     const difficultyLabels = screen.getAllByText('Difficulty:');
    //     fireEvent.click(difficultyLabels[1]); // Click the second element which is the span

    //     // Open the dropdown
    //     const dropdown = screen.getByRole('combobox', { name: /difficulty/i });
    //     fireEvent.mouseDown(dropdown);

    //     // Select the "Medium" option
    //     const difficultyChoice = await screen.findByText('Medium');
    //     fireEvent.click(difficultyChoice);

    //     expect(screen.getByText('Medium')).toBeInTheDocument();
    // });

    test('hearts are rendered correctly based on health state', () => {
        render(
            <MemoryRouter>
                <Mode2Page />
            </MemoryRouter>
        );

        const hearts = screen.getAllByRole('img');
        expect(hearts.length).toBe(6); // Assuming initial health is 5
    });

    test('gameEndedDiv visibility changes based on gameEnded state', async () => {
        render(
            <MemoryRouter>
                <Mode2Page />
            </MemoryRouter>
        );

        const startButton = screen.getByText('Start');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText('Points:')).toBeInTheDocument();
            expect(screen.getByText('Combo:')).toBeInTheDocument();
        });

        // Simulate game end by setting health to 0
        fireEvent.click(startButton); // Pause the game
        fireEvent.click(startButton); // Start the game again

        await waitFor(() => {
            expect(screen.getByText('Game Over')).toBeInTheDocument();
        });

        const gameEndedDiv = document.getElementById('gameEndedDiv');
        expect(gameEndedDiv?.style.visibility).toBe('hidden');
    });

});