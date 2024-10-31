import React, { useState } from 'react';
import '../css/tables.css';
import ChoiceBox from '../choiceBox.tsx';

interface TableRow {
    player: string;
    score: number;
    date: string;
}

interface CustomTableProps {
    data: TableRow[];
}

const LeaderboardTable: React.FC<CustomTableProps> = ({ data }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof TableRow; direction: 'asc' | 'desc' } | null>(null);

    // Sort the data based on the current sorting configuration
    const sortedData = React.useMemo(() => {
        if (sortConfig !== null) {
            return [...data].sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return data;
    }, [data, sortConfig]);

    const handleSort = (key: keyof TableRow) => {
        setSortConfig((prevConfig) => {
            if (prevConfig && prevConfig.key === key) {
                // Toggle the sort direction if the same column is clicked
                return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
            }
            // Set to ascending by default if a new column is clicked
            return { key, direction: 'asc' };
        });
    };

    return (
        <div className="customTableContainer">
            <div className="tableFilter">
                <ChoiceBox choices={["Q&A", "Catch The Word", "Mode 3"]} prompt='Modes:' onSelect={choice => console.log(choice)} label="Mode"/>
            </div>
            <div className="tableContent">
                <table className="customTable">
                <thead>
                    <tr>
                        <th
                            onClick={() => handleSort('player')}
                            className={sortConfig?.key === 'player' ? `sort-${sortConfig.direction}` : ''}
                        >
                            Username
                        </th>
                        <th
                            onClick={() => handleSort('score')}
                            className={sortConfig?.key === 'score' ? `sort-${sortConfig.direction}` : ''}
                        >
                            Score
                        </th>
                        <th
                            onClick={() => handleSort('date')}
                            className={sortConfig?.key === 'date' ? `sort-${sortConfig.direction}` : ''}
                        >
                            Date
                        </th>
                    </tr>
                </thead>
                    <tbody>
                        {sortedData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.player}</td>
                                <td>{row.score}</td>
                                <td>{row.date}</td>
                            </tr>
                        ))}
                        {/* Add empty rows to fill the space */}
                        {Array.from({ length: Math.max(0, 10 - data.length) }).map((_, index) => (
                            <tr key={`empty-${index}`}>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaderboardTable;
