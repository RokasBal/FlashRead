import React, { useState } from 'react';
import '../css/tables.css';

interface TableRow {
    gamemode: string;
    score: number;
    date: string;
}

interface CustomTableProps {
    data: TableRow[];
}

const HistoryTable: React.FC<CustomTableProps> = ({ data }) => {
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
                <span>TODO - add filter dropdowns</span>
            </div>
            <div className="tableContent">
                <table className="customTable">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('gamemode')}>
                                Gamemode {sortConfig?.key === 'gamemode' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('score')}>
                                Score {sortConfig?.key === 'score' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('date')}>
                                Date {sortConfig?.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.gamemode}</td>
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

export default HistoryTable;
