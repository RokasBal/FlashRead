import React from 'react';
import '../../boards/css/about.css';

import CustomButton from "../../components/buttons/customButton.tsx";
import { useNavigate } from 'react-router-dom';
import logoImg from '../../images/logo_circle.png';


const AboutPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="aboutPage">
            <div className="pageContainer">
                <div className="header">
                    <h1>About Us</h1>
                </div>

                <div className="logoContainer">
                    <img src={logoImg} className='logoImg slideIn' />
                </div>

                <div className="content">
                    <div className="textContainer">
                        <p className="slideIn">At Stratton Inc., we believe in the power of fast, effective reading. </p>
                        <p className="slideIn">That’s why we created FlashRead — an interactive platform that helps users learn to read faster while retaining and comprehending more.
                            Whether you’re a student, professional, or lifelong learner, FlashRead empowers you to make the most of your reading time.</p>
                        <p className="slideIn">Our program uses engaging exercises to support every user’s journey toward faster, more efficient reading. 
                            At Stratton Inc., we’re committed to helping each reader unlock new levels of productivity and reach their full potential with FlashRead.</p>
                        <p className="slideIn">Join us on a journey of growth and exploration with FlashRead, and discover how quickly reading can transform your world.</p>
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