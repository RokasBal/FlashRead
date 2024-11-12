import React, { useState, useEffect } from 'react';
import axios from '../../components/axiosWrapper';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../boards/css/settings.css';
import CustomButton from '../../components/buttons/customButton';
import EditableField from '../../components/editableField';
// import '../components/css/editableField.css';
import '../../boards/css/buttons.css';
import SettingsChoiceBox from '../../components/settingsChoiceBox';
import { useAuth } from '../../context/AuthContext';
import { useVisualSettings } from '../../context/VisualSettingsContext';
import Cookies from 'js-cookie';
import { changeFont, changeTheme } from '../../components/utils/visualSettingsUtils';

const fetchThemes = async (): Promise<string[]> => {
    try {
        const response = await axios.get('/api/Settings/GetAllThemes');
        return response.data;
    } catch (err) {
        console.error('Error fetching themes:', err);
        return [];
    }
};

const fetchFonts = async (): Promise<string[]> => {
    try {
        const response = await axios.get('/api/Settings/GetAllFonts');
        return response.data;
    } catch (err) {
        console.error('Error fetching themes:', err);
        return [];
    }
};

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { visualSettings, setVisualSettings } = useVisualSettings();
    const [themes, setThemes] = useState<string[]>([]);
    const [theme, setTheme] = useState<string>(visualSettings?.theme || 'defaultTheme');
    const [fonts, setFonts] = useState<string[]>([]);
    const [font, setFont] = useState<string>(visualSettings?.font || 'defaultFont');
    const [username, setUsername] = useState<string>('');

    const fetchAndSetThemes = async () => {
        const fetchedThemes = await fetchThemes();
        const capitalizedThemes = fetchedThemes.map(theme => theme.charAt(0).toUpperCase() + theme.slice(1));
        setThemes(capitalizedThemes);
    };

    const fetchAndSetFonts = async () => {
        const fetchedFonts = await fetchFonts();
        const capitalizedFonts = fetchedFonts.map(font => font.charAt(0).toUpperCase() + font.slice(1));
        setFonts(capitalizedFonts);
    };

    const fetchUsername = async () => {
        try {
            const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
            const token = tokenCookie ? tokenCookie.split('=')[1] : null;

            if (!token) {
                throw new Error('No auth token found');
            }

            const response = await axios.get('/api/User/GetCurrentUserName', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setUsername(response.data.name);
        } catch (err) {
            console.error('Error fetching username:', err);
        }
    }
    

    const fetchSettings = async () => {
        console.log("ATTEMPTING TO FETCH SETTINGS");
        try {
            const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
            const token = tokenCookie ? tokenCookie.split('=')[1] : null;

            if (!token) {
                throw new Error('No auth token found');
            }
    
            const themeResponse = await axios.get('/api/User/GetThemeSettings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log("THEME RESPONSE ", themeResponse.data);
    
            const fontResponse = await axios.get('/api/User/GetFontSettings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log("FONT RESPONSE ", fontResponse.data);
    
            const capitalizedTheme = themeResponse.data.theme.charAt(0).toUpperCase() + themeResponse.data.theme.slice(1);
            const capitalizedFont = fontResponse.data.font.charAt(0).toUpperCase() + fontResponse.data.font.slice(1);
            setTheme(capitalizedTheme);
            setFont(capitalizedFont);
        } catch (err) {
            if (isAxiosError(err)) {
                console.error('Error fetching settings:', err.response?.data || err.message);
            } else {
                console.error('Error fetching settings:', err);
            }
        }
    }

    useEffect(() => {
        fetchUsername();
        fetchAndSetThemes();
        fetchAndSetFonts();

        if (isAuthenticated) {
            // console.log("AUTHENTICATED IN USE EFFECT");
            fetchSettings();
        } else {
            // console.log("NOT AUTHENTICATED IN USE EFFECT");
            const getSettingsFromCookie = async () => {
                const settingsJson = Cookies.get('visualSettings');
                if (settingsJson) {
                    const settings = JSON.parse(settingsJson);
                    const capitalizedTheme = settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1);
                    setTheme(capitalizedTheme);
                    console.log('Loaded theme from cookie:', settings.theme);
                }
            }
            getSettingsFromCookie();
        }

        // console.log("THEME IN USE EFFECT: ", theme);
    },);

    useEffect(() => {
        console.log("username: ", username);
    }, [username]);
    
    
    const handleFontChange = (newFont: string) => {
        console.log("FONT IN HANDLE FONT CHANGE: ", newFont);
        setFont(newFont);
        changeFont(newFont);
        sendSettingsUpdate(theme, newFont);
    };
    

    const handleThemeChange = async (theme: string) => {
        const lowerCaseTheme = theme.toLowerCase();
        setTheme(theme);
        changeTheme(lowerCaseTheme);
        sendSettingsUpdate(lowerCaseTheme, font);
    };

    const handleChangeName = async (newName: string) => {
        try {
            const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
            const token = tokenCookie ? tokenCookie.split('=')[1] : null;
            if (!token) {
                throw new Error('No auth token found');
            }
            console.log("UPDATE NAME: ", newName);
            await axios.post('/api/Users/ChangeUserName', {
                newName: newName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Username change failed. Please try again.', err);
        }
    };

    const sendSettingsUpdate = (theme: string, font: string) => {
        const newSettings = { theme, font };
        setVisualSettings(newSettings);
        if (isAuthenticated) {
            updateSettings(newSettings);
        } else {
            saveSettingsToCookie(newSettings);
        }
    };

    const updateSettings = async (settings: { theme: string, font: string }) => {
        try {
            const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
            const token = tokenCookie ? tokenCookie.split('=')[1] : null;
            console.log("SETTINGS PAGE THEME IN UPDATE: ", settings.theme);
            await axios.post('/api/Settings/UpdateTheme', null, {
                params: { theme: settings.theme },
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Error updating theme settings:', err);
        }
    
        try {
            const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
            const token = tokenCookie ? tokenCookie.split('=')[1] : null;
            console.log("SETTINGS PAGE FONT IN UPDATE: ", settings.font);
            await axios.post('/api/Settings/UpdateFont', null, {
                params: { font: settings.font },
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Error updating font settings:', err);
        }
    };

    const saveSettingsToCookie = (settings: { theme: string, font: string }) => {
        const settingsJson = JSON.stringify(settings);
        Cookies.set('visualSettings', settingsJson, { path: '/', secure: true, sameSite: 'Strict' });
    }

    if(!isAuthenticated) {
        return (
            <div className="settingsPage">
                <div className="settingsHeader">
                    <h1 className="settingsHeaderText">Settings</h1>
                </div>
    
                <div className="settingsContent">
                    <SettingsChoiceBox label="Theme" value={theme} options={themes} onChange={choice => handleThemeChange(choice)}/>
                    <SettingsChoiceBox label="Font" value={font} options={fonts} onChange={choice2 => handleFontChange(choice2)}/>
                </div>
    
                <div className="settingsFooter">
                    <CustomButton label="Return" className="wideButton" id="settingsReturnButton" onClick={() => navigate("/home")}/>
                </div>
            </div>
        );       
    } else {
        return (
            <div className="settingsPage">
                <div className="settingsHeader">
                    <h1 className="settingsHeaderText">Settings</h1>
                </div>
    
                <div className="settingsContentAuth">
                    <div className="settingsColumn">
                        <SettingsChoiceBox label="Theme" value={theme} options={themes} onChange={choice => handleThemeChange(choice)}/>
                        <SettingsChoiceBox label="Font" value={font} options={fonts} onChange={choice3 => handleFontChange(choice3)}/>
                    </div>
                    <div className="settingsColumn">
                        <EditableField label="Profile Name: " initialValue={username} onSave={handleChangeName} />
                        <div className="settingsButtonContainer">
                            <CustomButton label="Change Password" className="settingButton" id="settingsChangePasswordButton" onClick={() => navigate("/changePassword")}/>
                            <CustomButton label="Delete Account" className="settingButton" id="settingsDeleteAccountButton" onClick={() => navigate("/deleteAccount")}/>
                        </div>
                    </div>
                </div>
    
                <div className="settingsFooter">
                    <CustomButton label="Return" className="wideButton" id="settingsReturnButton" onClick={() => navigate("/home")}/>
                </div>
            </div>
        );
    }
}

export default SettingsPage;