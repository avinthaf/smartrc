import type { SupabaseClient } from "@supabase/supabase-js";

export const createProductRating = async (supabase: SupabaseClient<any, "public", "public", any, any>, productId: string, rating: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token

    console.log('Sending product rating request:', { productId, rating });

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/products/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                productId,
                rating,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create product rating');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating product rating:', error);
        throw error;
    }
};