import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TimerMode2, { TimerHandle } from '../../components/timerMode2.tsx'

describe('TimerMode2', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    it('renders initial time correctly', () => {
        render(<TimerMode2 initialTime={120} />);
        expect(screen.getByText('02:00')).toBeInTheDocument();
    });

    it('counts down correctly', () => {
        render(<TimerMode2 initialTime={120} />);
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(screen.getByText('01:59')).toBeInTheDocument();
    });

    it('calls onTimeUpdate with formatted time', () => {
        const handleTimeUpdate = vi.fn();
        render(<TimerMode2 initialTime={120} onTimeUpdate={handleTimeUpdate} />);
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(handleTimeUpdate).toHaveBeenCalledWith('01:59');
    });
});