import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProfilePage from '../pages/profile/profilePage';
import HomePage from '../pages/home/homePage';
import { vi } from 'vitest';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import MockAdapter from 'axios-mock-adapter';
import { fetchGameHistory, handleFileChange, handleUpload } from '../pages/profile/profilePage';
import { ChangeEvent } from 'react';

const mockAxios = new MockAdapter(axios);

const mockAuthContext = {
    isAuthenticated: true,
    logOut: vi.fn(),
};

const renderWithRouter = (ui: React.ReactElement, { route = '/profile' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/profile" element={ui} />
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/home" element={<HomePage />} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe('ProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAxios.reset();
    });

    test('renders Profile header', async () => {
        renderWithRouter(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Profile')).toBeInTheDocument();
        });
    });

    test('renders popup', async () => {
        renderWithRouter(<ProfilePage popupVisible={true} defpreviewUrl='wawda' />);
    });

    test('renders Account Statistics section', async () => {
        mockAxios.onGet('/api/User/GetUserInfo').reply(200, { name: 'testuser', joinedAt: '2022-01-01T00:00:00Z' });
        mockAxios.onGet('/api/Users/GetUserHistory').reply(200, []);
        mockAxios.onGet('/api/Settings/GetProfilePicture').reply(200, new Blob());

        renderWithRouter(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Account Statistics')).toBeInTheDocument();
            expect(screen.getByText('Games played:')).toBeInTheDocument();
            expect(screen.getByText('Total score:')).toBeInTheDocument();
            expect(screen.getByText('Join date:')).toBeInTheDocument();
        });
    });

    test('renders Game history and Leaderboards buttons', async () => {
        renderWithRouter(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Game history')).toBeInTheDocument();
            expect(screen.getByText('Leaderboards')).toBeInTheDocument();
        });
    });

    test('navigates to home page on Return button click', async () => {
        renderWithRouter(<ProfilePage />);

        fireEvent.click(screen.getByText('Return'));
        await waitFor(() => {
            expect(screen.getByText('FlashRead')).toBeInTheDocument();
        });
    });

    test('fetchGameHistory function', async () => {
        document.cookie = 'authToken=token';
        const mockResponse = {data: [
            {taskId: 1, score: 100, timePlayed: '2022-01-01T00:00:00Z'},
            {taskId: 2, score: 200, timePlayed: '2022-01-02T00:00:00Z'},
        ]};
        let result;
        await fetchGameHistory((data) => {result = data}, (data) => {}, (data) => {}, (data) => {
            return mockResponse;
        });
        result[0].date =  '';
        result[1].date =  '';
        expect(result).toEqual([
            {gamemode: "Q&A", score: 100, date: ""},
            {gamemode: "Catch the Word", score: 200, date: ""}
        ]);
    });

    test('handleFileChange function good', async () => {
        const mockEvent = {
            target: {
                files: [
                    {
                        name: 'test.jpg',
                        type: 'image/jpeg',
                        size: 1000,
                        slice: () => new Blob()
                    }
                ]
            }
        } as unknown;
        await handleFileChange(mockEvent as ChangeEvent<HTMLInputElement>, (data) => {}, (data) => {});
    });
    test('handleFileChange function bad 1', async () => {
        const mockEvent = {
            target: {
                files: [
                    {
                        name: 'test.jpg',
                        type: 'image/jpeg',
                        size: 9999999999999999,
                    }
                ]
            }
        } as unknown;
        await handleFileChange(mockEvent as ChangeEvent<HTMLInputElement>, (data) => {}, (data) => {});
    });
    test('handleFileChange function bad 2', async () => {
        const mockEvent = {
            target: {
                files: [
                    {
                        name: 'test.jpg',
                        type: 'imagedddd/jpeg',
                    }
                ]
            }
        } as unknown;
        await handleFileChange(mockEvent as ChangeEvent<HTMLInputElement>, (data) => {}, (data) => {});
    });
    test('handleUpload function good', async () => {
        document.cookie = 'authToken=token';
        await handleUpload(new File([], "olga"), (data) => {}, (data) => {}, (data, form) => {
            return {status: 200};
        });
    });
    test('handleUpload function bad token', async () => {
        document.cookie = 'aaa';
        await handleUpload(new File([], "olga"), (data) => {}, (data) => {}, (data, form) => {
            return {status: 200};
        });
    });
    test('handleUpload function bad response', async () => {
        document.cookie = 'authToken=token';
        await handleUpload(new File([], "olga"), (data) => {}, (data) => {}, (data, form) => {
            return {status: 300};
        });
    });
});