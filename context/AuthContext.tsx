"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
    onAuthStateChanged,
    User,
    signInAnonymously,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInAnon: () => Promise<void>;
    signInGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInAnon: async () => { },
    signInGoogle: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const syncUserWithMongo = async (currentUser: User) => {
            try {
                await fetch("/api/auth/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                    }),
                });
            } catch (err) {
                console.error("Failed to sync user with MongoDB:", err);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                syncUserWithMongo(currentUser);
            }

            if (!currentUser && typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
                router.push("/auth");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const signInAnon = async () => {
        if (!auth) throw new Error("Firebase auth is not initialized");
        try {
            await signInAnonymously(auth);
            router.push("/dashboard");
        } catch (error) {
            console.error("Anon Login Error:", error);
            throw error;
        }
    };

    const signInGoogle = async () => {
        if (!auth) throw new Error("Firebase auth is not initialized");
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push("/dashboard");
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await auth.signOut();
            router.push("/auth");
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInAnon, signInGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
