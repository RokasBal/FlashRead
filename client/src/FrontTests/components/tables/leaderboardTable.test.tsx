import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from '../../../components/axiosWrapper';
import { TableRow } from '../../../components/tables/types.ts'
import LeaderboardTable, {fetchHighScoreLeaderboard, checkNextPage, handleTypeChoice, handleSort} from '../../../components/tables/leaderboardTable.tsx';
import { vi } from 'vitest';

describe('handleSort', () => {
    it('sets the sort configuration to ascending when the key is different from the previous key', () => {
        const mockSetSortConfig = vi.fn();

        handleSort('score', mockSetSortConfig);

        expect(mockSetSortConfig).toHaveBeenCalledWith(expect.any(Function));

        const setSortConfigCallback = mockSetSortConfig.mock.calls[0][0];
        const result = setSortConfigCallback(null);

        expect(result).toEqual({ key: 'score', direction: 'asc' });
    });

    it('toggles the sort direction when the key is the same as the previous key', () => {
        const mockSetSortConfig = vi.fn();

        handleSort('score', mockSetSortConfig);

        expect(mockSetSortConfig).toHaveBeenCalledWith(expect.any(Function));

        const setSortConfigCallback = mockSetSortConfig.mock.calls[0][0];
        const result = setSortConfigCallback({ key: 'score', direction: 'asc' });

        expect(result).toEqual({ key: 'score', direction: 'desc' });
    });

    it('sets the sort configuration to ascending when the key is different from the previous key', () => {
        const mockSetSortConfig = vi.fn();

        handleSort('username', mockSetSortConfig);

        expect(mockSetSortConfig).toHaveBeenCalledWith(expect.any(Function));

        const setSortConfigCallback = mockSetSortConfig.mock.calls[0][0];
        const result = setSortConfigCallback({ key: 'score', direction: 'asc' });

        expect(result).toEqual({ key: 'username', direction: 'asc' });
    });
});

describe('handleTypeChoice', () => {
    it('sets the type and page correctly when the choice is different from the current type and is "All time score"', () => {
        const mockSetType = vi.fn();
        const mockSetPage = vi.fn();

        handleTypeChoice("All time score", "High score", mockSetType, mockSetPage);

        expect(mockSetType).toHaveBeenCalledWith("All time score");
        expect(mockSetPage).toHaveBeenCalledWith(1);
    });

    it('sets the type and page correctly when the choice is different from the current type and is "High score"', () => {
        const mockSetType = vi.fn();
        const mockSetPage = vi.fn();

        handleTypeChoice("High score", "All time score", mockSetType, mockSetPage);

        expect(mockSetType).toHaveBeenCalledWith("High score");
        expect(mockSetPage).toHaveBeenCalledWith(1);
    });

    it('does nothing when the choice is the same as the current type', () => {
        const mockSetType = vi.fn();
        const mockSetPage = vi.fn();

        handleTypeChoice("All time score", "All time score", mockSetType, mockSetPage);

        expect(mockSetType).not.toHaveBeenCalled();
        expect(mockSetPage).not.toHaveBeenCalled();
    });
});

vi.mock('../../../components/axiosWrapper');

describe('checkNextPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns true when the next page is blank for "All time score"', async () => {
        axios.post.mockResolvedValueOnce({ data: [] });

        const result = await checkNextPage(2, "All time score");

        expect(axios.post).toHaveBeenCalledWith('/api/Users/TotalScoreLeaderboard?page=2');
        expect(result).toBe(true);
    });

    it('returns false when the next page is not blank for "All time score"', async () => {
        axios.post.mockResolvedValueOnce({ data: [{ name: 'User1', score: 100 }] });

        const result = await checkNextPage(2, "All time score");

        expect(axios.post).toHaveBeenCalledWith('/api/Users/TotalScoreLeaderboard?page=2');
        expect(result).toBe(false);
    });

    it('returns true when the next page is blank for "High score"', async () => {
        axios.post.mockResolvedValueOnce({ data: [] });

        const result = await checkNextPage(2, "High score");

        expect(axios.post).toHaveBeenCalledWith('/api/Users/HighScoreLeaderboard?page=2');
        expect(result).toBe(true);
    });

    it('returns false when the next page is not blank for "High score"', async () => {
        axios.post.mockResolvedValueOnce({ data: [{ name: 'User1', score: 100 }] });

        const result = await checkNextPage(2, "High score");

        expect(axios.post).toHaveBeenCalledWith('/api/Users/HighScoreLeaderboard?page=2');
        expect(result).toBe(false);
    });

    it('handles errors correctly and returns true', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        axios.post.mockRejectedValueOnce(new Error('Network Error'));

        const result = await checkNextPage(2, "High score");

        expect(consoleErrorSpy).toHaveBeenCalledWith("Error checking next page:", expect.any(Error));
        expect(result).toBe(true);

        consoleErrorSpy.mockRestore();
    });
});

