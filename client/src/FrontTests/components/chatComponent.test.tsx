import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axiosWrapper from '../../components/axiosWrapper';
import ChatComponent from '../../components/chat/chatComponet';
import { vi } from 'vitest';

vi.mock('../../components/axiosWrapper');

const mockMessages = {
  chats: [
    {
      chatIndex: 1,
      username: 'User1',
      chatText: 'Hello!',
      author: 'User1',
      writtenAt: '2023-10-01T12:00:00Z',
      profilePic: 'base64string',
    },
    {
      chatIndex: 2,
      username: 'User2',
      chatText: 'Hi there!',
      author: 'User2',
      writtenAt: '2023-10-01T12:05:00Z',
      profilePic: 'base64string',
    },
  ],
  chatIndex: 2,
};

const mockActiveUsers = ['User1', 'User2'];

describe('ChatComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders chat button', () => {
    render(<ChatComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('toggles chat popup visibility', () => {
    render(<ChatComponent />);
    const chatButton = screen.getByRole('button');
    fireEvent.click(chatButton);
    expect(screen.getByText(/active users/i)).toBeInTheDocument();
    fireEvent.click(chatButton);
    expect(screen.queryByText(/active users/i)).not.toBeInTheDocument();
  });

  test('fetches messages on mount', async () => {
    axiosWrapper.post.mockResolvedValueOnce({ data: mockMessages });

    render(<ChatComponent />);
    const chatButton = screen.getByRole('button');
    fireEvent.click(chatButton);

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });
  });

  test('fetches active users on mount', async () => {
    axiosWrapper.get.mockResolvedValueOnce({ data: mockActiveUsers });

    render(<ChatComponent />);
    const chatButton = screen.getByRole('button');
    fireEvent.click(chatButton);

    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.getByText('User2')).toBeInTheDocument();
    });
  });

  test('sends a message', async () => {
    axiosWrapper.post.mockResolvedValueOnce({ data: {} });
    axiosWrapper.post.mockResolvedValueOnce({ data: mockMessages });

    render(<ChatComponent />);
    const chatButton = screen.getByRole('button');
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText(/type your message here/i);
    fireEvent.change(input, { target: { value: 'Hello, world!' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => expect(axiosWrapper.post).toHaveBeenCalledWith('/api/SendGlobalChat', { chatText: 'Hello, world!' }));
    expect(input).toHaveValue('');
  });
});