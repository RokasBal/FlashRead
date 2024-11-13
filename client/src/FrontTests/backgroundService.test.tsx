import { startBackgroundService } from '../services/backgroundService.tsx';
import axiosWrapper from '../components/axiosWrapper';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../components/axiosWrapper');

describe('backgroundService', () => {
    let mockGet: vi.Mock;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(global, 'setInterval');
        mockGet = axiosWrapper.get as vi.Mock;
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.resetAllMocks();
    });

    it('should call updateSession every 60 seconds', async () => {
        mockGet.mockResolvedValue({ data: 'Session updated' });

        startBackgroundService();

        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60000);

        // Fast-forward 60 seconds
        vi.advanceTimersByTime(60000);

        // Check if updateSession was called
        expect(mockGet).toHaveBeenCalledWith('/api/Session/Update');
        expect(mockGet).toHaveBeenCalledTimes(1);

        // Fast-forward another 60 seconds
        vi.advanceTimersByTime(60000);

        // Check if updateSession was called again
        expect(mockGet).toHaveBeenCalledTimes(2);
    });
});