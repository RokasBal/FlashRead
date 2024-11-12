import React from 'react';
import '../css/tables.css';
import { TableRow } from './types';

interface TableContentProps {
    data: TableRow[];
    headers: string[];
    sortConfig: { key: keyof TableRow; direction: 'asc' | 'desc' } | null;
    handleSort: (key: keyof TableRow) => void;
}

const TableContent: React.FC<TableContentProps> = ({ data, headers, sortConfig, handleSort }) => {
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
                    {sortedData.length > 0 ? (
                        sortedData.map((row, index) => (
                            <tr key={index}>
                                {headers.map((header) => (
                                    <td key={header}>{row[header]}</td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        Array.from({ length: 10 }).map((_, index) => (
                            <tr key={`empty-${index}`}>
                                {headers.map((header) => (
                                    <td key={header}>&nbsp;</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableContent;