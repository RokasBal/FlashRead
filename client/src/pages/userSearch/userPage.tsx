import React, { useEffect, useState } from 'react';
import axios from '../../components/axiosWrapper';
import '../../boards/css/profile.css';
import '../../boards/css/buttons.css';
import CustomButton from "../../components/buttons/customButton.tsx";
import ProfileCard from "../../components/profileCard.tsx";
import HistoryTable from '../../components/tables/historyTable.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { TableRow } from '../../components/tables/types.ts';

interface GameHistoryItem {
    taskId: number;
    score: number;
    timePlayed: string;
}

const UserPage: React.FC = () => {
    const [gameHistory, setGameHistory] = useState<TableRow[]>([]);
    const [detailContent, setDetailContent] = useState<JSX.Element | string>();
    const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
    const [joinDate, setJoinDate] = useState<string>("");
    const [gamesPlayed, setGamesPlayed] = useState<number>(0);
    const [totalScore, setTotalScore] = useState<number>(0);
    const navigate = useNavigate();

    const { username = '' } = useParams<{ username: string}>();

    const taskIdToGameMode: { [key: number]: string } = {
        1: "Q&A",
        2: "Catch the Word",
        3: "BookScape"
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get('/api/User/GetUserPageData', {
                params: { username : username }
            });
            console.log('User data:', response.data);
            // Profile picture
            if (response.data.profilePic) {
                const byteCharacters = atob(response.data.profilePic);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const profilePicBlob = new Blob([byteArray], { type: 'image/png' });
                const imageUrl = URL.createObjectURL(profilePicBlob);
                setProfilePictureUrl(imageUrl);
            } else {
                console.warn('No profile picture data available');
            }

            // History data
            let totalScore = 0;
            const transformedData = response.data.history.map((item: GameHistoryItem) => {
                const date = new Date(item.timePlayed);
                const formattedDate = date.toLocaleDateString('en-CA');
                const formattedTime = date.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false });

                totalScore += item.score;

                return {
                    gamemode: taskIdToGameMode[item.taskId] || "Unknown",
                    score: item.score,
                    date: `${formattedDate}, ${formattedTime}`
                };
            })

            setGamesPlayed(transformedData.length);
            setGameHistory(transformedData);
            setTotalScore(totalScore);
            
            // Join date
            const joinedAt = new Date(response.data.joinedAt);
            const formattedDate = `${joinedAt.getFullYear()}-${String(joinedAt.getMonth() + 1).padStart(2, '0')}-${String(joinedAt.getDate()).padStart(2, '0')}`;
            setJoinDate(formattedDate);

        } catch (err) {
            console.error('Error fetching user data:', err);
        }

    };

    const updateDetailContent = async () => {
        console.log("updateDetailContent");
        setDetailContent(<HistoryTable data={gameHistory} />);
    };

    useEffect(() => {
        updateDetailContent();
    }, [gameHistory]);

    useEffect(() => {
        fetchUserData();
    }, [username]);

    return (
        <div className="profilePage">
            <div className="pageContainer">
                <div className="profileHeader">
                    <h1>Profile</h1>
                </div>

                <div className="content">
                    <div className="profileDetailsContainer">
                        <div className="profileDetails">
                            <ProfileCard imageSrc={profilePictureUrl} name={username} onEditClick={()=>{}}/>
                        </div>    
                        <div className="restOfProfile">
                            <div className="accountInfoContainer">
                                <div className="accountInfoHeader">
                                    <h1>Account Statistics</h1>
                                </div>
                                <div className="accountInfoContent">
                                    <div className="accountInfoItem">
                                        <h2>Games played:</h2>
                                        <p>{gamesPlayed}</p>
                                    </div>
                                    <div className="accountInfoItem">
                                        <h2>Total score:</h2>
                                        <p>{totalScore}</p>
                                    </div>
                                    <div className="accountInfoItem">
                                        <h2>Join date:</h2>
                                        <p>{joinDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="gameDetailsContainer">
                        <div className="detailContent">
                            {detailContent}
                        </div>
                    </div>
                </div>

                <div className="footer">
                    <CustomButton label="Return" className="wideButton" id="settingsReturnButton" onClick={() => navigate("/search")}/>
                </div>
            </div>
        </div>
    );
};

export default UserPage;