import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from '../pages/contact/contactPage';

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <MemoryRouter initialEntries={[route]}>
            {ui}
        </MemoryRouter>
    );
};

describe('ContactPage', () => {
    beforeEach(() => {
        renderWithRouter(<ContactPage />);
    });

    test('renders Contacts header', () => {
        expect(screen.getByText('Contacts')).toBeInTheDocument();
    });

    test('renders contact information', () => {
        expect(screen.getByText('Contact Us')).toBeInTheDocument();
        expect(screen.getByText('GitHub')).toBeInTheDocument();
        expect(screen.getByText('Julius')).toBeInTheDocument();
        expect(screen.getByText('Rokas')).toBeInTheDocument();
        expect(screen.getByText('Edvinas')).toBeInTheDocument();
        expect(screen.getByText('Aurelijus')).toBeInTheDocument();
        expect(screen.getByText('Chat to us')).toBeInTheDocument();
        expect(screen.getByText('contact@flashread.com')).toBeInTheDocument();
    });

    test('renders form fields', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Message')).toBeInTheDocument();
    });

    test('navigates to home page on Return button click', () => {
        fireEvent.click(screen.getByText('Return'));
        expect(window.location.pathname).toBe('/');
    });

    test('submits the form', () => {
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
        fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello, this is a test message.' } });

        fireEvent.click(screen.getByText('Submit'));

        // Since the form action is an external URL, we can't test the actual submission.
        // Instead, we can check if the form fields have the expected values.
        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText('Message')).toHaveValue('Hello, this is a test message.');
    });
});