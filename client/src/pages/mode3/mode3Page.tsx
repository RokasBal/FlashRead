import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainModule } from '../../../wasm/interface/wasmInterface';
import { loadWasmModule } from './wasmLoader';
import CustomButton from '../../components/buttons/customButton';
import "../../boards/css/mode3.css"
import "../../boards/css/keyboardControls.css"

function useOnScreen(ref: React.RefObject<HTMLElement>) {
    const [isOnScreen, setIsOnScreen] = useState(false);
    const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
    const [isWindowFocused, setIsWindowFocused] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsTabVisible(!document.hidden);
        };
        const handleFocus = () => setIsWindowFocused(true);
        const handleBlur = () => setIsWindowFocused(false);

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting));
        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref]);

    return isOnScreen && isTabVisible && isWindowFocused;
}

const Mode3Page: React.FC = () => {
    const navigate = useNavigate();
    const [canvasSize, setCanvasSize] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasOnScreen = useOnScreen(canvasRef);
    const moduleRef = useRef<MainModule>();

    useEffect(() => {
        console.log("Loading mode3 wasm module ...");
        loadWasmModule().then((val) => {
            moduleRef.current = val;
            console.log("Mode3 wasm module loaded.");

            // cast to any to avoid TypeScript error, canvas is not generated in the type definition
            (moduleRef.current as any)['canvas'] = document.getElementById('canvas') as HTMLCanvasElement;

            // try-catch is a must because emscripten_set_main_loop() throws to exit the function
            try {
                moduleRef.current?.start();
            } catch (error) {
                console.error(error);
            }
        });
        return () => {
            moduleRef.current?.stop();
            (moduleRef.current as any)['canvas'] = undefined;
            moduleRef.current = undefined;
            console.log("Unloaded mode3 wasm module.");
        };
    }, []);

    useEffect(() => {
        // needs try-catch because throws to change emscripten main loop
        try {
            moduleRef.current?.setHidden(!canvasOnScreen);
        } catch (error) {
            console.error(error);
        }
    }, [canvasOnScreen]);

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

        document.addEventListener('fullscreenchange', handleResize);
        document.addEventListener('mozfullscreenchange', handleResize);
        document.addEventListener('webkitfullscreenchange', handleResize);
        document.addEventListener('msfullscreenchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleResize);
            document.removeEventListener('mozfullscreenchange', handleResize);
            document.removeEventListener('webkitfullscreenchange', handleResize);
            document.removeEventListener('msfullscreenchange', handleResize);
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
            <div className="mode3_pageContainer">
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
                <div className='mode3_containerMiddle'>
                    <div className='mode3_middleTop'>
                        <div className='mode3_gameContainer' id='gameSize'>
                            <div className='mode3_game' id='mode3Game'>
                                <canvas
                                    id="canvas"
                                    ref={canvasRef}
                                    width={canvasSize.x}
                                    height={canvasSize.y}
                                    onFocus={() => moduleRef.current?.setFocused(true)}
                                    onBlur={() => moduleRef.current?.setFocused(false)}
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