import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../boards/css/main.board.css';
import CustomButton from '../../components/buttons/customButton';
import '../../boards/css/buttons.css';
import Mode2Task from './mode2Task';
import "../../boards/css/mode2.css";
import * as apiTask from './api';
import ChoiceBox from '../../components/choiceBox';
import fullHeart from '../../images/fullHeart.png';


const Mode2Page: React.FC = () => {
    const navigate = useNavigate();
    const [points, setPoints] = React.useState<number>(0);
    const [combo, setCombo] = React.useState<number>(0);
    const [mode2Theme, setMode2Theme] = React.useState<string>("Any");
    const [mode2Difficulty, setMode2Difficulty] = React.useState<string>("Any");
    const [gameStarted, setGameStarted] = React.useState<boolean>(false);
    const [gameEnded, setGameEnded] = React.useState<boolean>(false);
    const [textArray, setTextArray] = React.useState<string[]>([]);
    const [fillerArray, setFillerArray] = React.useState<string[]>([]);
    const [health, setHealth] = React.useState<number>(5);

    useEffect(() => {
        if (health <= 0) {
            setGameStarted(false);
            setGameEnded(true);
            const button = document.getElementById("MainBoard_restartButton");
            if (button) {
                button.innerText = "Start";
            }
        }
    }, [health]);
    
    useEffect(() => {
        if (gameEnded) {
            const gameEndedDiv = document.getElementById("gameEndedDiv");
            if (gameEndedDiv) {
                gameEndedDiv.style.visibility = "visible";
            }
        } else {
            const gameEndedDiv = document.getElementById("gameEndedDiv");
            if (gameEndedDiv) {
                gameEndedDiv.style.visibility = "hidden";
            }
        }
    }, [gameEnded]);

    const hearts = Array.from({length: health}, (_, i) => (
        <img src={fullHeart}
        key={i} 
        className="heart"
        />
    ));

    return (
        <div className='Mode2_content'>
            <div className="mode2_upperDiv">
                <ChoiceBox choices={["History", "Technology", "Anime"]} prompt='Theme:' onSelect={choice => setMode2Theme(choice)} label="Theme:"/>
                <ChoiceBox choices={["Easy", "Medium", "Hard", "EXTREME"]} prompt='Difficulty:' onSelect={choice => setMode2Difficulty(choice)} label="Difficulty:"/>
            </div>
            <div className="mode2_centerDiv" id="mode2Div">
                <div className="points">
                    <p className="pointsText">Points:</p>
                    <p className="pointsText" id="points">{points}</p>
                    <p className="pointsText">Combo:</p>
                    <p className="pointsText" id="combo">{combo}</p>
                </div>
                <div className="gameContainer">
                    <div className="gameBorder"></div>
                    <div className="gamePage" id="mainGameMode2">
                        <Mode2Task wordArray = {textArray} fillerArray = {fillerArray} gameStarted={gameStarted} setPoints={setPoints} setCombo={setCombo} setHealth={setHealth} difficulty={mode2Difficulty} />
                    </div>
                    <div className="gameEnded" id="gameEndedDiv">
                        <p className="pointsText">Game Over</p>
                    </div>
                </div>
            </div>
            <div className="mode2_lowerDiv" id="buttonDiv">
                <div className="mode2_lowerUpperDiv">
                    <div className="mode2_lowerUppedLeftDiv">
                        {hearts}
                    </div>
                    <CustomButton label="Start" className="wideButton" id="MainBoard_restartButton" onClick={() => {
                        const button = document.getElementById("MainBoard_restartButton");
                        if (gameStarted === false) {
                            apiTask.requestTask2Data({taskId: 3, theme: "Fillers" }).then((data => {
                                setFillerArray(data.wordArray);
                            }))
                            apiTask.requestTask2Data({taskId: 3, theme: mode2Theme }).then((data => {
                                setTextArray(data.wordArray);
                                setGameStarted(true); 
                                setGameEnded(false);
                            }))
                            if (button) {
                                button.innerText = "Stop";
                            }
                        } else {
                            if (button) {
                                button.innerText = "Start";
                            }
                            setGameStarted(false);
                        }
                    }}/>
                </div>
                <div className="mode2_lowerLowerDiv">
                    <CustomButton label="Return" className="wideButton" id="MainBoard_returnButton" onClick={() => navigate("/home")}/>
                </div>
            </div>
        </div>
    );
};

export default Mode2Page;