/**
 * Layout публичного сайта
 * CartProvider → PromoBar → Header → main → Footer
 */
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PromoBar from '@/components/home/PromoBar';
import { CartProvider } from '@/context/CartContext';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <PromoBar />
                <Header />
                <main style={{ flex: 1 }}>
                    {children}
                </main>
                <Footer />
            </div>
        </CartProvider>
    );
}
