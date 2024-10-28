import React, { useEffect, useState } from 'react';
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
    const [detailContent, setDetailContent] = useState<JSX.Element | string>('Default Content');
    const [username, setUsername] = useState<string>('Error');
    const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const MAX_FILE_SIZE = 3 * 1024 * 1024;

    const handleEditClick = () => {
        setIsPopupVisible(true);
    };

    const handleButtonClick = (content: JSX.Element | string) => {
        setDetailContent(content);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        // TODO: HANDLE FILE UPLOADING
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
    }, []);

    const testData = [
        { gamemode: 'Mode 1', score: 100, date: '2023-01-01' },
        { gamemode: 'Mode 2', score: 200, date: '2023-01-02' },
        { gamemode: 'Mode 3', score: 300, date: '2023-01-03' },
    ];

    const leaderboardData = [
        { player: 'AAAA', score: 123123, date: '2023-01-01' },
        { player: 'BBBB', score: 5, date: '2023-01-02' },
        { player: 'CC', score: 9000, date: '2023-01-03' },
    ];

    return (
        <div className="profilePage">
            <div className="pageContainer">
                <div className="profileHeader">
                    <h1>Profile</h1>
                </div>

                <div className="content">
                    <div className="profileDetailsContainer">
                        <div className="profileDetails">
                            <ProfileCard imageSrc="https://www.shutterstock.com/shutterstock/photos/761854048/display_1500/stock-photo-oragne-fruit-on-wooden-background-orange-761854048.jpg" name={username} onEditClick={handleEditClick}/>
                        </div>    
                        <div className="restOfProfile">
                            <span>friends page?</span>
                            <span>account information?</span>
                        </div>
                    </div>
                    <div className="gameDetailsContainer">
                        <div className="detailHeader">
                            <button className="textButton" onClick={() => handleButtonClick(<HistoryTable data={testData} />)}>History</button>
                            <button className="textButton" onClick={() => handleButtonClick(<LeaderboardTable data={leaderboardData} />)}>Leaderboards</button>
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
                                <CustomButton label="Confirm" className="wideButton" id="popupConfirmButton" onClick={handleUpload} />
                            )}
                            <CustomButton label="Close" className="wideButton" id="popupCloseButton" onClick={() => setIsPopupVisible(false)} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProfilePage;