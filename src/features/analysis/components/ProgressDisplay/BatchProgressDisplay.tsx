/**
 * 批量分析进度组件
 * 显示批量图片分析的总体进度和单张图片状态
 */

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardMedia,
  SxProps,
  Theme,
} from '@mui/material';
import {
  CircleCheck,
  Clock3,
  Upload,
} from 'lucide-react';

export interface BatchImage {
  id: string;
  url: string;
  name: string;
}

export interface BatchProgressDisplayProps {
  completed: number;
  total: number;
  current?: number;
  images: BatchImage[];
  estimatedTime?: string;
  sx?: SxProps<Theme>;
}

export const BatchProgressDisplay: React.FC<BatchProgressDisplayProps> = ({
  completed,
  total,
  current,
  images,
  estimatedTime,
  sx,
}) => {
  const totalProgress = total > 0 ? (completed / total) * 100 : 0;

  const getImageStatus = (index: number) => {
    if (index < completed) return 'completed';
    if (index === current) return 'analyzing';
    return 'pending';
  };

  return (
    <Box sx={{ mb: 2, ...sx }}>
      {/* 整体进度 */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            已分析 {completed}/{total} 张图片
          </Typography>
          {estimatedTime && (
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              {estimatedTime}
            </Typography>
          )}
        </Box>
        <LinearProgress
          variant="determinate"
          value={totalProgress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#22C55E',
              transition: 'width 0.3s ease',
            },
          }}
        />
      </Box>

      {/* 缩略图列表 */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {images.map((image, index) => (
          <ThumbnailCard
            key={image.id}
            image={image}
            status={getImageStatus(index)}
            index={index}
          />
        ))}
      </Box>
    </Box>
  );
};

interface ThumbnailCardProps {
  image: BatchImage;
  status: 'completed' | 'analyzing' | 'pending';
  index: number;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ image, status, index }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return '#22C55E';
      case 'analyzing':
        return '#3B82F6';
      default:
        return 'rgba(255, 255, 255, 0.2)';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CircleCheck size={20} color="#22C55E" aria-hidden="true" />;
      case 'analyzing':
        return <Upload size={20} color="#3B82F6" aria-hidden="true" />;
      default:
        return <Clock3 size={20} color="rgba(255, 255, 255, 0.3)" aria-hidden="true" />;
    }
  };

  return (
    <Card
      sx={{
        width: 80,
        height: 80,
        position: 'relative',
        border: '2px solid',
        borderColor: getStatusColor(),
        borderRadius: 2,
        overflow: 'hidden',
        opacity: status === 'pending' ? 0.5 : 1,
        transition: 'all 0.3s ease',
        ...(status === 'analyzing' && {
          animation: 'pulse-border 2s ease-in-out infinite',
          '@keyframes pulse-border': {
            '0%, 100%': {
              borderColor: '#3B82F6',
              boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)',
            },
            '50%': {
              borderColor: '#60A5FA',
              boxShadow: '0 0 0 8px rgba(59, 130, 246, 0)',
            },
          },
        }),
      }}
    >
      <CardMedia
        component="img"
        image={image.url}
        alt={image.name}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* 状态图标 */}
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '50%',
          padding: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {getStatusIcon()}
      </Box>

      {/* 序号 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: 0.5,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 'bold',
          }}
        >
          {index + 1}
        </Typography>
      </Box>
    </Card>
  );
};
