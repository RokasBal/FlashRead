import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../boards/css/main.board.css';
import CustomButton from '../../components/buttons/customButton';
import '../../boards/css/buttons.css';
import Mode2Task from './mode2Task';
import "../../boards/css/mode2.css";
import * as apiTask from './api';
import ChoiceBox from '../../components/choiceBox';
import fullHeart from '../../images/fullHeart.png';
import TimerMode2, { TimerHandle } from '../../components/timerMode2';


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

    const [maxCombo, setMaxCombo] = React.useState<number>(0);
    const [correctWords, setCorrectWords] = React.useState<number>(0);
    const [maxPoints, setMaxPoints] = React.useState<number>(0);
    const [timeAlive, setTimeAlive] = React.useState('00:00');

    const timerRef = useRef<TimerHandle>(null);

    const handleStop = () => {
        timerRef.current?.stop();
    };
    const handleTimeUpdate = (time: string) => {
        setTimeAlive(time);
    };

    useEffect(() => {
        if (maxCombo < combo) {
            setMaxCombo(combo);
        }
        if (points > maxPoints) {
            setMaxPoints(points);
        }   
    }, [combo, points, maxCombo, maxPoints]);

    useEffect(() => {
        if (health <= 0) {
            setGameStarted(false);
            setGameEnded(true);
            handleStop();
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
                    <div className="gameBorder">
                        {gameStarted ? <TimerMode2 ref={timerRef} onTimeUpdate={handleTimeUpdate} /> : null}
                    </div>
                    <div className="gamePage" id="mainGameMode2">
                        <Mode2Task wordArray = {textArray} fillerArray = {fillerArray} gameStarted={gameStarted} setPoints={setPoints} setCombo={setCombo} setHealth={setHealth} setCorrectWords={setCorrectWords} difficulty={mode2Difficulty} />
                    </div>
                    <div className="gameEnded" id="gameEndedDiv">
                        <div className="endContainer">
                            <div className="endedUpper">
                                <p className="overText">Game Over</p>
                            </div>
                            <div className="endedMiddle">
                                <div className="stats">
                                    <p className="pointsText">Max Combo: </p>
                                    <p className="pointsText">{maxCombo}</p>
                                </div>
                                <div className="stats">
                                    <p className="pointsText">Correct Words Collected: </p>
                                    <p className="pointsText">{correctWords}</p>
                                </div>
                                <div className="stats">
                                    <p className="pointsText">Max Points: </p>
                                    <p className="pointsText">{maxPoints}</p>
                                </div>
                                <div className="stats">
                                    <p className="pointsText">Time Alive: </p>
                                    <p className="pointsText">{timeAlive}</p>
                                </div>
                            </div>
                            <div className="endedLower">

                            </div>
                        </div>
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
                                button.innerText = "Pause";
                                handleStop();
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