import { describe, it, expect, vi } from 'vitest';
import axios from '../../components/axiosWrapper';
import { requestTask1Data, submitTask1Answers, Task1Request, Task1AnswerRequest } from '../../pages/mode1/mode1Task';

// Mock axios
vi.mock('../../components/axiosWrapper');

describe('mode1Task', () => {
  describe('requestTask1Data', () => {
    it('should return task data when API call is successful', async () => {
      const mockResponse = {
        data: {
          session: 1,
          text: 'Sample text',
          questions: [],
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const request: Task1Request = {
        taskId: 1,
        theme: 'Any',
        difficulty: 'Easy',
      };

      const result = await requestTask1Data(request);

      expect(result).toEqual({
        session: 1,
        text: 'Sample text',
        questions: [],
      });
    });

    it('should return error data when API call fails', async () => {
      axios.post.mockRejectedValue(new Error('API Error'));

      const request: Task1Request = {
        taskId: 1,
        theme: 'Any',
        difficulty: 'Easy',
      };

      const result = await requestTask1Data(request);

      expect(result).toEqual({
        session: 0,
        text: 'Error retrieving task data',
      });
    });
  });

  describe('submitTask1Answers', () => {
    it('should return answer data when API call is successful', async () => {
      const mockResponse = {
        data: {
          answers: [],
          statistics: {
            correct: 0,
            total: 0,
            wpm: 0,
            score: 0,
          },
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const request: Task1AnswerRequest = {
        session: 1,
        selectedVariants: [1, 2],
        timeTaken: 30,
      };

      const result = await submitTask1Answers(request);

      expect(result).toEqual({
        session: 0,
        text: '',
        answers: [],
        statistics: {
          correct: 0,
          total: 0,
          wpm: 0,
          score: 0,
        },
      });
    });

    it('should return error data when API call fails', async () => {
      axios.post.mockRejectedValue(new Error('API Error'));

      const request: Task1AnswerRequest = {
        session: 1,
        selectedVariants: [1, 2],
        timeTaken: 30,
      };

      const result = await submitTask1Answers(request);

      expect(result).toEqual({
        session: 0,
        text: 'Error retrieving task answers',
      });
    });
  });
});