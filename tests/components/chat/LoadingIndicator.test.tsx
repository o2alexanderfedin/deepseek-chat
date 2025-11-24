import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../testUtils';
import { LoadingIndicator } from '../../../src/components/chat/LoadingIndicator';

describe('LoadingIndicator', () => {
  it('displays progress percentage', () => {
    renderWithProviders(
      <LoadingIndicator progress={50} stage="Loading model weights..." />
    );
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays loading stage', () => {
    renderWithProviders(
      <LoadingIndicator progress={50} stage="Loading model weights..." />
    );
    expect(screen.getByText(/loading model weights/i)).toBeInTheDocument();
  });

  it('shows progress bar', () => {
    renderWithProviders(
      <LoadingIndicator progress={75} stage="Initializing..." />
    );
    const progressBars = screen.getAllByRole('progressbar');
    const linearProgress = progressBars.find(el => el.getAttribute('aria-valuenow') === '75');
    expect(linearProgress).toBeInTheDocument();
    expect(linearProgress).toHaveAttribute('aria-valuenow', '75');
  });

  it('displays 0% progress correctly', () => {
    renderWithProviders(
      <LoadingIndicator progress={0} stage="Starting..." />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays 100% progress correctly', () => {
    renderWithProviders(
      <LoadingIndicator progress={100} stage="Complete" />
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows estimated time when provided', () => {
    renderWithProviders(
      <LoadingIndicator 
        progress={30} 
        stage="Loading..." 
        estimatedTime="2 min remaining" 
      />
    );
    expect(screen.getByText(/2 min remaining/i)).toBeInTheDocument();
  });

  it('has accessible progress indicator', () => {
    renderWithProviders(
      <LoadingIndicator progress={50} stage="Loading..." />
    );
    const progressBars = screen.getAllByRole('progressbar');
    const linearProgress = progressBars.find(el => el.getAttribute('aria-valuemin') !== null);
    expect(linearProgress).toHaveAttribute('aria-valuemin', '0');
    expect(linearProgress).toHaveAttribute('aria-valuemax', '100');
  });

  it('displays spinner animation', () => {
    renderWithProviders(
      <LoadingIndicator progress={50} stage="Loading..." />
    );
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
