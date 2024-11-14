import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AboutPage from '../pages/about/aboutPage';

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <MemoryRouter initialEntries={[route]}>
            {ui}
        </MemoryRouter>
    );
};

describe('AboutPage', () => {
    beforeEach(() => {
        renderWithRouter(<AboutPage />);
    });

    test('renders About Us header', () => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
    });

    test('renders logo image', () => {
        const logoImg = screen.getByAltText('logo');
        expect(logoImg).toBeInTheDocument();
        expect(logoImg).toHaveClass('logoImg slideIn');
    });

    test('renders content paragraphs', () => {
        expect(screen.getByText('At Stratton Inc., we believe in the power of fast, effective reading.')).toBeInTheDocument();
        expect(screen.getByText('That’s why we created FlashRead — an interactive platform that helps users learn to read faster while retaining and comprehending more. Whether you’re a student, professional, or lifelong learner, FlashRead empowers you to make the most of your reading time.')).toBeInTheDocument();
        expect(screen.getByText('Our program uses engaging exercises to support every user’s journey toward faster, more efficient reading. At Stratton Inc., we’re committed to helping each reader unlock new levels of productivity and reach their full potential with FlashRead.')).toBeInTheDocument();
        expect(screen.getByText('Join us on a journey of growth and exploration with FlashRead, and discover how quickly reading can transform your world.')).toBeInTheDocument();
    });

    test('navigates to home page on Return button click', () => {
        fireEvent.click(screen.getByText('Return'));
        expect(window.location.pathname).toBe('/');
    });
});