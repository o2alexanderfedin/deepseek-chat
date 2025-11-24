import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

interface LoadingIndicatorProps {
  progress: number;
  stage: string;
  estimatedTime?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  progress,
  stage,
  estimatedTime,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        gap: 2,
      }}
    >
      <CircularProgress data-testid="loading-spinner" size={48} />
      <Typography variant="h6" color="text.primary">
        {progress}%
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {stage}
      </Typography>
      {estimatedTime && (
        <Typography variant="caption" color="text.secondary">
          {estimatedTime}
        </Typography>
      )}
    </Box>
  );
};
