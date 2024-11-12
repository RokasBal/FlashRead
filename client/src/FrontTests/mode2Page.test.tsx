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
});