import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Search from '../pages/userSearch/search';
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
                    <Route path="/" element={ui} />
                    <Route path="/user/:name" element={<div>User Page</div>} />
                    <Route path="/home" element={<div>Home Page</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
};

describe('Search', () => {
    beforeEach(() => {
        mock.onGet('/api/Users/All').reply(200, [
            { name: 'John', email: 'john@example.com' },
            { name: 'Jane', email: 'jane@example.com' }
        ]);
        renderWithRouter(<Search />);
    });

    test('renders Search users header', () => {
        expect(screen.getByRole('heading', { name: /Search users/i })).toBeInTheDocument();
    });

    test('renders search input field', () => {
        expect(screen.getByLabelText('Search users')).toBeInTheDocument();
    });

    test('renders return button', () => {
        expect(screen.getByText('Return')).toBeInTheDocument();
    });

    test('navigates to home page on return button click', () => {
        fireEvent.click(screen.getByText('Return'));
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
});