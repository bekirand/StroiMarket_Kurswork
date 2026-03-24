'use client';

import { useState } from 'react';

interface CopyButtonProps {
    textToCopy: string;
    className?: string;
}

export default function CopyButton({ textToCopy, className = '' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Возвращаем иконку через 2 секунды
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            title="Скопировать артикул"
            className={className}
            style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                color: copied ? '#10b981' : 'var(--color-primary-600)', // Зеленый если скопировано, иначе синий
                transition: 'color 0.2s ease',
            }}
            aria-label="Скопировать текст"
        >
            {copied ? (
                // Иконка "Галочка" (Успех)
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            ) : (
                // Иконка "Копировать"
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
            )}
        </button>
    );
}
