import { render, screen, fireEvent } from '@testing-library/react';
import ModeButton from '../../pages/home/modeButton.tsx';
import { vi } from 'vitest';

describe('ModeButton', () => {
    it('renders with the correct label', () => {
        render(<ModeButton label="Click Me" onClick={() => {}} />);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<ModeButton label="Click Me" onClick={handleClick} />);
        const button = screen.getByText('Click Me');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalled();
    });

    it('has the correct initial styles', () => {
        render(<ModeButton label="Click Me" onClick={() => {}} />);
        const button = screen.getByText('Click Me');
        expect(button).toHaveClass('w-[8rem]');
        expect(button).toHaveClass('h-[8rem]');
        expect(button).toHaveClass('rounded-lg');
        expect(button).toHaveClass('text-white');
        expect(button).toHaveClass('font-bold');
        expect(button).toHaveClass('text-xl');
        expect(button).toHaveClass('bg-green-300');
        expect(button).toHaveClass('border-4');
        expect(button).toHaveClass('border-green-500');
    });

    it('applies hover and active styles', () => {
        render(<ModeButton label="Click Me" onClick={() => {}} />);
        const button = screen.getByText('Click Me');
        fireEvent.mouseOver(button);
        expect(button).toHaveClass('hover:scale-110');
        fireEvent.mouseDown(button);
        expect(button).toHaveClass('active:brightness-75');
    });
});