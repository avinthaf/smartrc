import type { SupabaseClient } from "@supabase/supabase-js";

export interface FillInBlank {
    id: string;
    prompt: string;
    answers: string[];
    explanation?: string;
}

export interface FillInBlankDeck {
    id: string;
    title: string;
    description: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface CreateFillInBlankDeckRequest {
    title: string;
    description: string;
    user_id: string;
    publish_status: string;
    fill_in_blanks?: FillInBlank[];
    category_ids?: string[];
}

export const getFillInBlankDecks = async (client: SupabaseClient<any, "public", "public", any, any>) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/fill_in_blank_decks`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get fill in blank decks");
    }

    return response.json();
}

export const getFillInBlankScoresBySessionId = async (client: SupabaseClient<any, "public", "public", any, any>, sessionId: string) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/fill_in_blank_decks/sessions/${sessionId}/scores`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get fill in blank scores");
    }

    return response.json();
}

export const getFillInBlanksByDeckId = async (client: SupabaseClient<any, "public", "public", any, any>, deckId: string) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/fill_in_blank_decks/${deckId}/fill_in_blanks`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get fill in blanks");
    }

    return response.json();
}

export const getFillInBlankDeckSessionsByUserId = async (client: SupabaseClient<any, "public", "public", any, any>) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/fill_in_blank_decks/sessions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get fill in blank deck sessions");
    }

    return response.json();
}


export const createFillInBlankDeckSession = async (client: SupabaseClient<any, "public", "public", any, any>, deckId: string, sessionId: string) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/fill_in_blank_decks/sessions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ deck_id: deckId, session_id: sessionId }),
    });

    if (!response.ok) {
        throw new Error("Failed to create fill in blank deck session");
    }

    return response.json();
}

export const createFillInBlankScore = async (client: SupabaseClient<any, "public", "public", any, any>, fillInBlankScore: {fillInBlankId: string, score: number, sessionId: string}) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/fill_in_blank_decks/sessions/${fillInBlankScore.sessionId}/scores`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ fill_in_blank_id: fillInBlankScore.fillInBlankId, score: fillInBlankScore.score, session_id: fillInBlankScore.sessionId }),
    });

    if (!response.ok) {
        throw new Error("Failed to create fill in blank score");
    }

    return response.json();
}

// Generate fill-in-the-blanks exercises with AI
export const createFillInBlanksWithAI = async (client: SupabaseClient<any, "public", "public", any, any>, prompt: string) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/gen_ai/prompt/fill_in_blanks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ prompt: prompt }),
    });

    if (!response.ok) {
        throw new Error("Failed to generate fill-in-the-blanks with AI");
    }

    return response.json();
}

// Create a new fill-in-the-blanks deck
export const createFillInBlankDeck = async (client: SupabaseClient<any, "public", "public", any, any>, deckData: CreateFillInBlankDeckRequest) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/fill_in_blank_decks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(deckData),
    });

    if (!response.ok) {
        throw new Error("Failed to create fill-in-the-blanks deck");
    }

    return response.json();
}
