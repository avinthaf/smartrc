
import type { SupabaseClient } from "@supabase/supabase-js";

export const updateUser = async ( client: SupabaseClient<any, "public", "public", any, any>, firstName: string, lastName: string) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            firstName,
            lastName,
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to update user');
    }
    return response.json();
};