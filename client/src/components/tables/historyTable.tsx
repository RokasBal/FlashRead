import React from 'react';
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
    return (
        <div className="customTableContainer">
            <div className="tableFilter">
                <span>TODO - add filter dropdowns</span>
            </div>
            <div className="tableContent">
                <table className="customTable">
                    <thead>
                        <tr>
                            <th>Gamemode</th>
                            <th>Score</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
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