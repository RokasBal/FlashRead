import React, { useState, useEffect } from 'react';
import '../css/tables.css';
import ChoiceBox from '../choiceBox.tsx';
import TableContent from './tableComponent.tsx';
import CustomButton from '../buttons/customButton.tsx';
import axios from '../../components/axiosWrapper';
import { TableRow } from './types';

interface CustomTableProps {
    data: TableRow[];
}

const LeaderboardTable: React.FC<CustomTableProps> = ({ data }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof TableRow; direction: 'asc' | 'desc' } | null>(null);
    const [mode, setMode] = useState<string>('Q&A');
    const [type, setType] = useState<string>('All time score'); // Set default type to "All time score"
    const [leaderboardData, setLeaderboadData] = useState<TableRow[]>([]);
    const [page, setPage] = useState<number>(1);
    const [isNextPageBlank, setIsNextPageBlank] = useState<boolean>(false);

    // Sort the data based on the current sorting configuration
    const sortedData = React.useMemo(() => {
        if (sortConfig !== null) {
            return [...leaderboardData].sort((a, b) => {
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
        return leaderboardData;
    }, [leaderboardData, sortConfig]);

    interface GameHistoryItem {
        name: string;
        score: number;
    }

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

    const fetchAllLeaderboard = async (pageNumber: number) => {
        // console.log("FETCHING LEADERBOARD DATA FOR PAGE ", pageNumber);
        try {
            const response = await axios.post('/api/Users/TotalScoreLeaderboard?page=' + pageNumber);
            // console.log("API Response:", response.data);
            const transformedData = response.data.map((item: GameHistoryItem) => {
                return {
                    username: item.name, // Map 'name' to 'username'
                    score: item.score,
                };
            });
            setLeaderboadData(transformedData);
            // console.log("Transformed Data:", transformedData);
        } catch (error) {
            console.error("Error fetching leaderboard data:", error);
        }
    };

    const checkNextPage = async (pageNumber: number) => {
        try {
            const response = await axios.post('/api/Users/TotalScoreLeaderboard?page=' + pageNumber);
            return response.data.length === 0;
        } catch (error) {
            console.error("Error checking next page:", error);
            return true;
        }
    };

    const updatePage = async (pageNumber: number) => {
        const nextPageBlank = await checkNextPage(pageNumber + 1);
        setIsNextPageBlank(nextPageBlank);
        setPage(pageNumber);
        fetchAllLeaderboard(pageNumber);
    }

    const handleTypeChoice = (choice: string) => {
        if (choice !== type) {
            setType(choice);
            setPage(1);
            fetchAllLeaderboard(1);
        }
    };

    useEffect(() => {
        fetchAllLeaderboard(page);
        checkNextPage(page + 1).then(setIsNextPageBlank);
    }, [page]);

    return (
        <div className="customTableContainer">
            <div className="tableFilter">
                {type !== "All time score" && (
                    <ChoiceBox choices={["Q&A", "Catch The Word", "Mode 3"]} prompt='Modes:' onSelect={(choice: string) => setMode(choice)} label="Mode"/>
                )}
                <ChoiceBox choices={["High score", "All time score"]} prompt='Type:' onSelect={handleTypeChoice} label="Type" defaultValue="All time score" />
            </div>
            <TableContent data={sortedData} sortConfig={sortConfig} handleSort={handleSort} />
            <div className="paginationControls">
                <div className="left">
                    {page > 1 && (
                        <CustomButton label="Previous" className="wideButton" id="gameHistoryButton" onClick={() => updatePage(Math.max(page - 1, 1))}/>
                    )}
                </div>
                <div className="center">
                    <span className="pageIndicator">Page {page}</span>
                </div>
                <div className="right">
                    {!isNextPageBlank && (
                        <CustomButton label="Next" className="wideButton" id="gameHistoryButton" onClick={() => updatePage(page + 1)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardTable;