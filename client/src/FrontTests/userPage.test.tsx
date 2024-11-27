import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import UserPage from '../pages/userSearch/userPage';
import { AuthProvider } from '../context/AuthContext';
import axios from '../components/axiosWrapper';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/user/:username" element={ui} />
                    <Route path="/search" element={<div>Search Page</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
};

describe('UserPage', () => {
    beforeEach(() => {
        mock.onGet('/api/User/GetUserPageData').reply(200, {
            profilePic: null,
            history: [
                { taskId: 1, score: 100, timePlayed: '2023-01-01T10:00:00Z' },
                { taskId: 2, score: 200, timePlayed: '2023-01-02T11:00:00Z' }
            ],
            joinedAt: '2022-01-01T00:00:00Z'
        });
    });

    test('renders profile header', async () => {
        renderWithRouter(<UserPage />, { route: '/user/johndoe' });
        expect(screen.getByRole('heading', { name: /Profile/i })).toBeInTheDocument();
    });

    test('renders account statistics', async () => {
        renderWithRouter(<UserPage />, { route: '/user/johndoe' });

        await waitFor(() => {
            expect(screen.getByText('Games played:')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
            expect(screen.getByText('Total score:')).toBeInTheDocument();
            expect(screen.getByText('300')).toBeInTheDocument();
            expect(screen.getByText('Join date:')).toBeInTheDocument();
            expect(screen.getByText('2022-01-01')).toBeInTheDocument();
        });
    });

    test('renders game history table', async () => {
        renderWithRouter(<UserPage />, { route: '/user/johndoe' });

        await waitFor(() => {
            expect(screen.getByText('Q&A')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
            expect(screen.getByText('Catch the Word')).toBeInTheDocument();
            expect(screen.getByText('200')).toBeInTheDocument();
        });
    });

    test('navigates to search page on return button click', async () => {
        renderWithRouter(<UserPage />, { route: '/user/johndoe' });

        fireEvent.click(screen.getByRole('button', { name: /Return/i }));
        expect(screen.getByText('Search Page')).toBeInTheDocument();
    });
});