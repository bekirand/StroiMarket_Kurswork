/**
 * Компонент Button — универсальная кнопка
 * Поддерживает 5 вариантов оформления, 3 размера, состояние загрузки
 */
import React from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;   // Показывать спиннер вместо контента
    fullWidth?: boolean; // Растянуть на всю ширину
    iconRight?: boolean; // Иконка справа (вместо левой по умолчанию)
    href?: string;       // Если указан — рендерит <a> вместо <button>
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    iconRight = false,
    href,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    // Собираем CSS-классы из CSS-модуля
    const classes = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        iconRight ? styles.iconRight : '',
        loading ? styles.loading : '',
        className,
    ].filter(Boolean).join(' ');

    const content = (
        <>
            {/* Спиннер загрузки */}
            {loading && <span className={styles.spinner} aria-hidden="true" />}
            {/* Контент кнопки */}
            {!loading && children}
        </>
    );

    // Если передан href — рендерим как ссылку
    if (href) {
        return (
            <a href={href} className={classes}>
                {content}
            </a>
        );
    }

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {content}
        </button>
    );
}
