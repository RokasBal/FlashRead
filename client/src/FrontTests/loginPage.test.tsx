import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from '../pages/login/loginPage';
import { AuthProvider } from '../context/AuthContext'; // Import the AuthProvider

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <AuthProvider> {/* Wrap the component with AuthProvider */}
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/" element={ui} />
                    <Route path="/register" element={<div>Register Page</div>} />
                    <Route path="/home" element={<div>Home Page</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
};

describe('LoginPage', () => {
    beforeEach(() => {
        renderWithRouter(<LoginPage />);
    });

    test('renders Welcome back! header', () => {
        expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    });

    test('renders email and password fields', () => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    test('renders login button', () => {
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    test('renders register and guest links', () => {
        expect(screen.getByText('Register')).toBeInTheDocument();
        expect(screen.getByText('continue as guest')).toBeInTheDocument();
    });

    test('submits the form with email and password', async () => {
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'email@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
        fireEvent.click(screen.getByText('Login'));

        // Add your assertions here to check if the form submission is handled correctly
        // For example, you can mock the login function and check if it was called with the correct arguments
    });

    test('navigates to register page on Register link click', () => {
        fireEvent.click(screen.getByText('Register'));
        expect(screen.getByText('Register Page')).toBeInTheDocument();
    });

    test('navigates to home page on continue as guest link click', () => {
        fireEvent.click(screen.getByText('continue as guest'));
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
});