/**
 * Компонент Card — карточка-контейнер
 */
import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean; // Добавить hover-эффект при наведении
    shadow?: 'flat' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

export default function Card({
    children,
    className = '',
    interactive = false,
    shadow = 'elevated',
    padding = 'md',
    onClick,
}: CardProps) {
    const paddingClass = {
        none: '',
        sm: styles['padded-sm'],
        md: styles.padded,
        lg: styles['padded-lg'],
    }[padding];

    const classes = [
        styles.card,
        styles[shadow],
        interactive ? styles.interactive : '',
        paddingClass,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick}>
            {children}
        </div>
    );
}
