import React, { useState } from 'react';
import axiosWrapper from '../axiosWrapper';

const MessageSend: React.FC = () => {
    const [chatText, setChatText] = useState<string>('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (chatText.trim() === '') {
            return;
        }

        try {
            const response = await axiosWrapper.post('/api/SendGlobalChat', { chatText });
            console.log('Message sent:', response.data);
            setChatText(''); // Clear the input field after sending the message
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='chat_input_obj'>
            <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Type your message here..."
            />
            <button type="submit">Send</button>
        </form>
    );
};

export default MessageSend;