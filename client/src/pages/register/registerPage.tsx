import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import CustomButton from "../../components/buttons/customButton.tsx";
import CustomHyperlink from '../../components/buttons/hyperlink';
import '../../boards/css/loginPage.css';
import '../../boards/css/buttons.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register } from '../../services/authService';

const RegisterPage: React.FC = () => {
    const { checkUserAuth, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [repeatPasswordError, setRepeatPasswordError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let valid = true;

        if (!username) {
            setUsernameError('Please fill in the username.');
            valid = false;
        } else {
            setUsernameError('');
        }

        if (!email) {
            setEmailError('Please fill in the email.');
            valid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Please fill in the password.');
            valid = false;
        } else {
            setPasswordError('');
        }

        if (!repeatPassword) {
            setRepeatPasswordError('Please fill in the repeat password.');
            valid = false;
        } else if (password !== repeatPassword) {
            setRepeatPasswordError('Passwords do not match.');
            valid = false;
        } else {
            setRepeatPasswordError('');
        }


        if (valid) {
            try {
                await register(email, password, username);
                checkUserAuth();
            } catch (error) {
                console.error('Register failed. Please try again.', error);
                if (error instanceof Error) {
                    if (error.message.includes('A user with this username already exists.')) {
                        setUsernameError('User already exists.');
                    } else if (error.message.includes('A user with this email already exists.')) {
                        setEmailError('Email already in use.');
                    }
                } else {
                    setUsernameError('An unknown error occurred.');
                }
            }
        }
    };
    return (
        <div className="registerPage">

            <div className="registerContainer" id="registerContainer">

            <div className="registerPage_topDiv">
                <h1 className="loginPage_title">Create an account</h1>
            </div>

            <div className="registerPage_registerDiv">
            <TextField 
                        variant='outlined'
                        label="Username"
                        value={username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                        error={!!usernameError}
                        helperText={usernameError}
                        sx={{
                            '& .MuiFormLabel-root': {
                                color: 'var(--textColor)', 
                                fontFamily: 'var(--fontStyle)',
                            },
                            '& .MuiFormLabel-root.Mui-focused': {
                                color: '#1976d2',
                            },
                            '& .MuiInputBase-input': {
                                fontFamily: 'var(--fontStyle)',
                                color: 'var(--textColor)',
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
                    variant='outlined'
                    label="Email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    error={!!emailError}
                    helperText={emailError}
                    sx={{
                        '& .MuiFormLabel-root': {
                                color: 'var(--textColor)', 
                                fontFamily: 'var(--fontStyle)',
                            },
                            '& .MuiFormLabel-root.Mui-focused': {
                                color: '#1976d2',
                            },
                            '& .MuiInputBase-input': {
                                fontFamily: 'var(--fontStyle)',
                                color: 'var(--textColor)',
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
                    label="Password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    type="password"
                    error={!!passwordError}
                    helperText={passwordError}
                    sx={{
                        '& .MuiFormLabel-root': {
                                color: 'var(--textColor)', 
                                fontFamily: 'var(--fontStyle)',
                            },
                            '& .MuiFormLabel-root.Mui-focused': {
                                color: '#1976d2',
                            },
                            '& .MuiInputBase-input': {
                                fontFamily: 'var(--fontStyle)',
                                color: 'var(--textColor)',
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
                            '& .MuiFormLabel-root.Mui-focused': {
                                color: '#1976d2',
                            },
                            '& .MuiInputBase-input': {
                                fontFamily: 'var(--fontStyle)',
                                color: 'var(--textColor)',
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
                    label="Register" 
                    className="loginButton" 
                    id="registerPage_registerButton" 
                    onClick={() => {
                        console.log('Form submitted:', { username, email, password, repeatPassword });
                        handleSubmit(new Event('submit') as unknown as React.FormEvent);
                    }}
                />
            </div>

            <div className="registerPage_bottomDiv">
                <h1 className="loginPage_noAccountText">Already have an account?</h1>

                <div className="loginPage_links">
                    <CustomHyperlink href="/login" label="Login " className="hyperlink" onClick={() => navigate("/login")} />
                    <span className="smallText"> or </span>
                    <CustomHyperlink href="/guest" label=" continue as guest" className="hyperlink" onClick={() => navigate("/home")} />
                </div>
            </div>

            </div>   

        </div>     
    );
};

export default RegisterPage;

