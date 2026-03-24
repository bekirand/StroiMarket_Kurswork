'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CategoryData = {
    id?: string;
    name: string;
    slug: string;
    image: string;
};

export default function CategoryFormClient({ initialData }: { initialData?: CategoryData }) {
    const router = useRouter();
    const isEditing = !!initialData?.id;

    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState<CategoryData>(initialData || {
        name: '',
        slug: '',
        image: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateSlug = () => {
        if (!formData.name) return;
        const slug = formData.name.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            + '-' + Date.now().toString().slice(-4);
        setFormData(prev => ({ ...prev, slug }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        if (!formData.slug) {
            alert('Сначала укажите название категории (и сгенерируйте Slug), чтобы правильно назвать папку с картинкой.');
            e.target.value = '';
            return;
        }

        const file = e.target.files[0];
        setUploadingImage(true);

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', `categories/${formData.slug}`);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: uploadData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload error');
            }

            const data = await res.json();
            setFormData(prev => ({ ...prev, image: data.url }));
        } catch (error: any) {
            alert('Ошибка загрузки: ' + error.message);
        } finally {
            setUploadingImage(false);
            e.target.value = ''; // Сброс input
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEditing ? `/api/admin/categories/${initialData.id}` : '/api/admin/categories';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Ошибка при сохранении');
            }

            // Успех
            router.push('/admin/categories');
            router.refresh(); // Обновляем данные страниц
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing || !confirm('Внимание! Удаление категории возможно только если в ней нет товаров. Удалить?')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/categories/${initialData.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Ошибка удаления');
            }
            router.push('/admin/categories');
            router.refresh();
        } catch (err: any) {
            alert(err.message);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid var(--color-border)', maxWidth: '500px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Название категории *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} onBlur={!formData.slug ? generateSlug : undefined} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Slug (URL) *</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input required type="text" name="slug" value={formData.slug} onChange={handleChange} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                        <button type="button" onClick={generateSlug} style={{ padding: '0 12px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>Генерировать</button>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Обложка</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                type="file"
                                id="categoryImageUpload"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor="categoryImageUpload"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1.5px dashed var(--color-border)',
                                    background: uploadingImage ? 'var(--color-bg)' : 'transparent',
                                    color: 'var(--color-gray-700)',
                                    cursor: uploadingImage ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s',
                                }}
                            >
                                {uploadingImage ? 'Загрузка картинки...' : '📁 Выбрать обложку'}
                            </label>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', marginTop: '8px' }}>
                                Рекомендуется использовать квадратное изображение или 4:3. Картинка будет сохранена в папке <code>/categories/{formData.slug || '...'}</code>.
                            </div>
                        </div>

                        {formData.image && (
                            <div style={{ position: 'relative', width: '140px', flexShrink: 0 }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={formData.image} alt="Превью" style={{ width: '100%', height: '140px', objectFit: 'cover', background: 'var(--color-bg-subtle)', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                    style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                                    title="Удалить картинку"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-bg)', paddingTop: '20px' }}>
                {isEditing ? (
                    <button type="button" onClick={handleDelete} disabled={loading} style={{ padding: '10px 20px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Удалить
                    </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => router.back()} disabled={loading || uploadingImage} style={{ padding: '10px 20px', borderRadius: '8px', background: 'white', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 600 }}>
                        Отмена
                    </button>
                    <button type="submit" disabled={loading || uploadingImage} style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--color-primary-600)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {loading ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Создать')}
                    </button>
                </div>
            </div>
        </form>
    );
}
