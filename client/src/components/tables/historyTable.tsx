import React, { useState } from 'react';
import '../css/tables.css';
import ChoiceBox from '../choiceBox';
import TableContent from './tableComponent';
import { TableRow } from './types';

interface CustomTableProps {
    data: TableRow[];
}

const HistoryTable: React.FC<CustomTableProps> = ({ data }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof TableRow; direction: 'asc' | 'desc' } | null>(null);
    const [selectedMode, setSelectedMode] = useState<string>('All');

    const headers = ['gamemode', 'score', 'date'];

    const filteredData = React.useMemo(() => {
        if (selectedMode === 'All') {
            return data;
        }
        return data.filter(row => row.gamemode === selectedMode);
    }, [data, selectedMode]);

    const sortedData = React.useMemo(() => {
        if (sortConfig !== null) {
            return [...filteredData].sort((a, b) => {
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
        return filteredData;
    }, [filteredData, sortConfig]);

    const handleSort = (key: keyof TableRow) => {
        setSortConfig((prevConfig) => {
            if (prevConfig && prevConfig.key === key) {
                return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const handleChoice = (choice: string) => {
        setSelectedMode(choice);
    }

    return (
        <div className="customTableContainer">
            <div className="tableFilter">
                <ChoiceBox 
                    choices={["All", "Q&A", "Catch The Word", "Mode 3"]} 
                    prompt='Modes:' 
                    onSelect={choice => handleChoice(choice)} 
                    label="Mode" 
                    defaultValue={selectedMode}
                />
            </div>
            <TableContent data={sortedData} headers={headers} sortConfig={sortConfig} handleSort={handleSort} />
        </div>
    );
};

export default HistoryTable;