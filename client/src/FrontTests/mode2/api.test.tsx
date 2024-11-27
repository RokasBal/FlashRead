import { describe, it, expect, vi } from 'vitest';
import axios from '../../components/axiosWrapper';
import { requestTask2Data, requestTask2Points, Task2DBRequest, Task2Request } from '../../pages/mode2/api';

// Mock axios
vi.mock('../../components/axiosWrapper');

describe('api', () => {
  describe('requestTask2Data', () => {
    it('should return word data when API call is successful', async () => {
      const mockResponse = {
        data: {
          session: 1,
          wordArray: ['word1', 'word2'],
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const request: Task2DBRequest = {
        taskId: 1,
        theme: 'Any',
      };

      const result = await requestTask2Data(request);

      expect(result).toEqual({
        wordArray: ['word1', 'word2'],
      });
    });

    it('should return error data when API call fails', async () => {
      axios.post.mockRejectedValue(new Error('API Error'));

      const request: Task2DBRequest = {
        taskId: 1,
        theme: 'Any',
      };

      const result = await requestTask2Data(request);

      expect(result).toEqual({
        wordArray: {},
      });
    });
  });

  describe('requestTask2Points', () => {
    it('should return points and combo data when API call is successful', async () => {
      const mockResponse = {
        data: {
          session: 1,
          points: 100,
          combo: 5,
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const request: Task2Request = {
        taskId: 1,
        wordArray: ['word1', 'word2'],
        collectedWord: 'word1',
        collision: false,
      };

      const result = await requestTask2Points(request);

      expect(result).toEqual({
        points: 100,
        combo: 5,
      });
    });

    it('should return error data when API call fails', async () => {
      axios.post.mockRejectedValue(new Error('API Error'));

      const request: Task2Request = {
        taskId: 1,
        wordArray: ['word1', 'word2'],
        collectedWord: 'word1',
        collision: false,
      };

      const result = await requestTask2Points(request);

      expect(result).toEqual({
        points: 0,
        combo: 0,
      });
    });
  });
});