import type { SupabaseClient } from "@supabase/supabase-js";

export const getFlashcardDecks = async (client: SupabaseClient<any, "public", "public", any, any>) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard_decks`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get flashcard decks");
    }

    return response.json();
}

export const getFlashcardScoresBySessionId = async (client: SupabaseClient<any, "public", "public", any, any>, sessionId: string) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard_decks/sessions/${sessionId}/scores`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get flashcard scores");
    }

    return response.json();
}

export const getFlashcardsByDeckId = async (client: SupabaseClient<any, "public", "public", any, any>, deckId: string) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard_decks/${deckId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get flashcards");
    }

    return response.json();
}

export const createFlashcardDeckSession = async (client: SupabaseClient<any, "public", "public", any, any>, deckId: string, sessionId: string) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard_decks/${deckId}/sessions/${sessionId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to create flashcard deck session");
    }

    return response.json();
}

export const createFlashcardScore = async (client: SupabaseClient<any, "public", "public", any, any>, flashcardScore: {cardId: string, score: number, sessionId: string}) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard_scores`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ card_id: flashcardScore.cardId, score: flashcardScore.score, session_id: flashcardScore.sessionId }),
    });

    if (!response.ok) {
        throw new Error("Failed to create flashcard score");
    }

    return response.json();
}
