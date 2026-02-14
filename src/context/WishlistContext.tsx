'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type WishlistItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
};

type WishlistContextType = {
    wishlist: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (productId: string) => void;
    clearWishlist: () => void;
    isInWishlist: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

    useEffect(() => {
        const savedWishlist = localStorage.getItem('modeaura_wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
                console.error('Failed to load wishlist', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('modeaura_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (item: WishlistItem) => {
        setWishlist((prev) => {
            if (prev.find((i) => i.id === item.id)) return prev;
            return [...prev, item];
        });
    };

    const removeFromWishlist = (productId: string) => {
        setWishlist((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearWishlist = () => {
        setWishlist([]);
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some((item) => item.id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
