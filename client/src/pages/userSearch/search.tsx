import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../boards/css/search.css';
import '../../boards/css/buttons.css';
import CustomButton from "../../components/buttons/customButton.tsx";
import { Autocomplete, Paper, TextField } from '@mui/material';
import axios from '../../components/axiosWrapper';

interface users {
    name: string;
    email: string;
}

const search: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<users[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/Users/All');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    return (
        <div className="searchContainer">
            <div className="searchHeader">
                <h1 className="searchHeaderText">Search users</h1>
            </div>
            <div className="searchContent">
            <Autocomplete
                    options={users}
                    getOptionLabel={(option) => `${option.name}`}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search users"
                            variant="outlined"
                            sx={{
                                width: '30vw',
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
                                    '&::placeholder': {
                                        color: 'var(--textColor)', 
                                    },
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
                                },
                            }}
                        />
                    )}
                    onChange={(event, value) => {
                        if (value) {
                            setSearchQuery(value.name);
                        }
                    }}
                    filterOptions={(options, { inputValue }) => 
                        inputValue.length === 0 ? [] : options.filter(option => 
                            option.name.toLowerCase().includes(inputValue.toLowerCase())
                        )
                    }
                    PaperComponent={({ children }) => (
                        <Paper sx={{ 
                            backgroundColor: 'var(--secondaryColor)', 
                            color: 'var(--textColor)' 
                        }}>
                            {children}
                        </Paper>
                    )}
                />
            </div>
            <div className="searchFooter">
                <CustomButton label="Return" className="wideButton" id="settingsReturnButton" onClick={() => navigate("/home")}/>
            </div>
        </div>
    );
}

export default search;