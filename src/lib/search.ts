import type { SupabaseClient } from "@supabase/supabase-js";

export const searchProductsByTags = async (client: SupabaseClient<any, "public", "public", any, any>, query: string) => {
    const { data: tags, error: tagsError } = await client.from('tags').select('*').ilike('name', `%${query}%`);

    if (tagsError) {
        console.error('Error searching tags:', tagsError);
        return { data: [], error: tagsError };
    }

    // get product ids by tag ids
    const { data: productIdsByTagIds, error: productIdsByTagIdsError } = await getProductIdsByTagIds(client, tags.map((tag) => tag.id));

    if (productIdsByTagIdsError) {
        console.error('Error getting product ids:', productIdsByTagIdsError);
        return { data: [], error: productIdsByTagIdsError };
    }

    // get products by product ids
    const { data: products, error: productsError } = await getProductsByProductIds(client, productIdsByTagIds.map((product) => product.product_id));

    if (productsError) {
        console.error('Error getting products:', productsError);
        return { data: [], error: productsError };
    }

    console.log('Products found:', products || []);

    return { data: products || [], error: productsError };
}

export const getProductIdsByTagIds = async (client: SupabaseClient<any, "public", "public", any, any>, tagIds: string[]) => {
    const { data: productIdsByTagIds, error: productIdsByTagIdsError } = await client.from('products_tags').select('product_id').in('tag_id', tagIds);

    if (productIdsByTagIdsError) {
        console.error('Error getting product ids:', productIdsByTagIdsError);
        return { data: [], error: productIdsByTagIdsError };
    }


    return { data: productIdsByTagIds || [], error: productIdsByTagIdsError };
}

export const getProductsByProductIds = async (client: SupabaseClient<any, "public", "public", any, any>, productIds: string[]) => {
    const { data: products, error: productsError } = await client.from('flashcard_decks').select('*').in('id', productIds);

    if (productsError) {
        console.error('Error getting products:', productsError);
        return { data: [], error: productsError };
    }

    return { data: products || [], error: productsError };
}