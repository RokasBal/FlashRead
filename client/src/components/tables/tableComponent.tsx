import React from 'react';
import '../css/tables.css';
import { TableRow } from './types';

interface TableContentProps {
    data: TableRow[];
    sortConfig: { key: keyof TableRow; direction: 'asc' | 'desc' } | null;
    handleSort: (key: keyof TableRow) => void;
}

const TableContent: React.FC<TableContentProps> = ({ data, sortConfig, handleSort }) => {
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

    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    return (
        <div className="tableContent">
            <table className="customTable">
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header}
                                onClick={() => handleSort(header as keyof TableRow)}
                                className={sortConfig?.key === header ? `sort-${sortConfig.direction}` : ''}
                            >
                                {header.charAt(0).toUpperCase() + header.slice(1)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => (
                        <tr key={index}>
                            {headers.map((header) => (
                                <td key={header}>{row[header]}</td>
                            ))}
                        </tr>
                    ))}
                    {/* Add empty rows to fill the space */}
                    {Array.from({ length: Math.max(0, 10 - sortedData.length) }).map((_, index) => (
                        <tr key={`empty-${index}`}>
                            {headers.map((header) => (
                                <td key={header}>&nbsp;</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableContent;