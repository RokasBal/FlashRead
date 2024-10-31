import React from 'react';
import '../../boards/css/contact.css';

import CustomButton from "../../components/buttons/customButton.tsx";
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';


const AboutPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="contactPage">
            <div className="pageContainer">
                <div className="header">
                    <h1>Contacts</h1>
                </div>

                <div className="contact_content">
                    <div className="contact_left">

                    </div>
                    <div className="contact_right">
                        <p>Get in Touch</p>
                        <TextField 
                        variant='outlined'
                        label="Username"
                        value="Name"
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

                    </div>
                </div>

                <div className="footer">
                    <CustomButton label="Return" className="wideButton" id="settingsReturnButton" onClick={() => navigate("/home")}/>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;