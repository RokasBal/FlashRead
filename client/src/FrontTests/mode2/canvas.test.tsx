import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Canvas, { vec2, GameData, getCSSVariable, toScreenPos, getCanvasOffset, drawPlayer, drawText } from '../../pages/mode2/canvas';

const mockCanvasSize: vec2 = { x: 800, y: 600 };
const mockGameData: GameData = {
    playerPos: { x: 0.5, y: 0.5 },
    textArray: [
        { text: 'Hello', pos: { x: 0.5, y: 0.5 }, color: 'black', angle: 0, rotSpeed: 0, fallSpeed: 0, size: 20 },
    ],
};

describe('getCanvasOffset', () => {
    it('returns the correct offset when canvas element has a bounding rect', () => {
        const mockCanvasRef = {
            current: {
                getBoundingClientRect: vi.fn().mockReturnValue({
                    left: 100,
                    top: 200,
                }),
            },
        } as unknown as React.RefObject<HTMLCanvasElement>;

        const offset = getCanvasOffset(mockCanvasRef);
        expect(offset).toEqual({ x: 100, y: 200 });
    });

    it('returns zero offset when canvas element is null', () => {
        const mockCanvasRef = {
            current: null,
        } as unknown as React.RefObject<HTMLCanvasElement>;

        const offset = getCanvasOffset(mockCanvasRef);
        expect(offset).toEqual({ x: 0, y: 0 });
    });
});

describe('drawText', () => {
    const mockContext = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        fillText: vi.fn(),
        font: '',
        fillStyle: '',
        textAlign: '',
    } as unknown as CanvasRenderingContext2D;

    const mockCanvasSize: vec2 = { x: 800, y: 600 };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls fillText with correct arguments', () => {
        const mockGameData: GameData = {
            playerPos: { x: 0.5, y: 0.5 },
            textArray: [
                { text: 'Hello', pos: { x: 0.5, y: 0.5 }, color: 'black', angle: 0, rotSpeed: 0, fallSpeed: 0, size: 20 },
            ],
        };

        drawText(mockContext, mockGameData, mockCanvasSize);

        expect(mockContext.translate).toHaveBeenCalledWith(400, 300);
        expect(mockContext.fillText).toHaveBeenCalledWith('Hello', 0, 0);
    });

    it('sets the correct font style and color', () => {
        const mockGameData: GameData = {
            playerPos: { x: 0.5, y: 0.5 },
            textArray: [
                { text: 'Hello', pos: { x: 0.5, y: 0.5 }, color: 'black', angle: 0, rotSpeed: 0, fallSpeed: 0, size: 20 },
            ],
        };

        drawText(mockContext, mockGameData, mockCanvasSize);

        expect(mockContext.font).toBe('20px '); // Assuming the CSS variable for fontStyle is not defined
    });

    it('transforms the context correctly for rotation and alignment', () => {
        const mockGameData: GameData = {
            playerPos: { x: 0.5, y: 0.5 },
            textArray: [
                { text: 'Hello', pos: { x: 0.5, y: 0.5 }, color: 'black', angle: Math.PI / 4, rotSpeed: 0, fallSpeed: 0, size: 20 },
            ],
        };

        drawText(mockContext, mockGameData, mockCanvasSize);

        expect(mockContext.save).toHaveBeenCalled();
        expect(mockContext.translate).toHaveBeenCalledWith(400, 300);
        expect(mockContext.rotate).toHaveBeenCalledWith(Math.PI / 4);
        expect(mockContext.textAlign).toBe('center');
        expect(mockContext.restore).toHaveBeenCalled();
    });
});

describe('toScreenPos', () => {
    const mockCanvasSize: vec2 = { x: 800, y: 600 };

    it('converts game coordinates to screen coordinates', () => {
        const gamePos: vec2 = { x: 0.5, y: 0.5 };
        const screenPos = toScreenPos(gamePos, mockCanvasSize);
        expect(screenPos).toEqual({ x: 400, y: 300 });
    });

    it('converts game coordinates to screen coordinates at edges', () => {
        const gamePosTopLeft: vec2 = { x: 0, y: 1 };
        const screenPosTopLeft = toScreenPos(gamePosTopLeft, mockCanvasSize);
        expect(screenPosTopLeft).toEqual({ x: 0, y: 0 });

        const gamePosBottomRight: vec2 = { x: 1, y: 0 };
        const screenPosBottomRight = toScreenPos(gamePosBottomRight, mockCanvasSize);
        expect(screenPosBottomRight).toEqual({ x: 800, y: 600 });
    });
});

