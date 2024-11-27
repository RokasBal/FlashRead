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

interface HighScoreLeaderboardItem {
    name: string;
    score: number;
    gamemode: string;
}

const gameModes = [
    'All', 
    'Q&A', 
    'Catch the Word', 
    'BookScape'
];

const leaderboardTypes = [
    'High score', 
    'All time score'
];

const taskIdToGameMode: { [key: number]: string } = {
    1: "Q&A",
    2: "Catch the Word",
    3: "BookScape"
};

export const checkNextPage = async (pageNumber: number, type: string): Promise<boolean> => {
    try {
        if (type === "All time score") {
            const response = await axios.post('/api/Users/TotalScoreLeaderboard?page=' + pageNumber);
            return response.data.length === 0;
        } else if (type === "High score") {
            const response = await axios.post('/api/Users/HighScoreLeaderboard?page=' + pageNumber);
            return response.data.length === 0;
        }
    } catch (error) {
        console.error("Error checking next page:", error);
        return true;
    }
    return true;
};

export const handleTypeChoice = (choice: string, type: string,
    setType: React.Dispatch<React.SetStateAction<string>>,
    setPage: React.Dispatch<React.SetStateAction<number>>
) => {
    if (choice !== type) {
        if (choice === "All time score") {
            setType(choice);
            setPage(1);
        } else if (choice === "High score") {
            setType(choice);
            setPage(1);
        }
    }
};

export const fetchHighScoreLeaderboard = async (pageNumber: number,
    setPageUser: React.Dispatch<React.SetStateAction<number>>,
    setLeaderboadData: React.Dispatch<React.SetStateAction<TableRow[]>>,
    type: string,
    page: number,
    setIsNextPageBlank: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
    console.log("fetching high score leaderboard");
    try {
        const response = await axios.post('/api/Users/HighScoreLeaderboard?page=' + pageNumber);
        console.log("response", response);
        const transformedData = response.data.map((item: HighScoreLeaderboardItem) => {
            return {
                username: item.name,
                score: item.score,
                gamemode: taskIdToGameMode[Number(item.gamemode)],
            };
        });
        setPageUser(pageNumber);
        setLeaderboadData(transformedData);
        checkNextPage(page+1, type).then(setIsNextPageBlank);
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
};

export const handleSort = (key: keyof TableRow, setSortConfig: React.Dispatch<React.SetStateAction<{
    key: keyof TableRow;
    direction: "asc" | "desc";
} | null>>) => {
    setSortConfig((prevConfig) => {
        if (prevConfig && prevConfig.key === key) {
            return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
        }
        return { key, direction: 'asc' };
    });
};

export const fetchAllLeaderboard = async (pageNumber: number,
    setLeaderboadData: React.Dispatch<React.SetStateAction<TableRow[]>>,
    setPageUser: React.Dispatch<React.SetStateAction<number>>,
    page: number,
    type: string,
    setIsNextPageBlank: React.Dispatch<React.SetStateAction<boolean>>
) => {
    console.log("fetching all leaderboard");
    try {
        const response = await axios.post('/api/Users/TotalScoreLeaderboard?page=' + pageNumber);
        const transformedData = response.data.map((item: AllTimeLeaderboardItem) => {
            return {
                username: item.name,
                score: item.score,
            };
        });
        setLeaderboadData(transformedData);
        setPageUser(pageNumber);
        checkNextPage(page+1, type).then(setIsNextPageBlank);
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
};

const LeaderboardTable: React.FC = () => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof TableRow; direction: 'asc' | 'desc' } | null>(null);
    const [mode, setMode] = useState<string>('All');
    const [type, setType] = useState<string>('All time score'); 
    const [leaderboardData, setLeaderboadData] = useState<TableRow[]>([]);
    const [page, setPage] = useState<number>(1);
    const [isNextPageBlank, setIsNextPageBlank] = useState<boolean>(false);
    const [pageUser, setPageUser] = useState<number>(1);

    const headers = type === 'All time score' ? ['username', 'score'] : ['username', 'gamemode', 'score'];

    const filteredData = React.useMemo(() => {
        if (mode === 'All') {
            return leaderboardData;
        }
        return leaderboardData.filter(row => row.gamemode === mode);
    }, [leaderboardData, mode]);

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

    const filledData = React.useMemo(() => {
        const rowsPerPage = 10;
        const emptyRows = rowsPerPage - sortedData.length;
        const emptyRow = { username: '', score: '', gamemode: '' };
        return [...sortedData, ...Array(emptyRows).fill(emptyRow)];
    }, [sortedData]);

    const updatePage = async (pageNumber: number) => {
        setPage(pageNumber);
    }
    const handleTypeChoiceCall = () => (choice: string) => handleTypeChoice(choice, type, setType, setPage);
    const handleSortCall = (key: keyof TableRow) => handleSort(key, setSortConfig);
    useEffect(() => {
        if (type === "All time score") {
            fetchAllLeaderboard(page, setLeaderboadData, setPageUser, page, type, setIsNextPageBlank);
        } else {
            fetchHighScoreLeaderboard(page, setPageUser, setLeaderboadData, type, page, setIsNextPageBlank);
        }
    }, [page, type]);

    useEffect(() => {
        checkNextPage(page + 1, type).then(setIsNextPageBlank);
    },[pageUser]);
    return (
        <div className="customTableContainer">
            <div className="tableFilter">
                {type !== "All time score" && (
                    <ChoiceBox choices={gameModes} prompt='Modes:' onSelect={(choice: string) => setMode(choice)} label="Mode" defaultValue={mode} />
                )}
                <ChoiceBox choices={leaderboardTypes} prompt='Type:' onSelect={handleTypeChoiceCall()} label="Type" defaultValue={type} />
            </div>
            {/* <div className='containerCenter'> */}
                <TableContent data={filledData} headers={headers} sortConfig={sortConfig} handleSort={handleSortCall} />
            {/* </div> */}
            <div className="paginationControls">
                <div className="left">
                    {pageUser > 1 && (
                        <CustomButton label="Previous" className="wideButton" id="gameHistoryButton" onClick={() => updatePage(Math.max(page - 1, 1))}/>
                    )}
                </div>
                <div className="center">
                    <span className="pageIndicator">Page {pageUser}</span>
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