import React, { useEffect, useState } from 'react';
import axiosWrapper from './axiosWrapper';

interface Message {
    ChatText: string;
    Author: string;
    WrittenAt: string;
    ProfilePic: string;
}

const MessageHandle: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const fetchMessages = async () => {
            const response = await axiosWrapper.get('/api/GetGlobalChats');
            const data = response.data;
            console.log('Fetched messages:', data.chats); // Log the fetched data
            setMessages(data.chats);
        };

        fetchMessages();
        
        const socket = new WebSocket('ws://localhost:5173');

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        return () => {
            socket.close();
        };

    }, []);

    return (
        <ul>
            {messages.map((message, index) => (
                <li key={index} className="message">
                    <div className="message_header">
                        <span className="username">{message.Author}</span>
                        <span className="date_sent">{message.WrittenAt}</span>
                    </div>
                    <div className="message_body">
                        {message.ChatText}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default MessageHandle;