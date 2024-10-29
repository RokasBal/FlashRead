import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainModule } from '../../../wasm/interface/wasmInterface';
import { loadWasmModule } from './wasmLoader';
import CustomButton from '../../components/buttons/customButton';
import "../../boards/css/mode3.css"
import "../../boards/css/keyboardControls.css"

const Mode3Page: React.FC = () => {
    const navigate = useNavigate();
    const [canvasSize, setCanvasSize] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [module, setModule] = useState<MainModule | undefined>(undefined);

    useEffect(() => {
        console.log("Loading mode3 wasm module ...");
        loadWasmModule().then((val) => {
            setModule(val);
            console.log("Mode3 wasm module loaded.");
        });
    }, []);

    useEffect(() => {
        if (module === undefined) return;
        
        // cast to any to avoid TypeScript error, canvas is not generated in the type definition
        (module as any)['canvas'] = document.getElementById('canvas') as HTMLCanvasElement;

        // try-catch is a must because emscripten_set_main_loop() throws to exit the function
        try {
            module.start();
        } catch (error) {}
    }, [module]);

    useEffect(() => {
        const handleResize = () => {
            const gamePageElement = document.getElementById('mode3Game');
            if (gamePageElement) {
                const { width, height } = gamePageElement.getBoundingClientRect();
                setCanvasSize({ x: width, y: height });
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === '*') {
                toggleFullScreen();
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const toggleFullScreen = () => {
        const canvas = document.getElementById('gameSize') as HTMLCanvasElement;
        if (!document.fullscreenElement) {
            canvas.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className='Mode3_content'>
            <div className="pageContainer">
                <div className='containerLeft'>
                    <div className="WASD">
                        <div className="controls">
                            <div className="topRow">
                                <div className="key">
                                    <p>W</p>
                                </div>
                            </div>
                            <div className="bottomRow">
                                <div className="key">
                                    <p>A</p>
                                </div>
                                <div className="key">
                                    <p>S</p>
                                </div>
                                <div className="key">
                                    <p>D</p>
                                </div>
                            </div>
                        </div>
                        <div className="controlsText">
                            <p>- Move</p>
                        </div>
                    </div>
                    <div className="sprint">
                        <div className="controls">
                            <div className="longKey">
                                <p>Shift</p>
                            </div>
                        </div>
                        <div className="controlsText">
                            <p>- Sprint</p>
                        </div>
                    </div>
                    <div className="fullScreen">
                        <div className="controls">
                            <div className="key">
                                <p>*</p>
                            </div>
                        </div>
                        <div className="controlsText">
                            <p>- Full Screen</p>
                        </div>
                    </div>
                </div>
                <div className='containerMiddle'>
                    <div className='middleTop'>
                        <div className='gameContainer' id='gameSize'>
                            <div className='game' id='mode3Game'>
                                <canvas
                                    id="canvas"
                                    className=''
                                    width={canvasSize.x}
                                    height={canvasSize.y}
                                    onFocus={() => module?.setFocused(true)}
                                    onBlur={() => module?.setFocused(false)}
                                    tabIndex={-1}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='middleBottom'>
                        <CustomButton label="Return" className="wideButton" id="MainBoard_returnButton" onClick={() => navigate("/home")}/>
                    </div>
                </div>
                <div className='containerRight'>

                </div>
            </div>
        </div>
    );
};

export default Mode3Page;