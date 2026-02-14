import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ThemeProvider } from '@/components/ThemeProvider';

export function Providers({ children, initialTheme }: { children: React.ReactNode, initialTheme?: any }) {
    return (
        <ThemeProvider initialTheme={initialTheme}>
            <CurrencyProvider>
                <CartProvider>
                    <WishlistProvider>
                        {children}
                    </WishlistProvider>
                </CartProvider>
            </CurrencyProvider>
        </ThemeProvider>
    );
}
