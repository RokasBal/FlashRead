import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import CustomButton from "../../components/buttons/customButton.tsx";
import '../../boards/css/loginPage.css';
import '../../boards/css/changePassword.css';
import '../../boards/css/buttons.css';
import '../../boards/css/settings.css'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../components/axiosWrapper'

const ChangePassword: React.FC = () => {
    const isAuthenticated = useAuth();
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [repeatPasswordError, setRepeatPasswordError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let valid = true;

        if (!oldPassword) {
            setOldPasswordError('Please fill in your old password.');
            valid = false;
        } else {
            setOldPasswordError('');
        }

        if (!newPassword) {
            setNewPasswordError('Please fill in your new password.');
            valid = false;
        } else {
            setNewPasswordError('');
        }

        if (!repeatPassword) {
            setRepeatPasswordError('Please repeat your new password.');
            valid = false;
        } else if (newPassword !== repeatPassword) {
            setRepeatPasswordError('New passwords do not match.');
            valid = false;
        } else {
            setRepeatPasswordError('');
        }
        if (valid) {
            try {
                const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
                const token = tokenCookie ? tokenCookie.split('=')[1] : null;
                await axios.post('/api/Users/ChangePassword', {
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate('/settings');
            } catch (error) {
                console.error('Password change failed. Please try again.', error);
                setOldPasswordError("Old password is incorrect.");
            }
        }
    };

    return (
        <div className="changePasswordPage">

            <div className="changePasswordContainer" id="changePasswordContainer">

                <div className="changePassword_topDiv">
                    <h1 className="changePasswordPage_title">Change account password</h1>
                </div>

                <div className="changePassword_mainDiv">
                <TextField
                        label="Old password"
                        value={oldPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                        type="password"
                        error={!!oldPasswordError}
                        helperText={oldPasswordError}
                        sx={{
                            '& .MuiFormLabel-root': {
                                color: 'var(--textColor)', 
                                fontFamily: 'var(--fontStyle)',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderWidth: '3px',
                                    borderColor: 'var(--borderColor)', // Default border color
                                },
                                '&:hover fieldset': {
                                    borderWidth: '3px',
                                    borderColor: 'var(--borderColor)', // Border color on hover
                                },
                                '&.Mui-focused fieldset': {
                                    borderWidth: '3px',
                                    borderColor: '#1976d2', // Border color when focused
                                },

                                width: '100%',
                            },
                        }}
                    />
                    <TextField
                        label="New password"
                        value={newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                        type="password"
                        error={!!newPasswordError}
                        helperText={newPasswordError}
                        sx={{
                            '& .MuiFormLabel-root': {
                                color: 'var(--textColor)', 
                                fontFamily: 'var(--fontStyle)',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderWidth: '3px',
                                    borderColor: 'var(--borderColor)', // Default border color
                                },
                                '&:hover fieldset': {
                                    borderWidth: '3px',
                                    borderColor: 'var(--borderColor)', // Border color on hover
                                },
                                '&.Mui-focused fieldset': {
                                    borderWidth: '3px',
                                    borderColor: '#1976d2', // Border color when focused
                                },

                                width: '100%',
                            },
                        }}
                    />
                    <TextField
                        label="Repeat password"
                        value={repeatPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepeatPassword(e.target.value)}
                        type="password"
                        error={!!repeatPasswordError}
                        helperText={repeatPasswordError}
                        sx={{
                            '& .MuiFormLabel-root': {
                                color: 'var(--textColor)', 
                                fontFamily: 'var(--fontStyle)',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderWidth: '3px',
                                    borderColor: 'var(--borderColor)', // Default border color
                                },
                                '&:hover fieldset': {
                                    borderWidth: '3px',
                                    borderColor: 'var(--borderColor)', // Border color on hover
                                },
                                '&.Mui-focused fieldset': {
                                    borderWidth: '3px',
                                    borderColor: '#1976d2', // Border color when focused
                                },

                                width: '100%',
                            },
                        }}
                    />
                    <CustomButton 
                        label="Confirm" 
                        className="loginButton" 
                        id="registerPage_registerButton" 
                        onClick={() => {
                            console.log('Form submitted:', { oldPassword, newPassword, repeatPassword });
                            handleSubmit(new Event('submit') as unknown as React.FormEvent);
                        }}
                    />
                </div>

                <div className="changePasswordPage_bottomDiv">
                    <CustomButton label="Return" className="wideButton" id="settingsReturnButton" onClick={() => navigate("/settings")}/>
                </div>

            </div>   

        </div>     
    );
};

export default ChangePassword;

