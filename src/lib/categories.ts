import type { SupabaseClient } from "@supabase/supabase-js";

export const getPrimaryCategories = async (client: SupabaseClient<any, "public", "public", any, any>) => {
    
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/categories/primary`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get primary categories");
    }

    return response.json();
}   