'use client';

import { useEffect, useRef } from 'react';
import { CurveGradientBg } from 'color4bg';

/**
 * 动态背景组件
 * 使用 Color4Bg 创建蓝色曲线渐变动画背景
 */
export default function DynamicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgInstanceRef = useRef<CurveGradientBg | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 为容器生成唯一 ID
    const containerId = 'color4bg-dynamic-background';
    containerRef.current.id = containerId;

    // 配置参数
    const config = {
      dom: containerId,
      colors: ['#00023E', '#3157B3', '#204299', '#132385', '#0C0D62', '#00023E'],
      seed: 1000,
      loop: true,
    };

    try {
      // 创建 CurveGradientBg 实例
      bgInstanceRef.current = new CurveGradientBg(config);
      console.log('Color4Bg CurveGradientBg started successfully');
    } catch (error) {
      console.error('Failed to create CurveGradientBg:', error);
    }

    // 清理
    return () => {
      if (bgInstanceRef.current && typeof bgInstanceRef.current.destroy === 'function') {
        try {
          bgInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying CurveGradientBg:', error);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: '#00023E',
      }}
      aria-hidden="true"
      role="presentation"
    />
  );
}
