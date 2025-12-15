import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router";
import { getFlashcardDeckSessionsByUserId } from "../lib/flashcards";
import { getFlashcardDecks } from "../lib/flashcards";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";

type FlashcardDeckSession = {
    id: string;
    deck_id: string;
    user_id: string;
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
};

type SessionWithDeck = FlashcardDeckSession & {
    deck: FlashcardDeck;
};

const MyActivity = () => {
    const { supabase } = useOutletContext<any>();
    const [sessions, setSessions] = useState<SessionWithDeck[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadActivity = async () => {
            try {
                // Fetch both sessions and decks
                const [sessionsData, decksData] = await Promise.all([
                    getFlashcardDeckSessionsByUserId(supabase),
                    getFlashcardDecks(supabase)
                ]);

                // Create a map of deck_id to deck info
                const deckMap = decksData.reduce((acc: Record<string, FlashcardDeck>, deck: FlashcardDeck) => {
                    acc[deck.id] = deck;
                    return acc;
                }, {} as Record<string, FlashcardDeck>);

                // Combine sessions with deck info
                const sessionsWithDecks = sessionsData
                    .map((session: FlashcardDeckSession) => ({
                        ...session,
                        deck: deckMap[session.deck_id]
                    }))
                    .filter((session: SessionWithDeck) => session.deck) // Only include sessions with valid decks
                    .sort((a: SessionWithDeck, b: SessionWithDeck) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setSessions(sessionsWithDecks);
            } catch (error) {
                console.error('Error loading activity:', error);
            } finally {
                setLoading(false);
            }
        };

        loadActivity();
    }, [supabase]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    };

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
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <Heading as="h1" variant="xl" className="text-gray-800">My Activity</Heading>
                <p className="mt-2 text-gray-600">Your recent flashcard practice sessions</p>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No activity yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start practicing flashcards to see your activity here</p>
                    <div className="mt-6">
                        <Link to="/flashcards">
                            <Button>Browse Flashcards</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {session.deck.title}
                                        </h3>
                                    </div>
                                    
                                    {session.deck.description && (
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {session.deck.description}
                                        </p>
                                    )}
                                    
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{getRelativeTime(session.created_at)}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatDate(session.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="ml-4">
                                    <Link to={`/flashcards/${session.deck_id}/session/${session.id}`}>
                                        <Button variant="outline" size="sm">
                                            Review
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyActivity;