'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = { id: string; name: string };
type ProductData = {
    id?: string;
    name: string;
    sku: string;
    description: string;
    price: number;
    images: string[];
    unit: string;
    purchaseUnit: string;
    stockQuantity: number;
    discount: number;
    isActive: boolean;
    categoryId: string;
    reviewCriteria?: { name: string, options: string[] }[];
    features?: { name: string, value: string }[];
};

export default function ProductFormClient({ categories, initialData }: { categories: Category[], initialData?: ProductData }) {
    const router = useRouter();
    const isEditing = !!initialData?.id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<ProductData>(initialData || {
        name: '',
        sku: '',
        description: '',
        price: 0,
        images: [],
        unit: 'шт',
        purchaseUnit: 'шт',
        stockQuantity: 0,
        discount: 0,
        isActive: true,
        categoryId: categories[0]?.id || '',
        reviewCriteria: [],
        features: [],
    });

    // --- Обработчики характеристик ---
    const addFeature = () => {
        setFormData(prev => ({ ...prev, features: [...(prev.features || []), { name: '', value: '' }] }));
    };

    const updateFeature = (index: number, field: 'name' | 'value', value: string) => {
        const feats = [...(formData.features || [])];
        feats[index][field] = value;
        setFormData(prev => ({ ...prev, features: feats }));
    };

    const removeFeature = (index: number) => {
        const feats = [...(formData.features || [])];
        feats.splice(index, 1);
        setFormData(prev => ({ ...prev, features: feats }));
    };
    // ---------------------------------

    const addReviewCriterion = () => {
        setFormData(prev => ({ ...prev, reviewCriteria: [...(prev.reviewCriteria || []), { name: '', options: ['', ''] }] }));
    };

    const updateReviewCriterionName = (index: number, value: string) => {
        const rc = [...(formData.reviewCriteria || [])];
        rc[index].name = value;
        setFormData(prev => ({ ...prev, reviewCriteria: rc }));
    };

    const addReviewCriterionOption = (index: number) => {
        const rc = [...(formData.reviewCriteria || [])];
        rc[index].options.push('');
        setFormData(prev => ({ ...prev, reviewCriteria: rc }));
    };

    const updateReviewCriterionOption = (critIndex: number, optIndex: number, value: string) => {
        const rc = [...(formData.reviewCriteria || [])];
        rc[critIndex].options[optIndex] = value;
        setFormData(prev => ({ ...prev, reviewCriteria: rc }));
    };

    const removeReviewCriterionOption = (critIndex: number, optIndex: number) => {
        const rc = [...(formData.reviewCriteria || [])];
        rc[critIndex].options.splice(optIndex, 1);
        setFormData(prev => ({ ...prev, reviewCriteria: rc }));
    };

    const removeReviewCriterion = (index: number) => {
        const rc = [...(formData.reviewCriteria || [])];
        rc.splice(index, 1);
        setFormData(prev => ({ ...prev, reviewCriteria: rc }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let parsedValue: any = value;
        if (type === 'number') parsedValue = value ? Number(value) : '';
        if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData.sku) {
            alert('Пожалуйста, сначала введите артикул (SKU) для создания папки изображений');
            e.target.value = '';
            return;
        }

        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (formData.images.length + uploadedUrls.length >= 10) break;

                const uploadData = new FormData();
                uploadData.append('file', file);
                uploadData.append('folder', `/products/${formData.sku}/Images-product`);

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

            setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls].slice(0, 10) }));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const removeImageField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const setMainImage = (index: number) => {
        if (index === 0) return;
        const newImages = [...formData.images];
        const [target] = newImages.splice(index, 1);
        newImages.unshift(target);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEditing ? `/api/admin/products/${initialData.id}` : '/api/admin/products';
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
            router.push('/admin/products');
            router.refresh();
        } catch (err: any) {
            alert(err.message);
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing || !confirm('Удалить этот товар? Это действие нельзя отменить.')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${initialData.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Ошибка удаления');
            router.push('/admin/products');
            router.refresh();
        } catch (err: any) {
            alert(err.message);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid var(--color-border)', maxWidth: '900px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

                {/* Возле Левая колонка */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Название *</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Артикул (SKU) *</label>
                        <input required type="text" name="sku" value={formData.sku} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Категория *</label>
                        <select required name="categoryId" value={formData.categoryId} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                            <option value="">Выберите категорию...</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ед. измерения</label>
                            <input required type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="шт, кг, м" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ед. закупки</label>
                            <input required type="text" name="purchaseUnit" value={formData.purchaseUnit} onChange={handleChange} placeholder="шт, упаковка" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                        </div>
                    </div>
                </div>

                {/* Правая колонка */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Цена (₽) *</label>
                            <input required type="number" name="price" value={formData.price} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Скидка (%)</label>
                            <input required type="number" name="discount" value={formData.discount} onChange={handleChange} min={0} max={100} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Остаток на складе *</label>
                        <input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    </div>

                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label style={{ fontWeight: 600 }}>Изображения</label>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>{formData.images.length}/10</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {formData.images.map((url, index) => (
                                <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'white', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                                    <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-bg)', background: '#f8fafc' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt={`Фото ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {index === 0 && (
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--color-primary-600)', color: 'white', fontSize: '10px', textAlign: 'center', fontWeight: 700, padding: '2px 0' }}>ГЛАВНОЕ</div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, wordBreak: 'break-all', fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>
                                        {url}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {index > 0 && (
                                            <button type="button" onClick={() => setMainImage(index)} style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontWeight: 600, textAlign: 'right' }}>
                                                Сделать главным
                                            </button>
                                        )}
                                        <button type="button" onClick={() => removeImageField(index)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontWeight: 600, textAlign: 'right' }}>
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {formData.images.length < 10 && (
                                <div>
                                    <input
                                        type="file"
                                        id="imageUpload"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                    <label
                                        htmlFor="imageUpload"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1.5px dashed var(--color-border)',
                                            background: uploading ? 'var(--color-bg)' : 'transparent',
                                            color: 'var(--color-gray-700)',
                                            cursor: uploading ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        {uploading ? 'Загрузка...' : '📁 Загрузить фотографии (До 10 шт.)'}
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                        <label htmlFor="isActive" style={{ fontWeight: 600, cursor: 'pointer' }}>Товар активен (виден на сайте)</label>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Дополнительные критерии оценки отзывов (выбор из вариантов)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '8px' }}>
                    {(formData.reviewCriteria || []).map((crit, critIndex) => (
                        <div key={critIndex} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <input
                                    type="text"
                                    value={crit.name}
                                    onChange={(e) => updateReviewCriterionName(critIndex, e.target.value)}
                                    placeholder="Название (например: Соответствие ожиданию)"
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeReviewCriterion(critIndex)}
                                    style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Удалить
                                </button>
                            </div>

                            <div style={{ marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-600)' }}>Варианты ответа:</label>
                                {crit.options.map((opt, optIndex) => (
                                    <div key={optIndex} style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => updateReviewCriterionOption(critIndex, optIndex, e.target.value)}
                                            placeholder="Например: Полностью соответствует"
                                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeReviewCriterionOption(critIndex, optIndex)}
                                            style={{ padding: '8px 12px', background: 'white', color: '#dc2626', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addReviewCriterionOption(critIndex)}
                                    style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--color-primary-600)', padding: '4px 0', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                >
                                    + Добавить вариант
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addReviewCriterion} style={{ background: 'none', border: '1px dashed var(--color-primary-600)', color: 'var(--color-primary-600)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    + Добавить критерий
                </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Характеристики товара</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                    {(formData.features || []).map((feat, index) => (
                        <div key={index} style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={feat.name}
                                onChange={(e) => updateFeature(index, 'name', e.target.value)}
                                placeholder="Например: Цвет, Вес"
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                            />
                            <input
                                type="text"
                                value={feat.value}
                                onChange={(e) => updateFeature(index, 'value', e.target.value)}
                                placeholder="Например: Серый, 25 кг"
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                            />
                            <button
                                type="button"
                                onClick={() => removeFeature(index)}
                                style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                title="Удалить характеристику"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addFeature} style={{ background: 'none', border: '1px dashed var(--color-primary-600)', color: 'var(--color-primary-600)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    + Добавить характеристику
                </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Описание *</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-bg)', paddingTop: '20px' }}>
                {isEditing ? (
                    <button type="button" onClick={handleDelete} disabled={loading} style={{ padding: '10px 20px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Удалить товар
                    </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => router.back()} disabled={loading} style={{ padding: '10px 20px', borderRadius: '8px', background: 'white', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 600 }}>
                        Отмена
                    </button>
                    <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--color-primary-600)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {loading ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Создать товар')}
                    </button>
                </div>
            </div>
        </form>
    );
}
