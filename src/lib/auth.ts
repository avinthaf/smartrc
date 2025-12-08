import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

export type SignUpResult = {
    user: User | null;
    session: Session | null;
}

export const getCurrentUser = async (client: SupabaseClient<any, "public", "public", any, any>) => {
    const { data: { user } } = await client.auth.getUser();
    return user;
}

export const signIn = async (client: SupabaseClient<any, "public", "public", any, any>, email: string, password: string, onSuccess: (data: SignUpResult) => void, onError: (error: Error) => void) => {
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
        onError(error);
        return;
    }
    onSuccess(data);
}

export const signOut = async (client: SupabaseClient<any, "public", "public", any, any>, onSuccess: () => void, onError: (error: Error) => void) => {
    const { error } = await client.auth.signOut();
    
    if (error) {
        onError(error);
        return;
    }
    onSuccess();
}

export const signUp = async (client: SupabaseClient<any, "public", "public", any, any>, email: string, password: string, onSuccess: (data: SignUpResult) => void, onError: (error: Error) => void) => {
    const { data, error } = await client.auth.signUp({ email, password });

    if (error) {
        onError(error);
        return;
    }
    onSuccess(data);
}
