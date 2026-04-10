'use client';
import React, { useRef, useEffect, useState } from 'react';

interface AnimateProps {
  children: React.ReactNode;
  variant?: 'fade-up' | 'fade-in' | 'scale-up' | 'fade-down' | 'slide-left' | 'slide-right';
  delay?: number;
  className?: string;
  as?: any;
  style?: React.CSSProperties;
  id?: string;
}

export default function Animate({ children, variant = 'fade-up', delay = 0, className = '', as: Component = 'div', style, id }: AnimateProps) {
  const ref = useRef<Element | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (ref.current) observer.unobserve(ref.current);
      }
    }, { threshold: 0.1, rootMargin: '50px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const variants: Record<string, string> = {
    'fade-up': "transition-all duration-1000 ease-out " + (inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'),
    'fade-down': "transition-all duration-1000 ease-out " + (inView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'),
    'fade-in': "transition-all duration-1000 ease-out " + (inView ? 'opacity-100' : 'opacity-0'),
    'scale-up': "transition-all duration-1000 ease-out " + (inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'),
    'slide-left': "transition-all duration-1000 ease-out " + (inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'),
    'slide-right': "transition-all duration-1000 ease-out " + (inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'),
  };

  return (
    <Component ref={ref} id={id} className={variants[variant] + ' ' + className} style={{ ...style, transitionDelay: delay + 'ms' }}>
      {children}
    </Component>
  );
}

