import React from 'react';
import '../../boards/css/contact.css';

import CustomButton from "../../components/buttons/customButton.tsx";
import { useNavigate } from 'react-router-dom';
import { TextField, Box } from '@mui/material';


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
                        <p className='upperText'>Contact Us</p>
                        <div className="contact_info">
                            <p className='biggerText'>GitHub </p>
                            <a className='contactText' href="https://github.com/JuliusJauga">Julius</a>
                            <a className='contactText' href="https://github.com/RokasBal">Rokas</a>
                            <a className='contactText' href="https://github.com/tikis23">Edvinas</a>
                            <a className='contactText' href="https://github.com/AurelijusLuksas">Aurelijus</a>
                        </div>
                        <div className="contact_info">
                            <p className='biggerText'>Chart to us </p>
                            <p className='contactText' >contact@flashread.com</p>
                        </div>
                    </div>
                    <div className="contact_right">
                        <p className='upperText'>Get In Touch</p>
                        
                        <form className='formStyle' action="https://api.web3forms.com/submit" method="POST">
                            <Box 
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '50%',
                                    gap: '1vw',
                                    }}
                                    >
                                    <input type="hidden" name="access_key" value="e358435b-1b4b-44c5-9652-e7ceda54d5d6"></input>
                                    <TextField 
                                    variant='outlined'
                                    label="Name"
                                    type='name'
                                    name='name'
                                    fullWidth
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
                                            type='email'
                                            name='email'
                                            fullWidth
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
                                                    label="Message"
                                                    multiline
                                                    name='message'
                                                    fullWidth
                                                    rows={8}
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
                                <CustomButton label="Submit" className="wideButton" id="contactSubmit" onClick={() => {}}/>
                            </Box>    
                        </form>

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