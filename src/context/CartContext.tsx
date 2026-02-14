'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    sku?: string;
    variant?: string;
}

interface AppliedDiscount {
    code: string;
    type: 'Percentage' | 'Fixed';
    value: number;
    amount: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    discount: AppliedDiscount | null;
    applyDiscount: (discount: AppliedDiscount) => void;
    removeDiscount: () => void;
    totalAfterDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState<AppliedDiscount | null>(null);

    // Load cart and discount from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('modeaura_bag');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart');
            }
        }

        const savedDiscount = localStorage.getItem('modeaura_discount');
        if (savedDiscount) {
            try {
                setDiscount(JSON.parse(savedDiscount));
            } catch (e) {
                console.error('Failed to parse discount');
            }
        }
    }, []);

    // Save cart and discount to localStorage
    useEffect(() => {
        localStorage.setItem('modeaura_bag', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (discount) {
            localStorage.setItem('modeaura_discount', JSON.stringify(discount));
        } else {
            localStorage.removeItem('modeaura_discount');
        }
    }, [discount]);

    const addToCart = (item: CartItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id && i.variant === item.variant);
            if (existing) {
                return prev.map(i =>
                    (i.id === item.id && i.variant === item.variant)
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    const applyDiscount = (d: AppliedDiscount) => setDiscount(d);
    const removeDiscount = () => setDiscount(null);

    const totalAfterDiscount = cartTotal - (discount?.amount || 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            discount,
            applyDiscount,
            removeDiscount,
            totalAfterDiscount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
