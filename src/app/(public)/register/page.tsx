'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import styles from '../Auth.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!agreed) {
            setError('Необходимо согласиться с условиями обработки персональных данных');
            return;
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);

        try {
            // 1. Создаем пользователя через API
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Ошибка при регистрации');
                setLoading(false);
                return;
            }

            // 2. Сразу логиним его
            const signInRes = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (signInRes?.error) {
                setError('Регистрация прошла успешно, но не удалось войти: ' + signInRes.error);
                setLoading(false);
                return;
            }

            // 3. Успех -> Редирект в личный кабинет
            router.push('/account');
            router.refresh();
        } catch {
            setError('Сетевая ошибка. Попробуйте позже.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Регистрация</h1>
                <p className={styles.subtitle}>Создайте аккаунт для покупок</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.field}>
                        <label className={styles.label}>Ваше имя</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Иван Иванов"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="ivan@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Пароль</label>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="Минимум 6 символов"
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Повторите пароль</label>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <label className={styles.consent}>
                        <input
                            type="checkbox"
                            className={styles.consentCheckbox}
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <span className={styles.consentText}>
                            Нажимая на кнопку я согласен с{' '}
                            <Link href="/privacy-policy" className={styles.consentLink} target="_blank">
                                условиями
                            </Link>{' '}
                            и подтверждаю обработку моих персональных данных.
                        </span>
                    </label>

                    <button type="submit" className={styles.submitBtn} disabled={loading || !agreed}>
                        {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Уже есть аккаунт?{' '}
                    <Link href="/login" className={styles.link}>
                        Войти
                    </Link>
                </div>
            </div>
        </div>
    );
}
