'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddressesTab({ initialAddresses }: { initialAddresses: any[] }) {
    const router = useRouter();
    const [addresses, setAddresses] = useState(initialAddresses || []);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, addressLine, isDefault })
            });

            if (res.ok) {
                const data = await res.json();

                // Обновляем локальный стейт (если новый по умолчанию — сбрасываем старые)
                let newAddresses = [...addresses];
                if (data.address.isDefault) {
                    newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }));
                }
                setAddresses([data.address, ...newAddresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)));

                // Сброс формы
                setTitle('');
                setAddressLine('');
                setIsDefault(false);
                setIsFormOpen(false);
                router.refresh();
            } else {
                setMessage('Ошибка при добавлении адреса');
            }
        } catch (err) {
            setMessage('Сетевая ошибка');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить этот адрес?')) return;

        try {
            const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setAddresses(addresses.filter(a => a.id !== id));
                router.refresh();
            }
        } catch (err) {
            alert('Ошибка удаления');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const res = await fetch(`/api/user/addresses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDefault: true })
            });
            if (res.ok) {
                setAddresses(addresses.map(a => ({
                    ...a,
                    isDefault: a.id === id
                })));
                router.refresh();
            }
        } catch (err) {
            alert('Ошибка обновления');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Мои адреса</h2>
                {!isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--color-primary-600)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                        + Добавить адрес
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div style={{ background: 'var(--color-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Новый адрес</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Название (Дом, Офис)*</label>
                            <input
                                type="text" value={title} onChange={e => setTitle(e.target.value)} required
                                placeholder="Например: Дом"
                                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-gray-300)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Полный адрес*</label>
                            <input
                                type="text" value={addressLine} onChange={e => setAddressLine(e.target.value)} required
                                placeholder="г. Москва, ул. Пушкина, д. Колотушкина 1"
                                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-gray-300)' }}
                            />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
                            Сделать адресом по умолчанию
                        </label>

                        {message && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{message}</div>}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: 'white', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 600 }}>
                                Отмена
                            </button>
                            <button type="submit" disabled={isSaving} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--color-primary-600)', color: 'white', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--color-border)', borderRadius: '12px', color: 'var(--color-gray-500)' }}>
                    У вас пока нет сохраненных адресов доставки.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {addresses.map((addr) => (
                        <div key={addr.id} style={{ border: `1.5px solid ${addr.isDefault ? 'var(--color-primary-500)' : 'var(--color-border)'}`, borderRadius: '12px', padding: '20px', position: 'relative', background: addr.isDefault ? 'var(--color-primary-50)' : 'white' }}>
                            {addr.isDefault && (
                                <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', background: 'var(--color-primary-100)', color: 'var(--color-primary-700)', borderRadius: '4px' }}>
                                    ПО УМОЛЧАНИЮ
                                </div>
                            )}
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', paddingRight: addr.isDefault ? '80px' : '0' }}>{addr.title}</h3>
                            <p style={{ color: 'var(--color-gray-600)', fontSize: '0.95rem', marginBottom: '16px', lineHeight: 1.5 }}>
                                {addr.addressLine}
                            </p>

                            <div style={{ display: 'flex', gap: '12px', borderTop: `1px solid ${addr.isDefault ? '#bfdbfe' : 'var(--color-bg-subtle)'}`, paddingTop: '16px' }}>
                                {!addr.isDefault && (
                                    <button onClick={() => handleSetDefault(addr.id)} style={{ flex: 1, background: 'white', border: '1px solid var(--color-border)', padding: '6px 0', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                        Сделать основным
                                    </button>
                                )}
                                <button onClick={() => handleDelete(addr.id)} style={{ padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginLeft: addr.isDefault ? 'auto' : '0' }}>
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
