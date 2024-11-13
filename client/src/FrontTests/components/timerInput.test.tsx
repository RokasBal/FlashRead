import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import TimerInput from '../../components/timerInput';

describe('TimerInput', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders TimerInput component', () => {
        render(<TimerInput id="timer-input" onTimeChange={() => {}} />);
        const input = screen.getByLabelText('Timer:');
        expect(input).toBeInTheDocument();
    });

    test('handles input change and formats to timer', () => {
        const handleTimeChange = vi.fn();
        render(<TimerInput id="timer-input" onTimeChange={handleTimeChange} />);
        const input = screen.getByLabelText('Timer:');

        fireEvent.change(input, { target: { value: '1234' } });
        expect(input).toHaveValue('12:34');
        expect(handleTimeChange).toHaveBeenCalledWith(754);

        fireEvent.change(input, { target: { value: '56' } });
        expect(input).toHaveValue('00:56');
        expect(handleTimeChange).toHaveBeenCalledWith(56);
    });

    test('resets to 0 seconds if input is empty or "00:00"', () => {
        const handleTimeChange = vi.fn();
        render(<TimerInput id="timer-input" onTimeChange={handleTimeChange} />);
        const input = screen.getByLabelText('Timer:');

        fireEvent.change(input, { target: { value: '' } });
        expect(handleTimeChange).toHaveBeenCalledWith(0);

        fireEvent.change(input, { target: { value: '0000' } });
        expect(handleTimeChange).toHaveBeenCalledWith(0);
    });

    test('limits input to 4 digits', () => {
        const handleTimeChange = vi.fn();
        render(<TimerInput id="timer-input" onTimeChange={handleTimeChange} />);
        const input = screen.getByLabelText('Timer:');

        fireEvent.change(input, { target: { value: '12345' } });
        expect(input).toHaveValue('23:45');
        expect(handleTimeChange).toHaveBeenCalledWith(1425);
    });
});