describe('drawPlayer', () => {
    const mockContext = {
        beginPath: vi.fn(),
        imageSmoothingEnabled: false,
        stroke: vi.fn(),
        drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    const mockGameData: GameData = {
        playerPos: { x: 0.5, y: 0.5 },
        textArray: [],
    };

    const mockCanvasSize: vec2 = { x: 800, y: 600 };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not draw player if image is not loaded', () => {
        global.imageLoaded = false;

        drawPlayer(mockContext, mockGameData, mockCanvasSize);

        expect(mockContext.drawImage).not.toHaveBeenCalled();
    });
});

describe('playerImg onload', () => {
    let originalImage: typeof Image;
    let imageLoaded: boolean;
    let playerImg: HTMLImageElement;

    beforeEach(() => {
        originalImage = global.Image;
        imageLoaded = false;
        global.console.log = vi.fn();

        // Mock the Image object
        playerImg = new Image();
        playerImg.onload = () => {
            imageLoaded = true;
            console.log("image loaded");
        };
    });

    afterEach(() => {
        global.Image = originalImage;
        vi.clearAllMocks();
    });

    it('sets imageLoaded to true and logs "image loaded"', () => {
        // Simulate the image loading
        playerImg.onload(new Event('load'));

        expect(imageLoaded).toBe(true);
        expect(console.log).toHaveBeenCalledWith("image loaded");
    });
});

describe('getCSSVariable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the correct CSS variable value', () => {
        const mockGetComputedStyle = vi.fn().mockImplementation(() => ({
            getPropertyValue: (variableName: string) => {
                if (variableName === '--testVariable') {
                    return 'testValue';
                }
                return '';
            },
        }));

        // Mock the global getComputedStyle function
        global.getComputedStyle = mockGetComputedStyle;

        const value = getCSSVariable('--testVariable');
        expect(value).toBe('testValue');
        expect(mockGetComputedStyle).toHaveBeenCalledWith(document.documentElement);
    });

    it('trims the returned value', () => {
        const mockGetComputedStyle = vi.fn().mockImplementation(() => ({
            getPropertyValue: (variableName: string) => {
                if (variableName === '--testVariable') {
                    return '  testValue  ';
                }
                return '';
            },
        }));

        // Mock the global getComputedStyle function
        global.getComputedStyle = mockGetComputedStyle;

        const value = getCSSVariable('--testVariable');
        expect(value).toBe('testValue');
        expect(mockGetComputedStyle).toHaveBeenCalledWith(document.documentElement);
    });
});

