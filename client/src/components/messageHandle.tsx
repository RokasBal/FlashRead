import React, { useEffect, useState } from 'react';

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
            try {
                const response = await fetch('/api/GetGlobalChats');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    console.error("Received non-JSON response:", text);
                    throw new TypeError("Received non-JSON response");
                }
                const data = await response.json();
                console.log('Fetched messages:', data); // Log the fetched data
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
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