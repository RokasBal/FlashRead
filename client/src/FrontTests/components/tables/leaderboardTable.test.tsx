import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from '../../../components/axiosWrapper';
import LeaderboardTable from '../../../components/tables/leaderboardTable.tsx';
import { vi } from 'vitest';

vi.mock('../../../components/axiosWrapper');

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