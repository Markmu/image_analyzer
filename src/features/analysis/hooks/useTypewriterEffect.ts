/**
 * 打字机效果 Hook
 * 实现专业的打字机动画效果
 */

import { useEffect, useState, useRef } from 'react';
import { TYPEWRITER_DEFAULTS } from '@/features/analysis/constants/animation-constants';

export interface TypewriterOptions {
  terms: string[];
  speed?: number; // 毫秒/字符
  delay?: number; // 打完后停留时间（毫秒）
  loop?: boolean;
}

export const useTypewriterEffect = (options: TypewriterOptions) => {
  const { terms, speed = TYPEWRITER_DEFAULTS.speed, delay = TYPEWRITER_DEFAULTS.delay, loop = true } = options;

  const [currentTerm, setCurrentTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (terms.length === 0) return;

    let charIndex = 0;
    let isDeletePhase = false;

    const typeNextChar = () => {
      const term = terms[charIndex % terms.length];

      if (isDeletePhase) {
        // 删除字符
        setCurrentTerm((prev) => {
          const newLength = Math.max(0, charIndex - 1);
          return term.slice(0, newLength);
        });
        if (charIndex <= 0) {
          isDeletePhase = false;
          charIndex++;
        }
      } else {
        // 打字
        setCurrentTerm((prev) => {
          return prev + term[charIndex];
        });
        if (charIndex >= term.length) {
          // 打完后停留
          timeoutRef.current = setTimeout(() => {
            isDeletePhase = true;
            charIndex = 0; // 开始删除
            typeNextChar();
          }, delay);
          return;
        }
        charIndex++;
      }
    };

    // 开始打字机
    timeoutRef.current = setTimeout(typeNextChar, speed);

    return () => {
      clearTimeout(timeoutRef.current as NodeJS.Timeout);
    };
  }, [terms, speed, delay, loop]);

  return { currentTerm, isVisible };
};
