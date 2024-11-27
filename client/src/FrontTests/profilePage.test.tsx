import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProfilePage from '../pages/profile/profilePage';
import HomePage from '../pages/home/homePage';
import { vi } from 'vitest';
import axios from '../components/axiosWrapper';
import { AuthContext } from '../context/AuthContext';
import axiosMock from 'axios-mock-adapter';

const mockAxios = new axiosMock(axios);

const mockAuthContext = {
    isAuthenticated: true,
    logOut: vi.fn(),
};

const renderWithRouter = (ui: React.ReactElement, { route = '/profile' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/profile" element={ui} />
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/home" element={<HomePage />} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe('ProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAxios.reset();
    });

    test('renders Profile header', async () => {
        renderWithRouter(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Profile')).toBeInTheDocument();
        });
    });

    test('renders Account Statistics section', async () => {
        mockAxios.onGet('/api/User/GetUserInfo').reply(200, { name: 'testuser', joinedAt: '2022-01-01T00:00:00Z' });
        mockAxios.onGet('/api/Users/GetUserHistory').reply(200, []);
        mockAxios.onGet('/api/Settings/GetProfilePicture').reply(200, new Blob());

        renderWithRouter(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Account Statistics')).toBeInTheDocument();
            expect(screen.getByText('Games played:')).toBeInTheDocument();
            expect(screen.getByText('Total score:')).toBeInTheDocument();
            expect(screen.getByText('Join date:')).toBeInTheDocument();
        });
    });

    test('renders Game history and Leaderboards buttons', async () => {
        renderWithRouter(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Game history')).toBeInTheDocument();
            expect(screen.getByText('Leaderboards')).toBeInTheDocument();
        });
    });

    test('navigates to home page on Return button click', async () => {
        renderWithRouter(<ProfilePage />);

        fireEvent.click(screen.getByText('Return'));
        await waitFor(() => {
            expect(screen.getByText('FlashRead')).toBeInTheDocument();
        });
    });

});