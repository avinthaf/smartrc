

import { useOutletContext, Link } from "react-router";
import { useEffect, useState } from "react";
import { getFlashcardDecks } from "../lib/flashcards";
import { getFillInBlankDecks } from "../lib/fill_in_blanks";
import { getFlashcardDeckSessionsByUserId } from "../lib/flashcards";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import ActivityCarousel from "../components/ActivityCarousel";

type Category = {
    id: string;
    name: string;
    description: string;
    parent_id: string;
    image_url: string;
    created_at: string;
    updated_at: string;
};

type FlashcardDeck = {
    id: string;
    title: string;
    description: string;
    publish_status: string;
    created_at: string;
    updated_at: string;
    categories?: Category[];
};

type FillInBlankDeck = {
    id: string;
    title: string;
    description: string;
    publish_status: string;
    created_at: string;
    updated_at: string;
    categories?: Category[];
};

type FlashcardDeckSession = {
    id: string;
    deck_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
};

type SessionWithDeck = FlashcardDeckSession & {
    deck: FlashcardDeck;
};

const Home = () => {
    const { supabase } = useOutletContext<any>();
    const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
    const [fillInBlankDecks, setFillInBlankDecks] = useState<FillInBlankDeck[]>([]);
    const [sessions, setSessions] = useState<SessionWithDeck[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load flashcards and fill-in-blanks independently
                const [flashcardsData, fillInBlanksData] = await Promise.all([
                    getFlashcardDecks(supabase),
                    getFillInBlankDecks(supabase)
                ]);

                setFlashcardDecks(flashcardsData);
                setFillInBlankDecks(fillInBlanksData);

                // Load sessions independently (failure won't affect other data)
                try {
                    const [sessionsData, decksData] = await Promise.all([
                        getFlashcardDeckSessionsByUserId(supabase),
                        getFlashcardDecks(supabase)
                    ]);

                    // Create a map of deck_id to deck info for sessions
                    const deckMap = (decksData || []).reduce((acc: Record<string, FlashcardDeck>, deck: FlashcardDeck) => {
                        acc[deck.id] = deck;
                        return acc;
                    }, {} as Record<string, FlashcardDeck>);

                    // Combine sessions with deck info and sort by most recent
                    const sessionsWithDecks = (sessionsData || [])
                        .map((session: FlashcardDeckSession) => ({
                            ...session,
                            deck: deckMap[session.deck_id]
                        }))
                        .filter((session: SessionWithDeck) => session.deck) // Only include sessions with valid decks
                        .sort((a: SessionWithDeck, b: SessionWithDeck) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                    setSessions(sessionsWithDecks);
                } catch (sessionError) {
                    console.error('Error loading sessions:', sessionError);
                    // Set empty sessions array so UI still works
                    setSessions([]);
                }
            } catch (error) {
                console.error('Error loading main data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [supabase]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12">

            {/* Recent Activity Section */}
            {sessions.length > 0 && (
                <ActivityCarousel sessions={sessions.slice(0, 5)} />
            )}

            {/* Flashcards Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <Heading as="h2" variant="lg" className="text-gray-800">Flashcards</Heading>
                    <Link to="/flashcards">
                        <Button variant="outline" size="sm">
                            View All
                        </Button>
                    </Link>
                </div>

                {flashcardDecks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No flashcard decks available</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first flashcard deck</p>
                        <div className="mt-6">
                            <Link to="/flashcards/make">
                                <Button>Create Flashcards</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {flashcardDecks.slice(0, 6).map((deck) => (
                            <Link key={deck.id} to={`/flashcards/${deck.id}/session/${uuidv4()}`}>
                                <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
                                    <div className="p-5 h-full flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-gray-900 font-medium text-lg leading-tight">{deck.title}</h3>
                                                {deck.description && (
                                                    <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-2">
                                                        {deck.description}
                                                    </p>
                                                )}
                                                {deck.categories && deck.categories.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-1">
                                                        {deck.categories.map((category) => (
                                                            <span
                                                                key={category.id}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                            >
                                                                {category.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 flex justify-between items-center">
                                            <Button variant="link" className="p-0 h-auto text-sm font-medium">
                                                Study now
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {flashcardDecks.length > 6 && (
                    <div className="mt-6 text-center">
                        <Link to="/flashcards">
                            <Button variant="outline">
                                View All {flashcardDecks.length} Flashcard Decks
                            </Button>
                        </Link>
                    </div>
                )}
            </section>

            {/* Fill In The Blanks Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <Heading as="h2" variant="lg" className="text-gray-800">Fill In The Blanks</Heading>
                    <Link to="/fill-in-the-blanks">
                        <Button variant="outline" size="sm">
                            View All
                        </Button>
                    </Link>
                </div>

                {fillInBlankDecks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No fill in the blanks decks available</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first fill in the blanks deck</p>
                        <div className="mt-6">
                            <Link to="/fill-in-the-blanks/make">
                                <Button>Create Fill In The Blanks</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fillInBlankDecks.slice(0, 6).map((deck) => (
                            <Link key={deck.id} to={`/fill-in-the-blanks/${deck.id}/session/${uuidv4()}`}>
                                <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
                                    <div className="p-5 h-full flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-gray-900 font-medium text-lg leading-tight">{deck.title}</h3>
                                                {deck.description && (
                                                    <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-2">
                                                        {deck.description}
                                                    </p>
                                                )}
                                                {deck.categories && deck.categories.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-1">
                                                        {deck.categories.map((category) => (
                                                            <span
                                                                key={category.id}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                            >
                                                                {category.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 flex justify-between items-center">
                                            <Button variant="link" className="p-0 h-auto text-sm font-medium">
                                                Study now
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {fillInBlankDecks.length > 6 && (
                    <div className="mt-6 text-center">
                        <Link to="/fill-in-the-blanks">
                            <Button variant="outline">
                                View All {fillInBlankDecks.length} Fill In The Blanks Decks
                            </Button>
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;