describe('fetchHighScoreLeaderboard', () => {
    const mockSetPageUser = vi.fn();
    const mockSetLeaderboadData = vi.fn();
    const mockSetIsNextPageBlank = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches data and updates the state correctly', async () => {
        const mockResponseData = [
            { name: 'User1', score: 100, gamemode: '1' },
            { name: 'User2', score: 200, gamemode: '2' },
        ];
        axios.post.mockResolvedValueOnce({ data: mockResponseData });

        await fetchHighScoreLeaderboard(1, mockSetPageUser, mockSetLeaderboadData, 'type', 1, mockSetIsNextPageBlank);

        expect(axios.post).toHaveBeenCalledWith('/api/Users/HighScoreLeaderboard?page=1');
        expect(mockSetPageUser).toHaveBeenCalledWith(1);
        expect(mockSetLeaderboadData).toHaveBeenCalledWith([
            { username: 'User1', score: 100, gamemode: 'Q&A' },
            { username: 'User2', score: 200, gamemode: 'Catch the Word' },
        ]);
        expect(mockSetIsNextPageBlank).toHaveBeenCalled();
    });

    it('handles errors correctly', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        axios.post.mockRejectedValueOnce(new Error('Network Error'));

        await fetchHighScoreLeaderboard(1, mockSetPageUser, mockSetLeaderboadData, 'type', 1, mockSetIsNextPageBlank);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching leaderboard data:', expect.any(Error));

        consoleErrorSpy.mockRestore();
    });
});

const mockAllTimeData = [
    { name: 'User1', score: 100 },
    { name: 'User2', score: 200 },
];

const mockHighScoreData = [
    { name: 'User1', score: 100, gamemode: '1' },
    { name: 'User2', score: 200, gamemode: '2' },
];

describe('LeaderboardTable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders leaderboard table', async () => {
        axios.post.mockResolvedValueOnce({ data: mockAllTimeData });

        render(<LeaderboardTable />);

        await waitFor(() => {
            expect(screen.getByText('User1')).toBeInTheDocument();
            expect(screen.getByText('User2')).toBeInTheDocument();
        });
    });

    test('sorts leaderboard data', async () => {
        axios.post.mockResolvedValueOnce({ data: mockAllTimeData });

        render(<LeaderboardTable />);

        await waitFor(() => {
            expect(screen.getByText('User1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Score'));

        await waitFor(() => {
            expect(screen.getByText('User2')).toBeInTheDocument();
            expect(screen.getByText('User1')).toBeInTheDocument();
        });
    });

    test('fetches all leaderboard data', async () => {
        axios.post.mockResolvedValueOnce({ data: mockAllTimeData });

        render(<LeaderboardTable />);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/Users/TotalScoreLeaderboard?page=1');
            expect(screen.getByText('User1')).toBeInTheDocument();
            expect(screen.getByText('User2')).toBeInTheDocument();
        });
    });

    test('handles sorting by username', async () => {
        axios.post.mockResolvedValueOnce({ data: mockAllTimeData });

        render(<LeaderboardTable />);

        await waitFor(() => {
            expect(screen.getByText('User1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Username'));

        await waitFor(() => {
            expect(screen.getByText('User1')).toBeInTheDocument();
            expect(screen.getByText('User2')).toBeInTheDocument();
        });
    });

    test('handles sorting by score', async () => {
        axios.post.mockResolvedValueOnce({ data: mockAllTimeData });

        render(<LeaderboardTable />);

        await waitFor(() => {
            expect(screen.getByText('User1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Score'));

        await waitFor(() => {
            expect(screen.getByText('User2')).toBeInTheDocument();
            expect(screen.getByText('User1')).toBeInTheDocument();
        });
    });

    test('handles empty leaderboard data', async () => {
        axios.post.mockResolvedValueOnce({ data: [] });

        render(<LeaderboardTable />);

        await waitFor(() => {
            expect(screen.queryByText('User1')).not.toBeInTheDocument();
            expect(screen.queryByText('User2')).not.toBeInTheDocument();
        });
    });
});