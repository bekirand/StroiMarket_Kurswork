/**
 * Компонент Badge — статусный бейдж / ярлык
 * Используется для статусов заказов, тегов категорий и т.д.
 */
import React from 'react';
import styles from './Badge.module.css';

type BadgeColor = 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'gray';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    children: React.ReactNode;
    color?: BadgeColor;
    size?: BadgeSize;
    dot?: boolean; // Показывать цветную точку перед текстом
    className?: string;
}

export default function Badge({
    children,
    color = 'blue',
    size = 'md',
    dot = false,
    className = '',
}: BadgeProps) {
    const classes = [
        styles.badge,
        styles[color],
        styles[size],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {dot && <span className={styles.dot} aria-hidden="true" />}
            {children}
        </span>
    );
}
