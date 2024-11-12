import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  test('renders login page by default', async () => {
    render(<App />);
    expect(await screen.findByText(/login/i)).toBeInTheDocument();
  });

  test('renders home page when navigating to /home', async () => {
    window.history.pushState({}, 'Home Page', '/home');
    render(<App />);
    expect(await screen.findByText(/FlashRead/i)).toBeInTheDocument();
  });

  test('renders register page when navigating to /register', async () => {
    window.history.pushState({}, 'Register Page', '/register');
    render(<App />);
    expect(await screen.findByText(/register/i)).toBeInTheDocument();
  });

  test('renders settings page when navigating to /settings', async () => {
    window.history.pushState({}, 'Settings Page', '/settings');
    render(<App />);
    expect(await screen.findByText(/settings/i)).toBeInTheDocument();
  });

  test('renders about page when navigating to /about', async () => {
    window.history.pushState({}, 'About Page', '/about');
    render(<App />);
    expect(await screen.findByText(/about/i)).toBeInTheDocument();
  });

  test('renders contact page when navigating to /contact', async () => {
    window.history.pushState({}, 'Contact Page', '/contact');
    render(<App />);
    expect(await screen.findByText(/Contact Us/i)).toBeInTheDocument();
  });

  // test('renders profile page when navigating to /profile', async () => {
  //   window.history.pushState({}, 'Profile Page', '/profile');
  //   render(<App />);
  //   expect(await screen.findByText(/Profile/i, {}, {timeout: 3000})).toBeInTheDocument();
  // });
});