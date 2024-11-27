import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import CustomHyperlink from '../../components/buttons/hyperlink';
import CustomButton from "../../components/buttons/customButton.tsx";
import '../../boards/css/loginPage.css';
import '../../boards/css/buttons.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/authService';


const LoginPage: React.FC = () => {
    const { checkUserAuth, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let valid = true;
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
        if (valid) {
            try {
                await login(email, password);
                checkUserAuth();
            } catch (err) {
                console.error(err);

                if (err instanceof Error) {
                    console.log("Error message:", err);
                    console.log("Error message:", err.message);
                    if (err.message === 'User not found') {
                        setEmailError('User not found.');
                    } else if (err.message === 'Invalid password') {
                        setPasswordError('Incorrect password.');
                    } else {
                        setPasswordError('An unknown error occurred.');
                    }
                } else {
                    console.log('Error is not an instance of Error:', err);
                    setPasswordError('An unknown error occurred.');
                }
            }
        }
    };
    return (
        <div className="loginPage">

            <div className="loginContainer" id="loginContainer">

                <div className="loginPage_topDiv">
                    <h1 className="loginPage_title">Welcome back!</h1>
                </div>

                <div className="loginPage_loginDiv">
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
                                    borderColor: 'var(--borderColor)',
                                },
                                '&:hover fieldset': {
                                    borderWidth: '3px',
                                    borderColor: 'var(--borderColor)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderWidth: '3px',
                                    borderColor: '#1976d2',
                                },
                                width: '100%',
                            },
                        }}
                    />
                    <CustomButton label="Login" className="loginButton" id="loginPage_loginButton" onClick={() => {
                            handleSubmit(new Event('submit') as unknown as React.FormEvent);
                    }}/>
                </div>

                <div className="loginPage_bottomDiv">
                    <h1 className="loginPage_noAccountText">Don't have an account?</h1>

                    <div className="loginPage_links">
                        <CustomHyperlink href="/register" label="Register " className="hyperlink" onClick={() => navigate("/register")} />
                        <span className="smallText"> or </span>
                        <CustomHyperlink href="/guest" label=" continue as guest" className="hyperlink" onClick={() => navigate("/home")} />
                    </div>

                {/* <CustomButton label="Return" className="loginPage_returnButton" onClick={() => handlePageChange("selectionPage")}/> */}
                </div>

            </div>

        </div>
    );
};
export default LoginPage;

