import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import EmojiButton from '../../../src/ui/EmojiButton';

// Mock emoji-mart
vi.mock('@emoji-mart/react', () => ({
  default: ({ onEmojiSelect }: { onEmojiSelect: (emoji: any) => void }) => (
    <div data-testid="emoji-picker">
      <button
        onClick={() => onEmojiSelect({ native: '📚' })}
        data-testid="book-emoji"
      >
        📚
      </button>
      <button
        onClick={() => onEmojiSelect({ native: '✏️' })}
        data-testid="pencil-emoji"
      >
        ✏️
      </button>
    </div>
  ),
}));

// Mock emoji-mart data
vi.mock('@emoji-mart/data', () => ({
  default: {
    categories: [],
    emojis: {},
    aliases: {},
    sheet: {}
  }
}));

// Mock the reduced motion hook
const mockUseReducedMotion = vi.fn(() => false);
vi.mock('@mantine/hooks', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('EmojiButton', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default book emoji and label', () => {
    render(
      <TestWrapper>
        <EmojiButton onChange={mockOnChange} />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /emoji/i });
    expect(button).toBeDefined();
    expect(button.textContent).toContain('📚');
  });

  it('renders with custom emoji value', () => {
    render(
      <TestWrapper>
        <EmojiButton value="✏️" onChange={mockOnChange} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button.textContent).toContain('✏️');
  });

  it('opens emoji picker when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EmojiButton onChange={mockOnChange} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    await user.click(button);

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('emoji-picker')).toBeDefined();
  });

  it('closes picker when clicking outside', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <div>
          <EmojiButton onChange={mockOnChange} />
          <button data-testid="outside-button">Outside</button>
        </div>
      </TestWrapper>
    );

    // Open picker
    const emojiButton = screen.getByRole('button', { name: /emoji/i });
    await user.click(emojiButton);
    expect(screen.getByTestId('emoji-picker')).toBeDefined();

    // Click outside
    const outsideButton = screen.getByTestId('outside-button');
    await user.click(outsideButton);

    expect(emojiButton.getAttribute('aria-expanded')).toBe('false');
  });

  it('handles emoji selection', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EmojiButton onChange={mockOnChange} />
      </TestWrapper>
    );

    // Open picker
    const button = screen.getByRole('button');
    await user.click(button);

    // Select an emoji
    const bookEmoji = screen.getByTestId('book-emoji');
    await user.click(bookEmoji);

    expect(mockOnChange).toHaveBeenCalledWith('📚');
  });

  it('respects reduced motion preferences', () => {
    mockUseReducedMotion.mockReturnValue(true);
    
    render(
      <TestWrapper>
        <EmojiButton onChange={mockOnChange} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button.className).toContain('reducedMotion');
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <EmojiButton onChange={mockOnChange} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toContain('emoji');
    expect(button.getAttribute('aria-haspopup')).toBe('true');
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EmojiButton onChange={mockOnChange} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    
    // Focus the button
    await user.tab();
    expect(document.activeElement).toBe(button);

    // Open with Enter
    await user.keyboard('{Enter}');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('emoji-picker')).toBeDefined();

    // Close with Escape
    await user.keyboard('{Escape}');
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});
