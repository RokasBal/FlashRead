import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChangePassword from '../../pages/settings/changePassword';
import SettingsPage from '../../pages/settings/settingsPage';
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

describe('ChangePassword', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAxios.reset();
    });

    test('renders ChangePassword components', async () => {
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Change account password')).toBeInTheDocument();
            expect(screen.getByLabelText('Old password')).toBeInTheDocument();
            expect(screen.getByLabelText('New password')).toBeInTheDocument();
            expect(screen.getByLabelText('Repeat password')).toBeInTheDocument();
            expect(screen.getByText('Confirm')).toBeInTheDocument();
            expect(screen.getByText('Return')).toBeInTheDocument();
        });
    });

    test('navigates to settings page on Return button click', async () => {
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <VisualSettingsContext.Provider value={mockVisualSettingsContext}>
                    <MemoryRouter initialEntries={['/change-password']}>
                        <Routes>
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                    </MemoryRouter>
                </VisualSettingsContext.Provider>
            </AuthContext.Provider>
        );

        fireEvent.click(screen.getByText('Return'));
        await waitFor(() => {
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });
    });

    // test('shows alert if any password field is empty', async () => {
    //     render(
    //         <AuthContext.Provider value={mockAuthContext}>
    //             <MemoryRouter>
    //                 <ChangePassword />
    //             </MemoryRouter>
    //         </AuthContext.Provider>
    //     );

    //     fireEvent.click(screen.getByText('Confirm'));
    //     await waitFor(() => {
    //         expect(window.alert).toHaveBeenCalledWith('Please fill in your old password.');
    //     });

    //     fireEvent.change(screen.getByLabelText('Old password'), { target: { value: 'oldpassword' } });
    //     fireEvent.click(screen.getByText('Confirm'));
    //     await waitFor(() => {
    //         expect(window.alert).toHaveBeenCalledWith('Please fill in your new password.');
    //     });

    //     fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'newpassword' } });
    //     fireEvent.click(screen.getByText('Confirm'));
    //     await waitFor(() => {
    //         expect(window.alert).toHaveBeenCalledWith('Please repeat your new password.');
    //     });
    // });

    // test('shows alert if new passwords do not match', async () => {
    //     render(
    //         <AuthContext.Provider value={mockAuthContext}>
    //             <MemoryRouter>
    //                 <ChangePassword />
    //             </MemoryRouter>
    //         </AuthContext.Provider>
    //     );

    //     fireEvent.change(screen.getByLabelText('Old password'), { target: { value: 'oldpassword' } });
    //     fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'newpassword1' } });
    //     fireEvent.change(screen.getByLabelText('Repeat password'), { target: { value: 'newpassword2' } });
    //     fireEvent.click(screen.getByText('Confirm'));
    //     await waitFor(() => {
    //         expect(window.alert).toHaveBeenCalledWith('New passwords do not match.');
    //     });
    // });

    test('submits the form with correct data', async () => {
        mockAxios.onPost('/api/Users/ChangePassword').reply(200);

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        fireEvent.change(screen.getByLabelText('Old password'), { target: { value: 'oldpassword' } });
        fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'newpassword' } });
        fireEvent.change(screen.getByLabelText('Repeat password'), { target: { value: 'newpassword' } });
        fireEvent.click(screen.getByText('Confirm'));

        await waitFor(() => {
            expect(mockAxios.history.post.length).toBe(1);
            expect(mockAxios.history.post[0].data).toEqual(JSON.stringify({
                oldPassword: 'oldpassword',
                newPassword: 'newpassword',
            }));
        });
    });

    // test('handles password change failure', async () => {
    //     mockAxios.onPost('/api/Users/ChangePassword').reply(500);

    //     render(
    //         <AuthContext.Provider value={mockAuthContext}>
    //             <MemoryRouter>
    //                 <ChangePassword />
    //             </MemoryRouter>
    //         </AuthContext.Provider>
    //     );

    //     fireEvent.change(screen.getByLabelText('Old password'), { target: { value: 'oldpassword' } });
    //     fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'newpassword' } });
    //     fireEvent.change(screen.getByLabelText('Repeat password'), { target: { value: 'newpassword' } });
    //     fireEvent.click(screen.getByText('Confirm'));

    //     await waitFor(() => {
    //         expect(console.error).toHaveBeenCalledWith('Password change failed. Please try again.', expect.anything());
    //     });
    // });
});