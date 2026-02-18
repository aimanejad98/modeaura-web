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
    stock: number;
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
    removeFromCart: (id: string, variant?: string) => void;
    updateQuantity: (id: string, variant: string | undefined, quantity: number) => void;
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
                const currentQty = Number(existing.quantity);
                const addQty = Number(item.quantity);
                const maxStock = Number(item.stock);

                if (currentQty + addQty > maxStock) {
                    alert(`Sorry, you can only add up to ${maxStock} of this item.`);
                    return prev;
                }
                return prev.map(i =>
                    (i.id === item.id && i.variant === item.variant)
                        ? { ...i, quantity: currentQty + addQty, stock: maxStock }
                        : i
                );
            }
            if (Number(item.quantity) > Number(item.stock)) {
                alert(`Sorry, you can only add up to ${item.stock} of this item.`);
                return prev;
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (id: string, variant?: string) => {
        setCart(prev => prev.filter(i => !(i.id === id && i.variant === variant)));
    };

    const updateQuantity = (id: string, variant: string | undefined, quantity: number) => {
        if (quantity < 1) return;
        setCart(prev => prev.map(i => {
            if (i.id === id && i.variant === variant) {
                const maxStock = Number(i.stock);
                if (quantity > maxStock) {
                    alert(`Sorry, only ${maxStock} available.`);
                    return i;
                }
                return { ...i, quantity };
            }
            return i;
        }));
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
