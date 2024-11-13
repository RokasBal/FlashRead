import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../components/buttons/returnButton.tsx';
import { vi } from 'vitest';

describe('Button', () => {
    it('renders with the correct label', () => {
        render(<Button label="Click Me" onClick={() => {}} />);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('applies the correct className', () => {
        render(<Button label="Click Me" onClick={() => {}} className="custom-class" />);
        const button = screen.getByText('Click Me');
        expect(button).toHaveClass('btn custom-class');
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button label="Click Me" onClick={handleClick} />);
        const button = screen.getByText('Click Me');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalled();
    });
});