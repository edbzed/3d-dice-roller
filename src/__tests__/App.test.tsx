import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import App from '../App';

// Mock the crypto API
const mockGetRandomValues = vi.fn();
global.crypto = {
  getRandomValues: mockGetRandomValues,
} as any;

describe('Dice Game', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Roll Dice')).toBeDefined();
  });

  it('disables roll button while rolling', async () => {
    render(<App />);
    const rollButton = screen.getByText('Roll Dice');
    
    fireEvent.click(rollButton);
    expect(rollButton).toBeDisabled();
    expect(screen.getByText('Rolling...')).toBeDefined();
  });

  it('shows history when history button is clicked', () => {
    render(<App />);
    const historyButton = screen.getByLabelText('Toggle roll history');
    
    fireEvent.click(historyButton);
    expect(screen.getByText('Roll History')).toBeDefined();
  });
});