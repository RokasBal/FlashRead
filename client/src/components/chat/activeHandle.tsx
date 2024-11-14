import React, { useEffect, useState } from 'react';
import axiosWrapper from '../axiosWrapper';
import "../../boards/css/chat.css";

const ActiveHandle: React.FC = () => {
    const [activeUsers, setActiveUsers] = useState<string[]>([]);

    const fetchActiveUsers = async () => {
        try {
            const response = await axiosWrapper.get('/api/Session/GetConnectedUsers');
            const data: string[] = response.data;
            console.log('Fetched active users:', data); // Log the fetched data
            if (data) {
                setActiveUsers(data);
            }
        } catch (error) {
            console.error('Error fetching active users:', error);
        }
    };
    
    useEffect(() => {
        fetchActiveUsers();
    }, []);

    return (
        <div>
            <ul className='active_list'>
                {activeUsers.map((user, index) => (
                    <li key={index} className='listActive'>
                        <span className='activeUser'>{user}</span>
                        <div className='circle'>.</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActiveHandle;