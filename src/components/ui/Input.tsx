/**
 * Компонент Input — поле ввода с поддержкой валидации,
 * label, иконок и вспомогательного текста
 */
import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;     // Текст ошибки валидации
    hint?: string;      // Вспомогательный текст под полем
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    required?: boolean;
}

export default function Input({
    label,
    error,
    hint,
    iconLeft,
    iconRight,
    required,
    id,
    className = '',
    ...props
}: InputProps) {
    // Генерируем id если не передан (для связи label ↔ input)
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;

    const wrapperClasses = [
        styles.wrapper,
        error ? styles.error : '',
        className,
    ].filter(Boolean).join(' ');

    const inputWrapperClasses = [
        styles.inputWrapper,
        iconLeft ? styles.iconLeft : '',
        iconRight ? styles.iconRight : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {/* Подпись поля */}
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                    {required && <span className={styles.required} aria-hidden="true">*</span>}
                </label>
            )}

            {/* Поле ввода с иконками */}
            <div className={inputWrapperClasses}>
                {iconLeft && (
                    <span className={`${styles.icon} ${styles.left}`} aria-hidden="true">
                        {iconLeft}
                    </span>
                )}
                <input
                    id={inputId}
                    className={styles.input}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...props}
                />
                {iconRight && (
                    <span className={`${styles.icon} ${styles.right}`} aria-hidden="true">
                        {iconRight}
                    </span>
                )}
            </div>

            {/* Ошибка или подсказка */}
            {error && (
                <p id={`${inputId}-error`} className={styles.errorText} role="alert">
                    {error}
                </p>
            )}
            {hint && !error && (
                <p id={`${inputId}-hint`} className={styles.hint}>
                    {hint}
                </p>
            )}
        </div>
    );
}
