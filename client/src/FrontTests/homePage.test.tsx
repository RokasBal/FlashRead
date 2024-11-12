import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/home/homePage';
import { AuthProvider } from '../context/AuthContext'; // Import the AuthProvider

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <AuthProvider> {/* Wrap the component with AuthProvider */}
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/" element={ui} />
                    <Route path="/about" element={<div>About Page</div>} />
                    <Route path="/contact" element={<div>Contact Page</div>} />
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/settings" element={<div>Settings Page</div>} />
                    <Route path="/profile" element={<div>Profile Page</div>} />
                    <Route path="/mode1" element={<div>Mode 1 Page</div>} />
                    <Route path="/mode2" element={<div>Mode 2 Page</div>} />
                    <Route path="/mode3" element={<div>Mode 3 Page</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
};

describe('HomePage', () => {
    beforeEach(() => {
        try {
            renderWithRouter(<HomePage />);
        } catch (error) {
            console.error('Error during beforeEach:', error);
        }
    });

    test('renders FlashRead header', () => {
        expect(screen.getByText('FlashRead')).toBeInTheDocument();
    });

    test('navigates to About Us page on click', () => {
        fireEvent.click(screen.getByText('About Us'));
        expect(screen.getByText('About Page')).toBeInTheDocument();
    });

    test('navigates to Contacts page on click', () => {
        fireEvent.click(screen.getByText('Contacts'));
        expect(screen.getByText('Contact Page')).toBeInTheDocument();
    });

    test('renders mode 1 and navigates on click', async () => {
        fireEvent.click(screen.getByText('Q&A'));
        expect(await screen.findByText('Mode 1 Page')).toBeInTheDocument();
    });

    test('renders mode 2 and navigates on click', async () => {
        fireEvent.click(screen.getByText('Catch The Word'));
        expect(await screen.findByText('Mode 2 Page')).toBeInTheDocument();
    });

    test('renders mode 3 and navigates on click', async () => {
        fireEvent.click(screen.getByText('Temporary 3D Sandbox'));
        expect(await screen.findByText('Mode 3 Page')).toBeInTheDocument();
    });

});