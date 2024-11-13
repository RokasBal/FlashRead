import React, { useEffect, useState } from 'react';
import axiosWrapper from '../axiosWrapper';

interface Message {
    chatText: string;
    author: string;
    writtenAt: string;
    profilePic: string;
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
                        <span>{message.author}</span>
                        <span>{message.writtenAt}</span>
                    </div>
                    <div className="message_body">
                        <p>{message.chatText}</p>
                        <img src={message.profilePic} alt="Profile" />
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default MessageHandle;