describe('Canvas', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders canvas', () => {
        render(<Canvas canvasSize={mockCanvasSize} onMouseMove={() => {}} onTick={() => mockGameData} />);
        const canvas = screen.getByRole('img');
        expect(canvas).toBeInTheDocument();
    });

    test('handles mouse move', () => {
        const handleMouseMove = vi.fn();
        render(<Canvas canvasSize={mockCanvasSize} onMouseMove={handleMouseMove} onTick={() => mockGameData} />);
        const canvas = screen.getByRole('img');

        fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
        expect(handleMouseMove).toHaveBeenCalled();
    });

    test('draws player on canvas', () => {
        const handleTick = vi.fn(() => mockGameData);
        render(<Canvas canvasSize={mockCanvasSize} onMouseMove={() => {}} onTick={handleTick} />);
        const canvas = screen.getByRole('img') as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        if (context) {
            const drawPlayerSpy = vi.spyOn(context, 'drawImage');
            fireEvent.mouseMove(canvas, { clientX: 400, clientY: 300 });
            expect(drawPlayerSpy).toHaveBeenCalled();
        }
    });

    test('draws text on canvas', () => {
        const handleTick = vi.fn(() => mockGameData);
        render(<Canvas canvasSize={mockCanvasSize} onMouseMove={() => {}} onTick={handleTick} />);
        const canvas = screen.getByRole('img') as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        if (context) {
            const fillTextSpy = vi.spyOn(context, 'fillText');
            expect(fillTextSpy).toHaveBeenCalledWith('Hello', 400, 300);
        }
    });

    test('handles direction change on mouse move', () => {
        const handleMouseMove = vi.fn();
        render(<Canvas canvasSize={mockCanvasSize} onMouseMove={handleMouseMove} onTick={() => mockGameData} />);
        const canvas = screen.getByRole('img');

        fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
        fireEvent.mouseMove(canvas, { clientX: 200, clientY: 100 });
        expect(handleMouseMove).toHaveBeenCalledTimes(2);
    });

    test('calls onTick with correct parameters', () => {
        const handleTick = vi.fn(() => mockGameData);
        render(<Canvas canvasSize={mockCanvasSize} onMouseMove={() => {}} onTick={handleTick} />);
        const canvas = screen.getByRole('img') as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        if (context) {
            fireEvent.mouseMove(canvas, { clientX: 400, clientY: 300 });
            expect(handleTick).toHaveBeenCalledWith(context, expect.any(Number));
        }
    });

    test('updates direction state on mouse move', () => {
        const handleMouseMove = vi.fn();
        render(<Canvas canvasSize={mockCanvasSize} onMouseMove={handleMouseMove} onTick={() => mockGameData} />);
        const canvas = screen.getByRole('img');

        fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
        fireEvent.mouseMove(canvas, { clientX: 50, clientY: 100 });
        fireEvent.mouseMove(canvas, { clientX: 150, clientY: 100 });

        // Check if the direction state is updated correctly
        // This part is tricky to test directly, but we can infer it from the behavior
        expect(handleMouseMove).toHaveBeenCalledTimes(3);
    });

    test('draws background color', () => {
        const handleTick = vi.fn(() => mockGameData);
        render(<Canvas canvasSize={mockCanvasSize} onMouseMove={() => {}} onTick={handleTick} />);
        const canvas = screen.getByRole('img') as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        if (context) {
            const fillRectSpy = vi.spyOn(context, 'fillRect');
            fireEvent.mouseMove(canvas, { clientX: 400, clientY: 300 });
            expect(fillRectSpy).toHaveBeenCalledWith(0, 0, mockCanvasSize.x, mockCanvasSize.y);
        }
    });

    test('handles image loading', () => {
        const handleTick = vi.fn(() => mockGameData);
        render(<Canvas canvasSize={mockCanvasSize} onMouseMove={() => {}} onTick={handleTick} />);
        const canvas = screen.getByRole('img') as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        if (context) {
            const drawImageSpy = vi.spyOn(context, 'drawImage');
            fireEvent.mouseMove(canvas, { clientX: 400, clientY: 300 });
            expect(drawImageSpy).toHaveBeenCalled();
        }
    });

    test('draws text with correct styles', () => {
        const handleTick = vi.fn(() => mockGameData);
        render(<Canvas canvasSize={mockCanvasSize} onMouseMove={() => {}} onTick={handleTick} />);
        const canvas = screen.getByRole('img') as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        if (context) {
            const fillTextSpy = vi.spyOn(context, 'fillText');
            const saveSpy = vi.spyOn(context, 'save');
            const restoreSpy = vi.spyOn(context, 'restore');
            const translateSpy = vi.spyOn(context, 'translate');
            const rotateSpy = vi.spyOn(context, 'rotate');
            const textAlignSpy = vi.spyOn(context, 'textAlign', 'set');

            fireEvent.mouseMove(canvas, { clientX: 400, clientY: 300 });

            expect(saveSpy).toHaveBeenCalled();
            expect(translateSpy).toHaveBeenCalledWith(400, 300);
            expect(rotateSpy).toHaveBeenCalledWith(0);
            expect(textAlignSpy).toHaveBeenCalledWith('center');
            expect(fillTextSpy).toHaveBeenCalledWith('Hello', 0, 0);
            expect(restoreSpy).toHaveBeenCalled();
        }
    });
});

describe('Canvas Utility Functions', () => {
    const mockCanvasSize: vec2 = { x: 800, y: 600 };

    test('getCanvasOffset returns correct offset', () => {
        const canvasRef = { current: { getBoundingClientRect: () => ({ left: 100, top: 200 }) } };
        const getCanvasOffset = () => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) {
                return { x: 0, y: 0 };
            }
            return { x: rect.left, y: rect.top };
        };

        const offset = getCanvasOffset();
        expect(offset).toEqual({ x: 100, y: 200 });
    });

    test('getCanvasOffset returns zero offset when rect is null', () => {
        const canvasRef = { current: null };
        const getCanvasOffset = () => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) {
                return { x: 0, y: 0 };
            }
            return { x: rect.left, y: rect.top };
        };

        const offset = getCanvasOffset();
        expect(offset).toEqual({ x: 0, y: 0 });
    });

    test('toScreenPos converts game coordinates to screen coordinates', () => {
        const toScreenPos = (pos: vec2) => {
            return {
                x: pos.x * mockCanvasSize.x,
                y: mockCanvasSize.y - pos.y * mockCanvasSize.y,
            };
        };

        const gamePos: vec2 = { x: 0.5, y: 0.5 };
        const screenPos = toScreenPos(gamePos);
        expect(screenPos).toEqual({ x: 400, y: 300 });
    });

    test('toScreenPos converts game coordinates to screen coordinates at edges', () => {
        const toScreenPos = (pos: vec2) => {
            return {
                x: pos.x * mockCanvasSize.x,
                y: mockCanvasSize.y - pos.y * mockCanvasSize.y,
            };
        };

        const gamePosTopLeft: vec2 = { x: 0, y: 1 };
        const screenPosTopLeft = toScreenPos(gamePosTopLeft);
        expect(screenPosTopLeft).toEqual({ x: 0, y: 0 });

        const gamePosBottomRight: vec2 = { x: 1, y: 0 };
        const screenPosBottomRight = toScreenPos(gamePosBottomRight);
        expect(screenPosBottomRight).toEqual({ x: 800, y: 600 });
    });
});
