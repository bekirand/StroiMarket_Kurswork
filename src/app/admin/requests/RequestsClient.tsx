'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RequestStatus } from '@prisma/client';

type RequestData = {
    id: string;
    subject: string;
    message: string;
    status: RequestStatus;
    attachments: string[];
    createdAt: Date;
    fromUserId: string;
    toUserId: string | null;
    fromUser: { name: string; email: string };
    toUser?: { name: string; email: string };
};

const STATUS_MAP: Record<RequestStatus, { label: string; color: string; bg: string }> = {
    NOVAYA: { label: 'Новое', color: '#3b82f6', bg: '#eff6ff' },
    RASSMOTRENA: { label: 'Просмотрено', color: '#10b981', bg: '#ecfdf5' },
};

export default function RequestsClient({ initialRequests, isAdmin, currentUserId, currentUserEmail }: { initialRequests: RequestData[], isAdmin: boolean, currentUserId: string, currentUserEmail: string }) {
    const router = useRouter();
    const [requests, setRequests] = useState(initialRequests);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);

    const [activeTab, setActiveTab] = useState<'INBOX' | 'OUTBOX'>('INBOX');

    // Фильтры
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');

    // Состояние формы создания заявки
    const [showForm, setShowForm] = useState(false);
    const [toEmail, setToEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);

    const [loadingForm, setLoadingForm] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingFiles(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (attachments.length + uploadedUrls.length >= 10) {
                    alert('Максимум 10 файлов!');
                    break;
                }

                const uploadData = new FormData();
                uploadData.append('file', file);

                // ImageKit не поддерживает спецсимволы (@, .) в названиях папок
                const safeFolderName = currentUserEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
                uploadData.append('folder', `statements/${safeFolderName}`);

                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Ошибка загрузки файла');
                }

                const data = await res.json();
                uploadedUrls.push(data.url);
            }

            setAttachments(prev => [...prev, ...uploadedUrls].slice(0, 10));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUploadingFiles(false);
            e.target.value = '';
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingForm(true);
        try {
            const res = await fetch('/api/admin/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toEmail, subject, message, attachments }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Ошибка создания');
            }

            setToEmail('');
            setSubject('');
            setMessage('');
            setAttachments([]);
            setShowForm(false);
            setActiveTab('OUTBOX');
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoadingForm(false);
        }
    };

    const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
        setUpdatingId(requestId);
        try {
            const res = await fetch(`/api/admin/requests/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Ошибка обновления');

            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Ошибка сервера');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteRequest = async (requestId: string) => {
        console.log('handleDeleteRequest called for:', requestId);
        if (!confirm('Вы уверены, что хотите удалить это письмо навсегда? (Оно удалится и у вас, и у собеседника)')) {
            console.log('Deletion cancelled by user');
            return;
        }

        console.log('Proceeding with deletion for:', requestId);
        setUpdatingId(requestId);
        try {
            const res = await fetch(`/api/admin/requests/${requestId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Ошибка удаления');
            }

            setRequests(prev => prev.filter(r => r.id !== requestId));
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Ошибка сервера');
        } finally {
            setUpdatingId(null);
        }
    };

    // Фильтрация:
    // Входящие - где currentUserId == toUserId
    // Отправленные - где currentUserId == fromUserId
    const filteredRequests = requests.filter(req => {
        // Сначала фильтр по вкладке
        const matchesTab = activeTab === 'INBOX'
            ? req.toUserId === currentUserId
            : req.fromUserId === currentUserId;
        if (!matchesTab) return false;

        // Поиск по теме и тексту
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const inSubject = req.subject.toLowerCase().includes(q);
            const inMessage = req.message.toLowerCase().includes(q);
            if (!inSubject && !inMessage) return false;
        }

        // Фильтр по дате (ввод ДД.ММ.ГГГГ)
        if (dateFilter) {
            const reqDate = new Date(req.createdAt).toLocaleDateString('ru-RU');
            if (!reqDate.includes(dateFilter)) return false;
        }

        // Фильтр по пользователю (отправитель для Inbox, получатель для Outbox)
        if (userFilter) {
            const q = userFilter.toLowerCase();
            const targetUser = activeTab === 'INBOX' ? req.fromUser : req.toUser;
            const matchesUser = targetUser?.name.toLowerCase().includes(q) || targetUser?.email.toLowerCase().includes(q);
            if (!matchesUser) return false;
        }

        return true;
    });

    return (
        <div>
            {/* ТАБЫ И КНОПКА СОЗДАНИЯ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--color-bg-subtle)', padding: '4px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <button
                        onClick={() => setActiveTab('INBOX')}
                        style={{
                            padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600,
                            background: activeTab === 'INBOX' ? 'white' : 'transparent',
                            color: activeTab === 'INBOX' ? 'var(--color-primary-600)' : 'var(--color-gray-600)',
                            boxShadow: activeTab === 'INBOX' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        📥 Входящие
                    </button>
                    <button
                        onClick={() => setActiveTab('OUTBOX')}
                        style={{
                            padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600,
                            background: activeTab === 'OUTBOX' ? 'white' : 'transparent',
                            color: activeTab === 'OUTBOX' ? 'var(--color-primary-600)' : 'var(--color-gray-600)',
                            boxShadow: activeTab === 'OUTBOX' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        📤 Отправленные
                    </button>
                </div>

                <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', background: 'var(--color-primary-600)', color: 'white', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    {showForm ? 'Отмена' : 'Написать письмо'}
                </button>
            </div>

            {/* БЛОК ФИЛЬТРОВ */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
                background: 'white',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid var(--color-border)'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-500)' }}>ПОИСК (ТЕМА/ТЕКСТ)</label>
                    <input
                        type="text"
                        placeholder="Найти в письмах..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-500)' }}>ДАТА</label>
                    <input
                        type="text"
                        placeholder="ДД.ММ.ГГГГ"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-500)' }}>
                        {activeTab === 'INBOX' ? 'ОТПРАВИТЕЛЬ' : 'ПОЛУЧАТЕЛЬ'}
                    </label>
                    <input
                        type="text"
                        placeholder="Имя или Email..."
                        value={userFilter}
                        onChange={e => setUserFilter(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                        onClick={() => { setSearchQuery(''); setDateFilter(''); setUserFilter(''); }}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--color-bg-subtle)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'var(--color-gray-600)'
                        }}
                    >
                        Сбросить
                    </button>
                </div>
            </div>

            {/* ФОРМА СОЗДАНИЯ */}
            {showForm && (
                <form onSubmit={handleCreateRequest} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', marginBottom: '24px', maxWidth: '700px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: 'var(--color-primary-700)' }}>Новое письмо</h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Кому (Email сотрудника) *</label>
                        <input required type="email" placeholder="Например: boss@example.com" value={toEmail} onChange={e => setToEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Тема *</label>
                        <input required value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontWeight: 600 }}>Текст заявления *</label>
                            <span style={{ fontSize: '0.8rem', color: message.length > 5000 ? '#ef4444' : 'var(--color-gray-500)' }}>
                                {message.length}/5000
                            </span>
                        </div>
                        <textarea
                            required
                            value={message}
                            onChange={e => setMessage(e.target.value.slice(0, 5010))}
                            maxLength={5000}
                            rows={6}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: `1px solid ${message.length > 5000 ? '#ef4444' : 'var(--color-border)'}`,
                                resize: 'vertical'
                            }}
                        />
                        {message.length >= 5000 && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>Достигнут лимит 5000 символов</p>}
                    </div>

                    <div style={{ marginBottom: '24px', background: 'var(--color-bg)', padding: '16px', borderRadius: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Прикрепленные файлы</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                            {attachments.map((url, index) => (
                                <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'white', padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                    <a href={url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: '0.85rem', color: 'var(--color-primary-600)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                                        {decodeURIComponent(url.split('/').pop() || '')}
                                    </a>
                                    <button type="button" onClick={() => removeAttachment(index)} style={{ padding: '6px 10px', fontSize: '0.8rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>✕</button>
                                </div>
                            ))}
                        </div>
                        {attachments.length < 10 && (
                            <div>
                                <input type="file" id="attachFiles" multiple onChange={handleFileUpload} disabled={uploadingFiles} style={{ display: 'none' }} />
                                <label htmlFor="attachFiles" style={{
                                    display: 'inline-flex', padding: '10px 16px', borderRadius: '8px', background: 'white',
                                    border: '1.5px dashed var(--color-primary-400)', color: 'var(--color-primary-600)',
                                    fontWeight: 600, cursor: uploadingFiles ? 'not-allowed' : 'pointer'
                                }}>
                                    {uploadingFiles ? 'Загрузка...' : '📎 Прикрепить файл'}
                                </label>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loadingForm || uploadingFiles} style={{ padding: '12px 24px', background: 'var(--color-primary-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: '100%', fontSize: '1rem' }}>
                        {loadingForm ? 'Отправка...' : 'Отправить письмо'}
                    </button>
                </form>
            )}

            {/* СПИСОК ПИСЕМ */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-subtle)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Дата</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>
                                {activeTab === 'INBOX' ? 'От кого' : 'Кому'}
                            </th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Заявление</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                                    {activeTab === 'INBOX' ? 'У вас нет входящих писем' : 'Вы еще ничего не отправляли'}
                                </td>
                            </tr>
                        ) : filteredRequests.map((req) => (
                            <tr key={req.id} style={{ borderBottom: '1px solid var(--color-bg-subtle)' }}>
                                <td style={{ padding: '16px 24px', color: 'var(--color-gray-500)', verticalAlign: 'top' }}>
                                    <div style={{ fontWeight: 600 }}>{new Date(req.createdAt).toLocaleDateString('ru-RU')}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{new Date(req.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                                    {activeTab === 'INBOX' ? (
                                        <>
                                            <div style={{ fontWeight: 600 }}>{req.fromUser?.name || 'Сотрудник'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>{req.fromUser?.email}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontWeight: 600 }}>{req.toUser?.name || 'Получатель'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>{req.toUser?.email}</div>
                                        </>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px', maxWidth: '350px', verticalAlign: 'top' }}>
                                    <div
                                        onClick={() => setSelectedRequest(req)}
                                        style={{
                                            fontWeight: 600,
                                            marginBottom: '4px',
                                            color: '#000000',
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                        title="Нажмите, чтобы прочитать полностью"
                                    >
                                        {req.subject}
                                    </div>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--color-gray-700)',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        marginBottom: '8px',
                                        opacity: 0.8
                                    }}>
                                        {req.message}
                                    </div>

                                    {/* Индикация вложений */}
                                    {req.attachments && req.attachments.length > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary-600)', fontSize: '0.8rem', fontWeight: 600 }}>
                                            📎 {req.attachments.length} {req.attachments.length === 1 ? 'файл' : 'файла'}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                                    {req.toUserId === currentUserId ? (
                                        <select
                                            value={req.status}
                                            onChange={(e) => handleStatusChange(req.id, e.target.value as RequestStatus)}
                                            disabled={updatingId === req.id}
                                            style={{
                                                padding: '6px 12px', borderRadius: '8px', border: '1.5px solid var(--color-border)',
                                                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', outline: 'none',
                                                background: STATUS_MAP[req.status]?.bg || 'white',
                                                color: STATUS_MAP[req.status]?.color || 'black',
                                            }}
                                        >
                                            {Object.entries(STATUS_MAP).map(([val, { label }]) => (
                                                <option key={val} value={val} style={{ background: 'white', color: 'black' }}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700,
                                            background: STATUS_MAP[req.status]?.bg || '#f1f5f9',
                                            color: STATUS_MAP[req.status]?.color || '#475569'
                                        }}>
                                            {STATUS_MAP[req.status]?.label || req.status}
                                        </span>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteRequest(req.id);
                                        }}
                                        disabled={updatingId === req.id}
                                        title="Удалить письмо"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: updatingId === req.id ? 'wait' : 'pointer',
                                            fontSize: '1.2rem',
                                            padding: '8px',
                                            marginLeft: '8px',
                                            borderRadius: '8px',
                                            opacity: updatingId === req.id ? 0.3 : 0.6,
                                            transition: 'all 0.2s',
                                            color: 'var(--color-gray-500)',
                                            verticalAlign: 'middle',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minWidth: '32px',
                                            minHeight: '32px'
                                        }}
                                        onMouseOver={e => {
                                            if (updatingId !== req.id) {
                                                e.currentTarget.style.opacity = '1';
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.color = '#ef4444';
                                            }
                                        }}
                                        onMouseOut={e => {
                                            if (updatingId !== req.id) {
                                                e.currentTarget.style.opacity = '0.6';
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'var(--color-gray-500)';
                                            }
                                        }}
                                    >
                                        {updatingId === req.id ? '⏳' : '🗑️'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* МОДАЛЬНОЕ ОКНО ПРОСМОТРА ПИСЬМА */}
            {selectedRequest && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    padding: '20px'
                }} onClick={() => setSelectedRequest(null)}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '800px',
                        maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedRequest(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-gray-400)' }}
                        >✕</button>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <span style={{
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                                    background: STATUS_MAP[selectedRequest.status]?.bg, color: STATUS_MAP[selectedRequest.status]?.color
                                }}>{STATUS_MAP[selectedRequest.status]?.label}</span>
                                <span style={{ color: 'var(--color-gray-400)', fontSize: '0.85rem' }}>
                                    {new Date(selectedRequest.createdAt).toLocaleString('ru-RU')}
                                </span>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', margin: '0 0 12px', color: '#000000' }}>{selectedRequest.subject}</h2>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-gray-600)' }}>
                                <strong>От:</strong> {selectedRequest.fromUser.name} &lt;{selectedRequest.fromUser.email}&gt;
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-gray-600)' }}>
                                <strong>Кому:</strong> {selectedRequest.toUser?.name || 'Получатель'} &lt;{selectedRequest.toUser?.email}&gt;
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--color-bg-subtle)', padding: '24px', borderRadius: '16px', marginBottom: '24px',
                            whiteSpace: 'pre-wrap', color: 'var(--color-gray-800)', lineHeight: '1.6', fontSize: '1rem'
                        }}>
                            {selectedRequest.message}
                        </div>

                        {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--color-gray-500)' }}>ПРИКРЕПЛЕННЫЕ ФАЙЛЫ:</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {selectedRequest.attachments.map((fileUrl, idx) => (
                                        <a
                                            key={idx}
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                                                background: 'white', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--color-primary-600)',
                                                textDecoration: 'none', border: '1px solid var(--color-border)', fontWeight: 600,
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--color-primary-400)'; e.currentTarget.style.background = 'var(--color-bg)'; }}
                                            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'white'; }}
                                        >
                                            📎 {(() => {
                                                try {
                                                    const parts = fileUrl.split('/');
                                                    return decodeURIComponent(parts[parts.length - 1]);
                                                } catch { return `Файл ${idx + 1}`; }
                                            })()}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'white', fontWeight: 600, cursor: 'pointer' }}
                            >Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
