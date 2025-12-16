import { useEffect, useState } from "react";
import { createSupabaseClient } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Outlet, useNavigate } from "react-router";
import { getCurrentUser } from "../lib/auth";

const supabase = createSupabaseClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_API_KEY);

const unauthenticatedRoutes = ['/login', '/signup', '/reset-password', '/set-new-password'];

const AuthProvider = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getCurrentUser(supabase).then((user) => {
            setUser(user);
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                setLoading(false);
                // Redirect to home page after successful login
                if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
                    navigate('/');
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setLoading(false);
                // Redirect to login page after logout
                if (!unauthenticatedRoutes.includes(window.location.pathname)) {
                    navigate('/login');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (!user && !loading && !unauthenticatedRoutes.includes(window.location.pathname)) {
            navigate('/login');
        }
    }, [user, loading, navigate])

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Outlet context={{ user, setUser, supabase }} />
        </>
    );
};

export default AuthProvider;