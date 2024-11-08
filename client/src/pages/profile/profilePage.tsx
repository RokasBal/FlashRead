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

const ProfilePage: React.FC = () => {
    const [gameHistory, setGameHistory] = useState<any[]>([]);
    const [detailContent, setDetailContent] = useState<JSX.Element | string>();
    const [detailFilters, setDetailFilters] = useState<JSX.Element | string>('Default Filters');
    const [username, setUsername] = useState<string>('Error');
    const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const MAX_FILE_SIZE = 2 * 1024 * 1024;

    const taskIdToGameMode: { [key: number]: string } = {
        1: "Q&A",
        2: "Catch the Word"
    };
    
    interface GameHistoryItem {
        taskId: number;
        score: number;
        timePlayed: string;
    }
    
    const handleEditClick = () => {
        setIsPopupVisible(true);
    };

    const handleButtonClick = (content: JSX.Element | string) => {
        setDetailContent(content);
    };

    const fetchGameHistory = async () => {
        try {
            const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
            const token = tokenCookie ? tokenCookie.split('=')[1] : null;
            const response = await axios.get('/api/Users/GetUserHistory', {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const transformedData = response.data.map((item: GameHistoryItem) => {
                const date = new Date(item.timePlayed);
                const formattedDate = date.toLocaleDateString('en-CA');
                const formattedTime = date.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false });
    
                return {
                    gamemode: taskIdToGameMode[item.taskId] || "Unknown",
                    score: item.score,
                    date: `${formattedDate}, ${formattedTime}`
                };
            });
    
            setGameHistory(transformedData);
            console.log('Game history:', transformedData);
        } catch (err) {
            console.error('Error fetching game history:', err);
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
                    maxSizeMB: 0.2, 
                    maxWidthOrHeight: 256,
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
                // alert('Profile picture updated successfully.');
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
            const response = await axios.get('/api/User/GetCurrentUserName',{
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsername(response.data.name);
        } catch (err) {
            console.error('Error fetching username:', err);
        }
    }

    useEffect(() => {
        if(!isAuthenticated){
            navigate('/login');
        }

        fetchUsername();
        fetchProfilePicture();
        fetchGameHistory();
    }, []);

    useEffect(() => {
        const updateDetailContent = async () => {
            if (gameHistory.length > 0) {
                // Wait until gameHistory is fetched
                setDetailContent(<HistoryTable data={gameHistory} />);
            }
        };

        updateDetailContent();
    }, [gameHistory]);

    // const testData = [
    //     { gamemode: 'Mode 1', score: 100, date: '2023-01-01' },
    //     { gamemode: 'Mode 2', score: 200, date: '2023-01-02' },
    //     { gamemode: 'Mode 3', score: 300, date: '2023-01-03' },
    // ];

    // const leaderboardData = [
    //     { player: 'AAAA', score: 123123, date: '2023-01-01' },
    //     { player: 'BBBB', score: 5, date: '2023-01-02' },
    //     { player: 'CC', score: 9000, date: '2023-01-03' },
    // ];

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
                            {/* <span>friends page?</span>
                            <span>account information?</span> */}
                        </div>
                    </div>
                    <div className="gameDetailsContainer">
                        <div className="detailHeader">
                            <CustomButton label="Game history" className="wideButton" id="gameHistoryButton" onClick={() => handleButtonClick(<HistoryTable data={gameHistory} />)}/>
                            <CustomButton label="Leaderboards" className="wideButton" id="leaderboardsButton" onClick={() => handleButtonClick(<LeaderboardTable data={gameHistory} />)}/>
                            {/* <button className="textButton" onClick={() => handleButtonClick(<HistoryTable data={testData} />)}>History</button> */}
                            {/* <button className="textButton" onClick={() => handleButtonClick(<LeaderboardTable data={leaderboardData} />)}>Leaderboards</button> */}
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

            {isPopupVisible && (
                <div className="popupOverlay">
                    <div className="popupContent">
                        <div className="popupHeader">
                            <h1 className="popupTitle">Change Profile Picture</h1>
                        </div>
                        <div className="popupUpload">
                            {previewUrl && (
                                <div className="imagePreview">
                                    <img src={previewUrl} alt="Selected profile" className="styledImage" />
                                </div>
                            )}
                            <label className="customFileUpload">
                                <input type="file" accept="image/*" onChange={handleFileChange} />
                                Browse
                            </label>
                        </div>
                        <div className="popupFooter">
                            {previewUrl && (
                                <CustomButton label="Confirm" className="popupButton" id="popupConfirmButton" onClick={handleUpload} />
                            )}
                            <CustomButton label="Close" className="popupButton" id="popupCloseButton" onClick={() => setIsPopupVisible(false)} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProfilePage;