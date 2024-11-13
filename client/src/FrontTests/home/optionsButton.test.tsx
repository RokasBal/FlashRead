import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import OptionsButton from '../../pages/home/optionsButton';
import { vi } from 'vitest';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('OptionsButton', () => {
    it('renders the options button', () => {
        render(
            <MemoryRouter>
                <OptionsButton />
            </MemoryRouter>
        );
        expect(screen.getByText('≡')).toBeInTheDocument();
    });

    it('opens the menu when the button is clicked', () => {
        render(
            <MemoryRouter>
                <OptionsButton />
            </MemoryRouter>
        );
        const button = screen.getByText('≡');
        fireEvent.click(button);
        expect(screen.getByText('Register')).toBeInTheDocument();
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('navigates to the register page when the Register button is clicked', () => {
        const mockNavigate = vi.fn();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        render(
            <MemoryRouter>
                <OptionsButton />
            </MemoryRouter>
        );

        const button = screen.getByText('≡');
        fireEvent.click(button);
        const registerButton = screen.getByText('Register');
        fireEvent.click(registerButton);
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('navigates to the login page when the Login button is clicked', () => {
        const mockNavigate = vi.fn();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        render(
            <MemoryRouter>
                <OptionsButton />
            </MemoryRouter>
        );

        const button = screen.getByText('≡');
        fireEvent.click(button);
        const loginButton = screen.getByText('Login');
        fireEvent.click(loginButton);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});