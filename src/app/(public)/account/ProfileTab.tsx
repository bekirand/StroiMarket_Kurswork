'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileTab({ user }: { user: any }) {
    const router = useRouter();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [image, setImage] = useState(user?.image || '');

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setIsUploading(true);
        setMessage({ text: '', type: '' });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', `/users/${user?.name || user?.id || 'avatar'}`);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setImage(data.url);
            } else {
                setMessage({ text: 'Ошибка загрузки фото', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Сетевая ошибка', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, image })
            });

            if (res.ok) {
                setMessage({ text: 'Профиль успешно обновлен', type: 'success' });
                router.refresh(); // Обновить данные сессии и страницы
            } else {
                const data = await res.json();
                setMessage({ text: data.error || 'Ошибка', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Сетевая ошибка', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Личные данные</h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>

                {/* Аватар */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-primary-100)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, overflow: 'hidden' }}>
                        {image ? (
                            <img src={image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            name?.[0]?.toUpperCase() || 'U'
                        )}
                    </div>
                    <div>
                        <label style={{ cursor: 'pointer', background: 'var(--color-bg)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem', fontWeight: 600, display: 'inline-block', transition: 'background 0.2s' }}>
                            {isUploading ? 'Загрузка...' : 'Изменить фото'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={isUploading} />
                        </label>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', marginTop: '8px' }}>JPEG, PNG до 5MB</div>
                    </div>
                </div>

                {/* Email (Readonly) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-gray-700)' }}>Email</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)', color: 'var(--color-gray-500)', outline: 'none' }}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)' }}>Email используется для входа и не может быть изменен</div>
                </div>

                {/* Имя */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-gray-700)' }}>Имя и фамилия</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--color-gray-300)', outline: 'none', transition: 'border 0.2s' }}
                    />
                </div>

                {/* Телефон */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-gray-700)' }}>Номер телефона</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+7 (999) 000-00-00"
                        style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--color-gray-300)', outline: 'none', transition: 'border 0.2s' }}
                    />
                </div>

                {message.text && (
                    <div style={{ padding: '12px', borderRadius: '8px', fontSize: '0.9rem', background: message.type === 'error' ? '#fef2f2' : '#ecfdf5', color: message.type === 'error' ? '#ef4444' : '#10b981', border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#6ee7b7'}` }}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSaving}
                    style={{ padding: '12px 24px', borderRadius: '10px', background: 'var(--color-primary-600)', color: 'white', fontWeight: 600, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', marginTop: '8px', transition: 'background 0.2s' }}
                >
                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </form>
        </div>
    );
}
