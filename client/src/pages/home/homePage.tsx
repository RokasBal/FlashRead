import { useNavigate } from "react-router-dom";
import Dropdown from '../../components/dropdown';
import CustomButton from '../../components/buttons/customButton';
import '../../boards/css/main.board.css';
import '../../boards/css/dropdown.css';
import '../../boards/css/chat.css';
import { useAuth } from '../../context/AuthContext';
import ChatComponent from "../../components/chat/chatComponet";

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { logOut } = useAuth();

    const handleLogout = async () => {
        await logOut();
        navigate('/login');
    }

    return (
        <div className="MainBoard_main">
            <div className="chat_content"> 
                <div className="chat_container">
                    <ChatComponent />
                </div>
            </div>



            <div className="MainBoard_header" id="headerDiv">
                <div className="headerLinks">
                    <div className="outerLinkContainer">
                        <div className="innerLinkContainer">
                            <span className="linksText" onClick={() => navigate("/about")}>About Us</span>
                        </div>
                    </div>
                    <div className="outerLinkContainer">
                        <div className="innerLinkContainer">
                            <span className="linksText" onClick={() => navigate("/contact")}>Contacts</span>
                        </div>
                    </div>
                </div>
                

                <div className="header_button_container">
                    <button className="search_button" onClick={() => navigate("/search")}>
                        <i className="fas fa-search"></i>
                    </button>
                    <Dropdown onSelect={function (item: string): void {
                    if (item === "Login") {
                        navigate("/login");
                    }
                    else if (item === "Logout") {
                        handleLogout();
                    }
                    else if (item === "Settings") {
                        navigate("/settings");
                    } 
                    else if (item === "Profile") {
                        navigate("/profile");
                    }
                    } } />
                </div>

            </div>

            <div className="MainBoard_content" id="contentDiv"> 
                <div className="headerContainer">
                    <h1>FlashRead</h1>
                </div>
                <div className="MainBoard_selection" id="selectionDiv">

                    <div className="MainBoard_grid" id="selectionGrid">

                        <CustomButton label= "Q&A" className= "squareButton" id="MainBoard_mode1Button" onClick={()=>{
                            console.log("Mode 1 clicked");
                            navigate("/mode1");
                        }}/>

                        <CustomButton label= "Catch The Word" className= "squareButton" id="MainBoard_mode2Button" onClick={()=>{
                            console.log("Mode 2 clicked");
                            navigate("/mode2");
                        }}/>

                        <CustomButton label= "BookScape" className= "squareButton" id="MainBoard_mode3Button" onClick={()=>{
                            console.log("Mode 3 clicked");
                            navigate("/mode3");
                        }}/>

                    </div>
                </div> 
                <div className="footerContainer">
                    
                </div>       

            </div>

        </div>    

    );
};

export default HomePage;