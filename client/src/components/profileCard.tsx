import React from 'react';
import './css/profileCard.css';

interface ProfileCardProps {
    imageSrc: string;
    name: string;
    onEditClick: () => void;
    editable?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ imageSrc, name, onEditClick, editable = true }) => {
    return (
        <div className="profileCard">
            {editable ? (
                <button className="profileImageButton" onClick={onEditClick}>
                    <img src={imageSrc} alt="Profile" className="profileImage" />
                    <div className="overlay">
                        {/* TODO - Add edit icon later? */}
                    </div>
                </button>
            ) : (
                <div className="profileImageUneditable">
                    <img src={imageSrc} alt="Profile" className="profileImage" />
                </div>
            )}
            <span className="profileName">{name}</span>
        </div>
    );
};

export default ProfileCard;