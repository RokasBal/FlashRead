import React, { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';
import axios from '../../components/axiosWrapper';
import '../../boards/css/profile.css';
import '../../boards/css/buttons.css';
import CustomButton from "../../components/buttons/customButton.tsx";
import ProfileCard from "../../components/profileCard.tsx";
import HistoryTable from '../../components/tables/historyTable.tsx';
import LeaderboardTable from '../../components/tables/leaderboardTable.tsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TableRow } from '../../components/tables/types.ts';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

interface GameHistoryItem {
    taskId: number;
    score: number;
    timePlayed: string;
}

const ProfilePage: React.FC = () => {
    const [gameHistory, setGameHistory] = useState<TableRow[]>([]);
    const [detailContent, setDetailContent] = useState<JSX.Element | string>();
    const [username, setUsername] = useState<string>('');
    const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
    const [joinDate, setJoinDate] = useState<string>("");
    const [gamesPlayed, setGamesPlayed] = useState<number>(0);
    const [totalScore, setTotalScore] = useState<number>(0);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const taskIdToGameMode: { [key: number]: string } = {
        1: "Q&A",
        2: "Catch the Word"
    };

    const fetchGameHistory = async () => {
        try {
            const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
            const token = tokenCookie ? tokenCookie.split('=')[1] : null;

            if (!token) {
                throw new Error('No auth token found');
            }

            const response = await axios.get('/api/Users/GetUserHistory', {
                headers: { Authorization: `Bearer ${token}` }
            });

            let totalScore = 0;
            const transformedData = response.data.map((item: GameHistoryItem) => {
                const date = new Date(item.timePlayed);
                const formattedDate = date.toLocaleDateString('en-CA');
                const formattedTime = date.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false });

                totalScore += item.score;

                return {
                    gamemode: taskIdToGameMode[item.taskId] || "Unknown",
                    score: item.score,
                    date: `${formattedDate}, ${formattedTime}`
                };
            });

            setGamesPlayed(transformedData.length);
            setGameHistory(transformedData);
            setTotalScore(totalScore);
        } catch (err) {
            console.error('Error fetching game history:', err);
        }
    };

    const fetchProfilePicture = async () => {
        try {
            const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
            const token = tokenCookie ? tokenCookie.split('=')[1] : null;
            const response = await axios.get('/api/Settings/GetProfilePicture', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const imageUrl = URL.createObjectURL(response.data);
            setProfilePictureUrl(imageUrl);
        } catch (err) {
            console.error('Error fetching profile picture:', err);
        }
    };

    const fetchUsername = async () => {
        try {
            const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
            const token = tokenCookie ? tokenCookie.split('=')[1] : null;
            const response = await axios.get('/api/User/GetUserInfo',{
                headers: { Authorization: `Bearer ${token}` }
            });
            const joinedAt = new Date(response.data.joinedAt);
            const formattedDate = `${joinedAt.getFullYear()}-${String(joinedAt.getMonth() + 1).padStart(2, '0')}-${String(joinedAt.getDate()).padStart(2, '0')}`;
            setUsername(response.data.name);
            setJoinDate(formattedDate);

        } catch (err) {
            console.error('Error fetching username:', err);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                alert('File size exceeds the 2MB limit. Please select a smaller file.');
                return;
            }
            try {
                const options = {
                    maxSizeMB: 0.3, 
                    maxWidthOrHeight: 360,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);
                setSelectedFile(compressedFile);
                setPreviewUrl(URL.createObjectURL(compressedFile));
                // console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                // console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
            } catch (error) {
                console.error('Error compressing the image:', error);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const formData = new FormData();
            formData.append('profilePicture', selectedFile);

            const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
            const token = tokenCookie ? tokenCookie.split('=')[1] : null;

            const response = await axios.post('/api/Settings/UpdateProfilePicture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setProfilePictureUrl(URL.createObjectURL(selectedFile));
            } else {
                alert('Failed to update profile picture.');
            }
        } catch (error) {
            console.error('Error uploading the profile picture:', error);
            alert('Error uploading the profile picture.');
        }

        setIsPopupVisible(false);
    };

    const handleEditClick = () => {
        setIsPopupVisible(true);
    };

    const handleButtonClick = (content: JSX.Element | string) => {
        setDetailContent(content);
    };

    useEffect(() => {
        if(!isAuthenticated){
            navigate('/login');
        }

        fetchUsername();
        fetchProfilePicture();
        fetchGameHistory();
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const updateDetailContent = async () => {
            setDetailContent(<HistoryTable data={gameHistory} />);
        };

        updateDetailContent();
    }, [gameHistory]);

    return (
        <div className="profilePage">
            <div className="pageContainer">
                <div className="profileHeader">
                    <h1>Profile</h1>
                </div>

                <div className="content">
                    <div className="profileDetailsContainer">
                        <div className="profileDetails">
                            <ProfileCard imageSrc={profilePictureUrl} name={username} onEditClick={handleEditClick}/>
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
                        <div className="detailHeader">
                            <CustomButton label="Game history" className="wideButton" id="gameHistoryButton" onClick={() => handleButtonClick(<HistoryTable data={gameHistory} />)}/>
                            <CustomButton label="Leaderboards" className="wideButton" id="leaderboardsButton" onClick={() => handleButtonClick(<LeaderboardTable/>)}/>
                        </div>
                        <div className="detailContent">
                            {detailContent}
                        </div>
                    </div>
                </div>

                <div className="footer">
                    <CustomButton label="Return" className="wideButton" id="settingsReturnButton" onClick={() => navigate("/home")}/>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;