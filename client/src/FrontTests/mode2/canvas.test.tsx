import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Canvas, { vec2, GameData } from '../../pages/mode2/canvas';

const mockCanvasSize: vec2 = { x: 800, y: 600 };
const mockGameData: GameData = {
    playerPos: { x: 0.5, y: 0.5 },
    textArray: [
        { text: 'Hello', pos: { x: 0.5, y: 0.5 }, color: 'black', angle: 0, rotSpeed: 0, fallSpeed: 0, size: 20 },
    ],
};

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
});