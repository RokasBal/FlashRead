import React from 'react';
import './css/profileCard.css';

interface ProfileCardProps {
    imageSrc: string;
    name: string;
    onEditClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ imageSrc, name, onEditClick }) => {
    return (
        <div className="profileCard">
            <button className="profileImageButton" onClick={onEditClick}>
                <img src={imageSrc} alt="Profile" className="profileImage" />
                <div className="overlay">
                    {/* TODO - Add edit icon later? */}
                </div>
            </button>
            <span className="profileName">{name}</span>
        </div>
    );
};

export default ProfileCard;