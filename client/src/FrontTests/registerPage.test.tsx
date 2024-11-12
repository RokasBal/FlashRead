import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RegisterPage from '../pages/register/registerPage';
import { AuthProvider } from '../context/AuthContext'; // Import the AuthProvider

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <AuthProvider> {}
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/" element={ui} />
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/home" element={<div>Home Page</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
};

describe('RegisterPage', () => {
    let originalAlert: any;

    beforeEach(() => {
        originalAlert = window.alert;
        window.alert = (message) => { console.log(message); };
        renderWithRouter(<RegisterPage />);
    });

    afterEach(() => {
        window.alert = originalAlert;
    });

    test('renders Create an account header', () => {
        expect(screen.getByText('Create an account')).toBeInTheDocument();
    });

    test('renders username, email, password, and repeat password fields', () => {
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Repeat password')).toBeInTheDocument();
    });

    test('renders register button', () => {
        expect(screen.getByText('Register')).toBeInTheDocument();
    });

    test('renders login and guest links', () => {
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('continue as guest')).toBeInTheDocument();
    });

    test('submits the form with valid data', async () => {
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'username' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'email@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
        fireEvent.change(screen.getByLabelText('Repeat password'), { target: { value: 'password' } });
        fireEvent.click(screen.getByText('Register'));
    });

    test('navigates to login page on Login link click', () => {
        fireEvent.click(screen.getByText('Login'));
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    test('navigates to home page on continue as guest link click', () => {
        fireEvent.click(screen.getByText('continue as guest'));
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
});