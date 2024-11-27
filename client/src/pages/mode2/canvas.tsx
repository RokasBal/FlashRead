import { useEffect, useRef, useState } from "react";
import playerImgSource from '../../images/player.png';

export type vec2 = {
    x: number;
    y: number;
};

export type droppingText = {
    text: string;
    pos: vec2;
    color: string;
    angle: number;
    rotSpeed: number;
    fallSpeed: number;
    size: number;
};

export type GameData = {
    playerPos: vec2;
    textArray: droppingText[];
};

//image loading
let imageLoaded = false;
const playerImg = new Image();
playerImg.src = playerImgSource;
playerImg.onload = () => {
    imageLoaded = true;
    console.log("image loaded");
};

export const getCSSVariable = (variableName: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
};

export const toScreenPos = (pos: vec2, canvasSize: vec2) => {

    return {
        x: pos.x * canvasSize.x,
        y: canvasSize.y - pos.y * canvasSize.y,
    };
};

export const drawPlayer = (context: CanvasRenderingContext2D, gameData: GameData, canvasSize: vec2 ) => {
    context.beginPath();
    context.imageSmoothingEnabled = false;
    const player = toScreenPos(gameData.playerPos, canvasSize);
        // HitBox ---------------------------------------------------
        // context.arc(player.x, player.y, 0.05 * canvasSize.x, 0, 2 * Math.PI);
    context.stroke();

    if (imageLoaded ) { // && imageLoadedLeft
            context.drawImage(playerImg, player.x - 0.057 * canvasSize.x, player.y - 0.07 * canvasSize.x, 0.12 * canvasSize.x, 0.12 * canvasSize.x);
    }
};

export const getCanvasOffset = (canvasRef: React.RefObject<HTMLCanvasElement> ) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
        return { x: 0, y: 0 };
    }
    return { x: rect.left, y: rect.top };
}

export const drawText = (context: CanvasRenderingContext2D, gameData: GameData, canvasSize: vec2) => {


    for (const text of gameData.textArray) {
        const textColor = getCSSVariable('--textColor');
        const fontStyle = getCSSVariable('--fontStyle');
        context.font = `${text.size}px ${fontStyle}`;
        context.fillStyle = textColor;
        const pos = toScreenPos(text.pos, canvasSize);
        context.save();
        context.translate(pos.x, pos.y);
        context.rotate(text.angle);
        context.textAlign = "center";
        context.fillText(text.text, 0, 0);
        context.restore();
    }
};

const Canvas: React.FC<{
    canvasSize: vec2;
    onMouseMove: (event: MouseEvent) => void;
    onTick: ((context: CanvasRenderingContext2D, dt: number) => GameData | undefined) | undefined;
}> = ({ canvasSize, onTick, onMouseMove }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);
    const [lastTime, setLastTime] = useState(0);
    const lastTimeRef = useRef<number>(); lastTimeRef.current = lastTime;
    const [prevMousePos, setPrevMousePos] = useState<{x: number, y: number } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const handleMouseMove = (event: MouseEvent) => {
                const adjustedEvent = {
                    ...event,
                    clientX: event.clientX - getCanvasOffset(canvasRef).x,
                    clientY: event.clientY - getCanvasOffset(canvasRef).y,
                };
                if (prevMousePos) {
                    // TO DO set direction
                }
                setPrevMousePos({ x: adjustedEvent.clientX, y: adjustedEvent.clientY });

                onMouseMove(adjustedEvent);
            };
          canvas.addEventListener('mousemove', handleMouseMove, true);
    
          return () => {
            canvas.removeEventListener('mousemove', handleMouseMove, true);
          };
        }
    }, [prevMousePos, onMouseMove]);

    useEffect(() => {
        function draw(context: CanvasRenderingContext2D) {
            if (context && onTick !== undefined) {
                // draw background
                // context.fillStyle = 'rgba(255, 255, 255, 0)';
                context.fillStyle = getCSSVariable('--secondaryColor');
                context.fillRect(0, 0, canvasSize.x, canvasSize.y);

                const lastTime = lastTimeRef?.current ?? 0;
                const currentTime = performance.now();
                const gameData = onTick(context, currentTime - lastTime);
                if (gameData !== undefined) {
                    setLastTime(currentTime);
                    drawText(context, gameData, canvasSize);
                    drawPlayer(context, gameData, canvasSize);
                }
                frameRef.current = requestAnimationFrame(() => draw(context));
            }
        }
        if (canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            if (context) {
                context.canvas.width = canvasSize.x;
                context.canvas.height = canvasSize.y;

                frameRef.current = requestAnimationFrame(() => draw(context));
            }
        }
        return () => cancelAnimationFrame(frameRef.current);
    }, [canvasSize, onTick, canvasRef]);

    return <canvas role="img" ref={canvasRef} style={{ cursor: 'none'}}/>;
}

export default Canvas;
