import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DeleteAccount from '../pages/settings/deleteAccount';
import { vi } from 'vitest';
import axios from '../components/axiosWrapper';
import { AuthContext } from '../context/AuthContext';
import axiosMock from 'axios-mock-adapter';

const mockAxios = new axiosMock(axios);

const mockAuthContext = {
    isAuthenticated: true,
    logOut: vi.fn(),
};

const renderWithRouter = (ui: React.ReactElement, { route = '/settings/deleteAccount' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/settings/deleteAccount" element={ui} />
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/home" element={<div>Home Page</div>} />
                    <Route path="/settings" element={<div>Settings Page</div>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe('DeleteAccount', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAxios.reset();
    });

    test('renders Account deletion header', async () => {
        renderWithRouter(<DeleteAccount />);

        await waitFor(() => {
            expect(screen.getByText('Account deletion')).toBeInTheDocument();
        });
    });

    test('renders confirmation question', async () => {
        renderWithRouter(<DeleteAccount />);

        await waitFor(() => {
            expect(screen.getByText('Are you sure you want to delete your account?')).toBeInTheDocument();
        });
    });

    test('renders Confirm and Return buttons', async () => {
        renderWithRouter(<DeleteAccount />);

        await waitFor(() => {
            expect(screen.getByText('Confirm')).toBeInTheDocument();
            expect(screen.getByText('Return')).toBeInTheDocument();
        });
    });

    test('navigates to settings page on Return button click', async () => {
        renderWithRouter(<DeleteAccount />);

        fireEvent.click(screen.getByText('Return'));
        await waitFor(() => {
            expect(screen.getByText('Settings Page')).toBeInTheDocument();
        });
    });

    test('deletes account and logs out on Confirm button click', async () => {
        mockAxios.onGet('/api/Users/DeleteUser').reply(200);

        renderWithRouter(<DeleteAccount />);

        fireEvent.click(screen.getByText('Confirm'));

        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });
    });

    test('handles account deletion failure', async () => {
        mockAxios.onGet('/api/Users/DeleteUser').reply(500);

        renderWithRouter(<DeleteAccount />);

        fireEvent.click(screen.getByText('Confirm'));

        await waitFor(() => {
            expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
        });
    });
});