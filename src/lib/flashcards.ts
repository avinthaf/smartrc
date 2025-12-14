import type { SupabaseClient } from "@supabase/supabase-js";

export const getFlashcardDecks = async (client: SupabaseClient<any, "public", "public", any, any>) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard-decks`, {
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

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard-decks/sessions/${sessionId}/scores`, {
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

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard-decks/${deckId}/flashcards`, {
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

export const getFlashcardDeckSessionsByUserId = async (client: SupabaseClient<any, "public", "public", any, any>) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard-decks/sessions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get flashcard deck sessions");
    }

    return response.json();
}


export const createFlashcardDeckSession = async (client: SupabaseClient<any, "public", "public", any, any>, deckId: string, sessionId: string) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard-decks/sessions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ deck_id: deckId, session_id: sessionId }),
    });

    if (!response.ok) {
        throw new Error("Failed to create flashcard deck session");
    }

    return response.json();
}

export const createFlashcardScore = async (client: SupabaseClient<any, "public", "public", any, any>, flashcardScore: { cardId: string, score: number, sessionId: string }) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard-decks/sessions/${flashcardScore.sessionId}/scores`, {
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

export const createFlashCardsWithAI = async (client: SupabaseClient<any, "public", "public", any, any>, prompt: string) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/gen_ai/prompt/flashcards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                prompt
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Error creating flashcards with AI:', error);
        throw error;
    }
}

export const createFlashcardDeck = async (client: SupabaseClient<any, "public", "public", any, any>, deckData: { title: string, description: string, categoryIds: string[], flashcards: any[] }) => {
    const { data: { session } } = await client.auth.getSession();
    const accessToken = session?.access_token

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flashcard-decks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(deckData),
    });

    if (!response.ok) {
        throw new Error("Failed to create flashcard deck");
    }

    return response.json();
}