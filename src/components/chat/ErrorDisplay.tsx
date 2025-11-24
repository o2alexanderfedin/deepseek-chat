import React from 'react';
import { Box, Alert, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onRetry,
  onDismiss,
}) => {
  return (
    <Alert
      severity="error"
      icon={<ErrorOutlineIcon data-testid="error-icon" />}
      sx={{ mx: 2, my: 1 }}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
          <Button color="inherit" size="small" onClick={onDismiss}>
            Dismiss
          </Button>
        </Box>
      }
    >
      {message}
    </Alert>
  );
};
