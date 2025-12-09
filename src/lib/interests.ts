import type { SupabaseClient } from "@supabase/supabase-js";

export const getInterests = async (client: SupabaseClient<any, "public", "public", any, any>) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/interests`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get interests");
    }

    return response.json();
}

export const createInterests = async (client: SupabaseClient<any, "public", "public", any, any>, interests: { user_id: string, category_id: string }[]) => {
    
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/interests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(interests),
    });

    if (!response.ok) {
        throw new Error("Failed to create interests");
    }

    return response.json();
}