import { render, screen, fireEvent } from '@testing-library/react';
import HistoryTable from '../../../components/tables/historyTable.tsx';
import { TableRow } from '../../../components/tables/types.ts';

const mockData: TableRow[] = [
    { gamemode: 'Q&A', score: '100', date: '2023-01-01' },
    { gamemode: 'Catch the Word', score: '200', date: '2023-01-02' },
    { gamemode: 'Q&A', score: '150', date: '2023-01-03' },
];

describe('HistoryTable', () => {
    it('renders table headers correctly', () => {
        render(<HistoryTable data={mockData} />);
        expect(screen.getByText('Gamemode')).toBeInTheDocument();
        expect(screen.getByText('Score')).toBeInTheDocument();
        expect(screen.getByText('Date')).toBeInTheDocument();
    });

    it('fills empty rows to maintain table structure', () => {
        render(<HistoryTable data={[]} />);
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBe(11); // 10 empty rows + 1 header row
    });
});