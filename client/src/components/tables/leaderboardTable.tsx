import React, { useState, useEffect } from 'react';
import '../css/tables.css';
import ChoiceBox from '../choiceBox.tsx';
import TableContent from './tableComponent.tsx';
import axios from '../../components/axiosWrapper';

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
    const [mode, setMode] = useState<string>('Q&A');
    const [type, setType] = useState<string>('High score');
    const [leaderboardData, setLeaderboadData] = useState<any[]>([]);

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

    interface GameHistoryItem {
        username: string;
        taskId: number;
        score: number;
    }

    const taskIdToGameMode: { [key: number]: string } = {
        1: "Q&A",
        2: "Catch the Word"
    };

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

    const fetchData = async () => {
        console.log("FETCHING LEADERBOARD DATA");
        if (type === 'High score') {
            try {
                const response = await axios.get('/api/Users/totalScoreLeaderboard');
                const transformedData = response.data.map((item: GameHistoryItem) => {
                    return {
                        username: item.username,
                        gamemode: taskIdToGameMode[item.taskId] || "Unknown",
                        score: item.score,
                    };
                });
                console.log(data);
            } catch (error) {
                console.error(error);
            }
        } else if (type === 'All time score') {
            try {
                const response = await axios.get('/api/Users/totalScoreLeaderboard');
                const transformedData = response.data.map((item: GameHistoryItem) => {
                    return {
                        username: item.username,
                        gamemode: taskIdToGameMode[item.taskId] || "Unknown",
                        score: item.score,
                    };
                });
                console.log(data);
            } catch (error) {
                console.error(error);
            }
        }
    }  

    const handleTypeChoice = (choice: string) => {
        setType(choice);
        fetchData();
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="customTableContainer">
            <div className="tableFilter">
                <ChoiceBox choices={["Q&A", "Catch The Word", "Mode 3"]} prompt='Modes:' onSelect={(choice: string) => console.log(choice)} label="Mode"/>
                <ChoiceBox choices={["High score", "All time score"]} prompt='Type:' onSelect={handleTypeChoice} label="Type"/>
            </div>
            <TableContent data={leaderboardData} sortConfig={sortConfig} handleSort={handleSort} />
        </div>
    );
};

export default LeaderboardTable;
