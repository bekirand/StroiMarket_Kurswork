'use client';

import { useState } from 'react';
import styles from '../Admin.module.css';

type ContactMessage = {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    body: string;
    isRead: boolean;
    createdAt: string;
};

export default function MessagesClient({
    initialMessages,
    isAdmin,
    canDelete
}: {
    initialMessages: any[],
    isAdmin: boolean,
    canDelete: boolean
}) {
    const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить это сообщение навсегда?')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Ошибка удаления');

            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert('Не удалось удалить сообщение');
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.phone.includes(searchQuery)
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Панель управления (поиск) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)', alignItems: 'end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Поиск (Имя, Телефон)
                    </label>
                    <input
                        type="text"
                        placeholder="Что ищем..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem' }}
                    />
                </div>
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--color-bg)', border: 'none', color: 'var(--color-gray-700)', fontWeight: 600, cursor: 'pointer', height: '42px' }}
                    >
                        Сбросить
                    </button>
                )}
            </div>

            {/* Список сообщений */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {filteredMessages.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)', background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                        Сообщений не найдено.
                    </div>
                ) : (
                    filteredMessages.map(msg => (
                        <div key={msg.id} style={{
                            padding: '24px', background: 'white', border: '1px solid var(--color-border)',
                            borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
                            opacity: msg.isRead ? 0.7 : 1, transition: 'all 0.2s',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-gray-900)' }}>
                                        {msg.name}
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--color-gray-600)', marginTop: '4px', flexWrap: 'wrap' }}>
                                        <span>📞 <a href={`tel:${msg.phone}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>{msg.phone}</a></span>
                                        {msg.email && <span>✉️ <a href={`mailto:${msg.email}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>{msg.email}</a></span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>
                                        {new Date(msg.createdAt).toLocaleString('ru-RU', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            disabled={deletingId === msg.id}
                                            style={{
                                                padding: '4px 10px', borderRadius: '6px', border: 'none',
                                                background: '#fee2e2', color: '#dc2626', fontSize: '0.8rem',
                                                fontWeight: 600, cursor: deletingId === msg.id ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {deletingId === msg.id ? 'Удаление...' : 'Удалить'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{
                                padding: '16px', background: 'var(--color-bg-subtle)', borderRadius: '12px',
                                color: 'var(--color-gray-800)', whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.95rem'
                            }}>
                                {msg.body}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', textAlign: 'right' }}>
                Показано: {filteredMessages.length} из {messages.length}
            </div>
        </div>
    );
}
