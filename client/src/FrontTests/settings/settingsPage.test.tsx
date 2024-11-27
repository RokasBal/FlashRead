import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SettingsPage from '../../pages/settings/settingsPage';
import HomePage from '../../pages/home/homePage';
import { vi } from 'vitest';
import axios from '../../components/axiosWrapper';
import { AuthContext } from '../../context/AuthContext';
import { VisualSettingsContext } from '../../context/VisualSettingsContext';
import axiosMock from 'axios-mock-adapter';

const mockAxios = new axiosMock(axios);

const mockAuthContext = {
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
};

const mockVisualSettingsContext = {
    visualSettings: { theme: 'defaultTheme', font: 'defaultFont' },
    setVisualSettings: vi.fn(),
};

describe('SettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAxios.reset();
    });

    test('renders SettingsPage components for authenticated user', async () => {
        mockAxios.onGet('/api/Settings/GetAllThemes').reply(200, ['theme1', 'theme2']);
        mockAxios.onGet('/api/Settings/GetAllFonts').reply(200, ['font1', 'font2']);
        mockAxios.onGet('/api/User/GetCurrentUserName').reply(200, { name: 'testuser' });
        mockAxios.onGet('/api/User/GetThemeSettings').reply(200, { theme: 'theme1' });
        mockAxios.onGet('/api/User/GetFontSettings').reply(200, { font: 'font1' });

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <VisualSettingsContext.Provider value={mockVisualSettingsContext}>
                    <MemoryRouter>
                        <SettingsPage />
                    </MemoryRouter>
                </VisualSettingsContext.Provider>
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Settings')).toBeInTheDocument();
            expect(screen.getByText('Theme')).toBeInTheDocument();
            expect(screen.getByText('Font')).toBeInTheDocument();
            expect(screen.getByText('Profile Name:')).toBeInTheDocument();
            expect(screen.getByText('Change Password')).toBeInTheDocument();
            expect(screen.getByText('Delete Account')).toBeInTheDocument();
            expect(screen.getByText('Return')).toBeInTheDocument();
        });
    });

    test('renders SettingsPage components for unauthenticated user', async () => {
        mockAuthContext.isAuthenticated = false;

        mockAxios.onGet('/api/Settings/GetAllThemes').reply(200, ['theme1', 'theme2']);
        mockAxios.onGet('/api/Settings/GetAllFonts').reply(200, ['font1', 'font2']);

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <VisualSettingsContext.Provider value={mockVisualSettingsContext}>
                    <MemoryRouter>
                        <SettingsPage />
                    </MemoryRouter>
                </VisualSettingsContext.Provider>
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Settings')).toBeInTheDocument();
            expect(screen.getByText('Theme')).toBeInTheDocument();
            expect(screen.getByText('Font')).toBeInTheDocument();
            expect(screen.getByText('Return')).toBeInTheDocument();
        });
    });

    test('navigates to home page on Return button click', async () => {
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <VisualSettingsContext.Provider value={mockVisualSettingsContext}>
                    <MemoryRouter initialEntries={['/settings']}>
                        <Routes>
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/home" element={<HomePage />} />
                        </Routes>
                    </MemoryRouter>
                </VisualSettingsContext.Provider>
            </AuthContext.Provider>
        );

        fireEvent.click(screen.getByText('Return'));
        await waitFor(() => {
            expect(screen.getByText('FlashRead')).toBeInTheDocument();
        });
    });

    test('changes profile name', async () => {
        mockAuthContext.isAuthenticated = true; // Ensure the user is authenticated
    
        mockAxios.onGet('/api/Settings/GetAllThemes').reply(200, ['theme1', 'theme2']);
        mockAxios.onGet('/api/Settings/GetAllFonts').reply(200, ['font1', 'font2']);
        mockAxios.onGet('/api/User/GetCurrentUserName').reply(200, { name: 'testuser' });
    
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <VisualSettingsContext.Provider value={mockVisualSettingsContext}>
                    <MemoryRouter>
                        <SettingsPage />
                    </MemoryRouter>
                </VisualSettingsContext.Provider>
            </AuthContext.Provider>
        );
    
        // Click the "Edit" button to enable editing the profile name
        fireEvent.click(screen.getByText('Edit'));
    
        expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    test('navigates to change password page on button click', async () => {
        mockAuthContext.isAuthenticated = true; // Ensure the user is authenticated
    
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <VisualSettingsContext.Provider value={mockVisualSettingsContext}>
                    <MemoryRouter initialEntries={['/settings']}>
                        <Routes>
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/changePassword" element={<div>Change Password Page</div>} />
                        </Routes>
                    </MemoryRouter>
                </VisualSettingsContext.Provider>
            </AuthContext.Provider>
        );
    
        fireEvent.click(screen.getByText('Change Password'));
        await waitFor(() => {
            expect(screen.getByText('Change Password Page')).toBeInTheDocument();
        });
    });

    test('navigates to delete account page on button click', async () => {
        mockAuthContext.isAuthenticated = true; // Ensure the user is authenticated
    
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <VisualSettingsContext.Provider value={mockVisualSettingsContext}>
                    <MemoryRouter initialEntries={['/settings']}>
                        <Routes>
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/deleteAccount" element={<div>Delete Account Page</div>} />
                        </Routes>
                    </MemoryRouter>
                </VisualSettingsContext.Provider>
            </AuthContext.Provider>
        );
    
        fireEvent.click(screen.getByText('Delete Account'));
        await waitFor(() => {
            expect(screen.getByText('Delete Account Page')).toBeInTheDocument();
        });
    });

});