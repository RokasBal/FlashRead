import React, { useState, useEffect } from 'react';
import '../css/tables.css';
import ChoiceBox from '../choiceBox.tsx';
import TableContent from './tableComponent.tsx';
import CustomButton from '../buttons/customButton.tsx';
import axios from '../../components/axiosWrapper';
import { TableRow } from './types';

interface AllTimeLeaderboardItem {
    name: string;
    score: number;
}

const LeaderboardTable: React.FC = () => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof TableRow; direction: 'asc' | 'desc' } | null>(null);
    const [mode, setMode] = useState<string>('All');
    const [type, setType] = useState<string>('All time score'); 
    const [leaderboardData, setLeaderboadData] = useState<TableRow[]>([]);
    const [page, setPage] = useState<number>(1);
    const [isNextPageBlank, setIsNextPageBlank] = useState<boolean>(false);

    const headers = type === 'All time score' ? ['username', 'score'] : ['username', 'gamemode', 'score'];

    const fetchAllLeaderboard = async (pageNumber: number) => {
        // console.log("FETCHING LEADERBOARD DATA FOR PAGE ", pageNumber);
        try {
            const response = await axios.post('/api/Users/TotalScoreLeaderboard?page=' + pageNumber);
            // console.log("API Response:", response.data);
            const transformedData = response.data.map((item: AllTimeLeaderboardItem) => {
                return {
                    username: item.name,
                    score: item.score,
                };
            });
            setLeaderboadData(transformedData);
            // console.log("Transformed Data:", transformedData);
        } catch (error) {
            console.error("Error fetching leaderboard data:", error);
        }
    };
    
    const fetchHighScoreLeaderboard = async (pageNumber: number) => {
        // console.log("FETCHING LEADERBOARD DATA FOR PAGE ", pageNumber);
        try {
            const response = await axios.post('/api/Users/TotalScoreLeaderboard?page=' + pageNumber);
            // console.log("API Response:", response.data);
            const transformedData = response.data.map((item: AllTimeLeaderboardItem) => {
                return {
                    username: item.name,
                    score: item.score,
                };
            });
            setLeaderboadData(transformedData);
            // console.log("Transformed Data:", transformedData);
        } catch (error) {
            console.error("Error fetching leaderboard data:", error);
        }
    };

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

    const filledData = React.useMemo(() => {
        const rowsPerPage = 10;
        const emptyRows = rowsPerPage - sortedData.length;
        const emptyRow = { username: '', score: '', gamemode: '' };
        return [...sortedData, ...Array(emptyRows).fill(emptyRow)];
    }, [sortedData]);

    const handleSort = (key: keyof TableRow) => {
        setSortConfig((prevConfig) => {
            if (prevConfig && prevConfig.key === key) {
                return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
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
            if (choice === "All time score") {
                setType(choice);
                setPage(1);
                fetchAllLeaderboard(1);
            } else if (choice === "High score") {
                setType(choice);
                setPage(1);
                fetchAllLeaderboard(1);
            }
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
                    <ChoiceBox choices={["All", "Q&A", "Catch The Word", "Mode 3"]} prompt='Modes:' onSelect={(choice: string) => setMode(choice)} label="Mode" defaultValue={mode} />
                )}
                <ChoiceBox choices={["High score", "All time score"]} prompt='Type:' onSelect={handleTypeChoice} label="Type" defaultValue={type} />
            </div>
            <TableContent data={filledData} headers={headers} sortConfig={sortConfig} handleSort={handleSort} />
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