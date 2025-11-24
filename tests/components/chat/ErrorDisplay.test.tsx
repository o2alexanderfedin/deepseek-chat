import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../testUtils';
import userEvent from '@testing-library/user-event';
import { ErrorDisplay } from '../../../src/components/chat/ErrorDisplay';

describe('ErrorDisplay', () => {
  it('displays error message', () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    renderWithProviders(
      <ErrorDisplay 
        message="Connection failed" 
        onRetry={onRetry} 
        onDismiss={onDismiss} 
      />
    );
    expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
  });

  it('renders retry button', () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    renderWithProviders(
      <ErrorDisplay 
        message="Error" 
        onRetry={onRetry} 
        onDismiss={onDismiss} 
      />
    );
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders dismiss button', () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    renderWithProviders(
      <ErrorDisplay 
        message="Error" 
        onRetry={onRetry} 
        onDismiss={onDismiss} 
      />
    );
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    renderWithProviders(
      <ErrorDisplay 
        message="Error" 
        onRetry={onRetry} 
        onDismiss={onDismiss} 
      />
    );
    
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when dismiss button clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    renderWithProviders(
      <ErrorDisplay 
        message="Error" 
        onRetry={onRetry} 
        onDismiss={onDismiss} 
      />
    );
    
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has alert role for accessibility', () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    renderWithProviders(
      <ErrorDisplay 
        message="Error" 
        onRetry={onRetry} 
        onDismiss={onDismiss} 
      />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays error icon', () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    renderWithProviders(
      <ErrorDisplay 
        message="Error" 
        onRetry={onRetry} 
        onDismiss={onDismiss} 
      />
    );
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });
});
