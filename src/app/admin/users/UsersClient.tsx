'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/generated/prisma';

type UserData = {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    canChangeOrderStatus: boolean;
    canDeleteReviews: boolean;
    canDeleteMessages: boolean;
    createdAt: Date;
};

const ROLE_MAP: Record<UserRole, { label: string; bg: string; color: string }> = {
    CUSTOMER: { label: 'Клиент', bg: '#f1f5f9', color: '#475569' },
    MANAGER: { label: 'Менеджер', bg: '#fef3c7', color: '#d97706' },
    ADMIN: { label: 'Администратор', bg: '#fee2e2', color: '#dc2626' },
    STOREKEEPER: { label: 'Кладовщик', bg: '#e0e7ff', color: '#4338ca' },
};

export default function UsersClient({ initialUsers, currentUserId }: { initialUsers: UserData[], currentUserId: string }) {
    const router = useRouter();
    const [users, setUsers] = useState(initialUsers);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Фильтры
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('ALL');

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                (user.name && user.name.toLowerCase().includes(q)) ||
                user.email.toLowerCase().includes(q);

            const matchesRole = filterRole === 'ALL' || user.role === filterRole;

            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, filterRole]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (userId === currentUserId) {
            alert('Вы не можете изменить свою собственную роль!');
            // Сбрасываем select обратно
            setUsers([...users]);
            return;
        }

        if (!confirm(`Вы уверены, что хотите изменить роль пользователя на ${ROLE_MAP[newRole].label}?`)) {
            setUsers([...users]);
            return;
        }

        setUpdatingId(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) throw new Error('Ошибка при обновлении роли');

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Ошибка сервера');
            setUsers([...users]); // Сброс при ошибке
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePermissionChange = async (userId: string, currentVal: boolean, field: 'canChangeOrderStatus' | 'canDeleteReviews' | 'canDeleteMessages') => {
        const newVal = !currentVal;
        let fieldName = '';
        if (field === 'canChangeOrderStatus') fieldName = 'менять статусы заказов';
        else if (field === 'canDeleteReviews') fieldName = 'удалять отзывы';
        else fieldName = 'удалять сообщения контактов';

        if (!confirm(`Вы уверены, что хотите ${newVal ? 'разрешить' : 'запретить'} этому пользователю ${fieldName}?`)) {
            return;
        }

        setUpdatingId(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: newVal }),
            });

            if (!res.ok) throw new Error('Ошибка при обновлении прав');

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: newVal } : u));
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Ошибка сервера');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Панель фильтров */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Поиск (Имя, Email)
                    </label>
                    <input
                        type="text"
                        placeholder="Кого ищем..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Роль
                    </label>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem', background: 'white', cursor: 'pointer' }}
                    >
                        <option value="ALL">Все роли</option>
                        {Object.entries(ROLE_MAP).map(([val, { label }]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                </div>
                {(searchQuery || filterRole !== 'ALL') && (
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                            onClick={() => { setSearchQuery(''); setFilterRole('ALL'); }}
                            style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--color-bg)', border: 'none', color: 'var(--color-gray-700)', fontWeight: 600, cursor: 'pointer', height: '42px' }}
                        >
                            Сбросить
                        </button>
                    </div>
                )}
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-subtle)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Пользователь</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Email</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Дата регистрации</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Статусы</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Отзывы</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Сообщения</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Роль</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                                    Пользователей не найдено
                                </td>
                            </tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--color-bg-subtle)' }}>
                                <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                                    {user.name || 'Аноним'} {user.id === currentUserId && '(Вы)'}
                                </td>
                                <td style={{ padding: '16px 24px', color: 'var(--color-gray-700)' }}>
                                    {user.email}
                                </td>
                                <td style={{ padding: '16px 24px', color: 'var(--color-gray-500)' }}>
                                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    {(user.role === 'MANAGER' || user.role === 'STOREKEEPER') ? (
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: (updatingId === user.id) ? 'not-allowed' : 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={user.canChangeOrderStatus}
                                                onChange={() => handlePermissionChange(user.id, user.canChangeOrderStatus, 'canChangeOrderStatus')}
                                                disabled={updatingId === user.id}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-600)' }}
                                            />
                                            <span style={{ fontSize: '0.85rem', color: user.canChangeOrderStatus ? 'var(--color-primary-700)' : 'var(--color-gray-500)' }}>
                                                {user.canChangeOrderStatus ? 'Да' : 'Нет'}
                                            </span>
                                        </label>
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-400)' }}>—</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    {user.role === 'MANAGER' ? (
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: (updatingId === user.id) ? 'not-allowed' : 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={user.canDeleteReviews}
                                                onChange={() => handlePermissionChange(user.id, user.canDeleteReviews, 'canDeleteReviews')}
                                                disabled={updatingId === user.id}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-600)' }}
                                            />
                                            <span style={{ fontSize: '0.85rem', color: user.canDeleteReviews ? 'var(--color-primary-700)' : 'var(--color-gray-500)' }}>
                                                {user.canDeleteReviews ? 'Да' : 'Нет'}
                                            </span>
                                        </label>
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-400)' }}>—</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    {user.role === 'MANAGER' ? (
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: (updatingId === user.id) ? 'not-allowed' : 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={user.canDeleteMessages}
                                                onChange={() => handlePermissionChange(user.id, user.canDeleteMessages, 'canDeleteMessages')}
                                                disabled={updatingId === user.id}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-600)' }}
                                            />
                                            <span style={{ fontSize: '0.85rem', color: user.canDeleteMessages ? 'var(--color-primary-700)' : 'var(--color-gray-500)' }}>
                                                {user.canDeleteMessages ? 'Да' : 'Нет'}
                                            </span>
                                        </label>
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-400)' }}>—</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                        disabled={updatingId === user.id || user.id === currentUserId}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: '1.5px solid var(--color-border)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            background: ROLE_MAP[user.role]?.bg || 'white',
                                            color: ROLE_MAP[user.role]?.color || 'black',
                                            cursor: user.id === currentUserId ? 'not-allowed' : 'pointer',
                                            outline: 'none'
                                        }}
                                    >
                                        {Object.entries(ROLE_MAP).map(([val, { label }]) => (
                                            <option key={val} value={val} style={{ background: 'white', color: 'black' }}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
