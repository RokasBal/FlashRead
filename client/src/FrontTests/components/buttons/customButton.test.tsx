import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../components/buttons/customButton.tsx';
import { vi } from 'vitest';

describe('Button', () => {
    it('renders with the correct label', () => {
        render(<Button label="Click Me" onClick={() => {}} />);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('applies the correct className', () => {
        render(<Button label="Click Me" onClick={() => {}} className="custom-class" />);
        const button = screen.getByText('Click Me');
        expect(button).toHaveClass('custom-class');
    });

    it('applies the correct id', () => {
        render(<Button label="Click Me" onClick={() => {}} id="custom-id" />);
        const button = screen.getByText('Click Me');
        expect(button).toHaveAttribute('id', 'custom-id');
    });

    it('applies the correct style', () => {
        const customStyle = { backgroundColor: 'red' };
        render(<Button label="Click Me" onClick={() => {}} style={customStyle} />);
        const button = screen.getByText('Click Me');
        expect(button).toHaveStyle('background-color: rgb(255, 0, 0)');
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button label="Click Me" onClick={handleClick} />);
        const button = screen.getByText('Click Me');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalled();
    });

    it('changes style on hover', () => {
        render(<Button label="Click Me" onClick={() => {}} />);
        const button = screen.getByText('Click Me');
        fireEvent.mouseEnter(button);
        expect(button).toHaveStyle('transform: scale(0.95)');
        fireEvent.mouseLeave(button);
        expect(button).toHaveStyle('transform: scale(1)');
    });

    it('changes style on click', () => {
        render(<Button label="Click Me" onClick={() => {}} />);
        const button = screen.getByText('Click Me');
        fireEvent.mouseDown(button);
        expect(button).toHaveStyle('opacity: 0.95');
        fireEvent.mouseUp(button);
        expect(button).toHaveStyle('opacity: 1');
    });
});