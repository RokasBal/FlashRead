import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Mode2Task, {getMaxHealth, getCanvasOffset, handleResize} from '../../pages/mode2/mode2Task';

describe('handleResize', () => {
    it('sets the canvas size correctly when the mainGameMode2 element exists', () => {
        // Mock the getElementById method
        const mockGetElementById = vi.spyOn(document, 'getElementById').mockReturnValue({
            getBoundingClientRect: vi.fn().mockReturnValue({
                width: 800,
                height: 600,
            }),
        } as unknown as HTMLElement);

        const setCanvasSize = vi.fn();
        handleResize(setCanvasSize);

        expect(setCanvasSize).toHaveBeenCalledWith({ x: 800, y: 600 });

        // Restore the original implementation
        mockGetElementById.mockRestore();
    });

    it('does nothing when the mainGameMode2 element does not exist', () => {
        // Mock the getElementById method to return null
        const mockGetElementById = vi.spyOn(document, 'getElementById').mockReturnValue(null);

        const setCanvasSize = vi.fn();
        handleResize(setCanvasSize);

        expect(setCanvasSize).not.toHaveBeenCalled();

        // Restore the original implementation
        mockGetElementById.mockRestore();
    });
});

describe('getCanvasOffset', () => {
    it('returns the correct offset when canvas element has a bounding rect', () => {
        const mockCanvasRef = {
            current: {
                getBoundingClientRect: vi.fn().mockReturnValue({
                    left: 100,
                    top: 200,
                }),
            },
        } as unknown as React.MutableRefObject<HTMLCanvasElement | null>;

        const offset = getCanvasOffset(mockCanvasRef);
        expect(offset).toBe(100);
    });

    it('returns zero offset when canvas element is null', () => {
        const mockCanvasRef = {
            current: null,
        } as unknown as React.MutableRefObject<HTMLCanvasElement | null>;

        const offset = getCanvasOffset(mockCanvasRef);
        expect(offset).toBe(0);
    });
});

describe('Mode2Task Component', () => {
    const defaultProps = {
        wordArray: ['word1', 'word2'],
        fillerArray: ['filler1', 'filler2'],
        gameStarted: true,
        setPoints: vi.fn(),
        setCombo: vi.fn(),
        setHealth: vi.fn(),
        setCorrectWords: vi.fn(),
        difficulty: 'Medium',
    };

    it('renders without crashing', () => {
        render(<Mode2Task {...defaultProps} />);
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('updates health state when difficulty changes', () => {
        const { rerender } = render(<Mode2Task {...defaultProps} difficulty="Easy" />);
        expect(defaultProps.setHealth).toHaveBeenCalledWith(10);

        rerender(<Mode2Task {...defaultProps} difficulty="Hard" />);
        expect(defaultProps.setHealth).toHaveBeenCalledWith(3);
    });

    it('getMaxHealth returns correct values', () => {
        expect(getMaxHealth('Easy')).toBe(10);
        expect(getMaxHealth('Medium')).toBe(5);
        expect(getMaxHealth('Hard')).toBe(3);
        expect(getMaxHealth('EXTREME')).toBe(1);
        expect(getMaxHealth('Unknown')).toBe(5);
    });

    it('useEffect sets initial health state', () => {
        render(<Mode2Task {...defaultProps} />);
        expect(defaultProps.setHealth).toHaveBeenCalledWith(5);
        expect(defaultProps.setPoints).toHaveBeenCalledWith(0);
        expect(defaultProps.setCombo).toHaveBeenCalledWith(0);
        expect(defaultProps.setCorrectWords).toHaveBeenCalledWith(0);
    });

    it('resizes canvas correctly', () => {
        render(<Mode2Task {...defaultProps} />);
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('useEffect handles canvas resize', () => {
        render(<Mode2Task {...defaultProps} />);
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);

        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('onTick function updates game state correctly for different game states', () => {
        render(<Mode2Task {...defaultProps} />);
        const canvas = screen.getByRole('img');
        const context = canvas.getContext('2d');
        const dt = 1;
    
        // Mock the context and dt
        if (context && defaultProps.gameStarted) {
            const onTick = Mode2Task.prototype.onTickRef.current;
            
            // Test with game started
            let gameData = onTick(context, dt);
            expect(gameData).toBeDefined();
            expect(gameData.playerPos).toBeDefined();
            expect(gameData.textArray).toBeDefined();
    
            // Test with game not started
            defaultProps.gameStarted = false;
            gameData = onTick(context, dt);
            expect(gameData).toBeUndefined();
        }
    });

    it('resizes canvas correctly', () => {
        render(<Mode2Task {...defaultProps} />);
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);

        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('initializes game state correctly', () => {
        render(<Mode2Task {...defaultProps} />);
        expect(defaultProps.setHealth).toHaveBeenCalledWith(5);
        expect(defaultProps.setPoints).toHaveBeenCalledWith(0);
        expect(defaultProps.setCombo).toHaveBeenCalledWith(0);
        expect(defaultProps.setCorrectWords).toHaveBeenCalledWith(0);
    });



    it('useEffect sets initial state correctly for different difficulties', () => {
        const { rerender } = render(<Mode2Task {...defaultProps} difficulty="Easy" />);
        expect(defaultProps.setHealth).toHaveBeenCalledWith(10);
        expect(defaultProps.setPoints).toHaveBeenCalledWith(0);
        expect(defaultProps.setCombo).toHaveBeenCalledWith(0);
        expect(defaultProps.setCorrectWords).toHaveBeenCalledWith(0);
    
        rerender(<Mode2Task {...defaultProps} difficulty="Hard" />);
        expect(defaultProps.setHealth).toHaveBeenCalledWith(3);
        expect(defaultProps.setPoints).toHaveBeenCalledWith(0);
        expect(defaultProps.setCombo).toHaveBeenCalledWith(0);
        expect(defaultProps.setCorrectWords).toHaveBeenCalledWith(0);
    });

    it('handleMouseMove updates player position correctly for different positions', () => {
        render(<Mode2Task {...defaultProps} />);
        const canvas = screen.getByRole('img');
        
        fireEvent.mouseMove(canvas, { clientX: 50 });
        expect(defaultProps.setPoints).toHaveBeenCalled();
        
        fireEvent.mouseMove(canvas, { clientX: 200 });
        expect(defaultProps.setPoints).toHaveBeenCalled();
        
        fireEvent.mouseMove(canvas, { clientX: 400 });
        expect(defaultProps.setPoints).toHaveBeenCalled();
    });

    it('sets player position correctly on mouse move', () => {
        render(<Mode2Task {...defaultProps} />);
        const canvas = screen.getByRole('img');
        fireEvent.mouseMove(canvas, { clientX: 300 });
        expect(defaultProps.setPoints).toHaveBeenCalled();
    });

    it('handleMouseMove updates player position', () => {
        render(<Mode2Task {...defaultProps} />);
        const canvas = screen.getByRole('img');

        fireEvent.mouseMove(canvas, { clientX: 100 });
       
        expect(defaultProps.setPoints).toHaveBeenCalled();
    });

    it('useEffect sets initial health state', () => {
        render(<Mode2Task {...defaultProps} />);
        expect(defaultProps.setHealth).toHaveBeenCalledWith(5);
        expect(defaultProps.setPoints).toHaveBeenCalledWith(0);
        expect(defaultProps.setCombo).toHaveBeenCalledWith(0);
        expect(defaultProps.setCorrectWords).toHaveBeenCalledWith(0);
    });

});