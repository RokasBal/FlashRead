import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import axios from '../../components/axiosWrapper';
import Cookies from 'js-cookie';
import { changeFont, changeTheme } from '../../components/utils/visualSettingsUtils';
import { useAuth } from '../../context/AuthContext';
import { VisualSettingsProvider, useVisualSettings } from '../../context/VisualSettingsContext';

vi.mock('../../components/axiosWrapper');
vi.mock('js-cookie');
vi.mock('../../components/utils/visualSettingsUtils');
vi.mock('../../context/AuthContext');

describe('VisualSettingsContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const TestComponent = () => {
        const { visualSettings, loading } = useVisualSettings();
        if (loading) {
            return <div>Loading...</div>;
        }
        return (
            <div>
                <div>Theme: {visualSettings?.theme}</div>
                <div>Font: {visualSettings?.font}</div>
            </div>
        );
    };

    test('loads default settings when not authenticated and no cookie', async () => {
        (useAuth as vi.Mock).mockReturnValue({ isAuthenticated: false });
        (Cookies.get as vi.Mock).mockReturnValue(undefined);

        render(
            <VisualSettingsProvider>
                <TestComponent />
            </VisualSettingsProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Theme: Olive')).toBeInTheDocument();
            expect(screen.getByText('Font: Poppins')).toBeInTheDocument();
        });
    });

    test('loads settings from cookie when not authenticated', async () => {
        (useAuth as vi.Mock).mockReturnValue({ isAuthenticated: false });
        (Cookies.get as vi.Mock).mockReturnValue(JSON.stringify({ theme: 'Dark', font: 'Arial' }));

        render(
            <VisualSettingsProvider>
                <TestComponent />
            </VisualSettingsProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Theme: Dark')).toBeInTheDocument();
            expect(screen.getByText('Font: Arial')).toBeInTheDocument();
        });
    });

    test('loads settings from API when authenticated', async () => {
        (useAuth as vi.Mock).mockReturnValue({ isAuthenticated: true });
        (axios.get as vi.Mock).mockImplementation((url) => {
            if (url === '/api/User/GetThemeSettings') {
                return Promise.resolve({ data: { theme: 'Light' } });
            }
            if (url === '/api/User/GetFontSettings') {
                return Promise.resolve({ data: { font: 'Roboto' } });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        render(
            <VisualSettingsProvider>
                <TestComponent />
            </VisualSettingsProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Theme: Light')).toBeInTheDocument();
            expect(screen.getByText('Font: Roboto')).toBeInTheDocument();
        });
    });
});