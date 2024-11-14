import React, { useEffect, useState, useRef } from 'react';
import axiosWrapper from '../axiosWrapper';
import "../../boards/css/chat.css";


interface Message {
    chatText: string;
    author: string;
    writtenAt: string;
    profilePic: string;
}

const MessageHandle: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLUListElement>(null);

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

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messages]);

    const byteArrayToBase64 = (byteArray: string) => {
        return `data:image/jpeg;base64,${byteArray}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    return (
        <ul className='message_list'>
            {messages.slice().reverse().map((message, index) => (
                <li key={index} className="message">
                    <div className="message_header">
                        <img className='chat_image' src={byteArrayToBase64(message.profilePic)} />
                        <span className='message_user'>{message.author}</span>
                        <span className="message_date">{formatDate(message.writtenAt)}</span>
                    </div>
                    <div className="message_body">
                        <p>{message.chatText}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default MessageHandle;