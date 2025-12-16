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
    }, []);

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