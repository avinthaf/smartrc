import { useOutletContext, useNavigate, Link } from "react-router";
import { useEffect, useState } from "react";
import { getFlashcardDecks } from "../lib/flashcards";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "../components/Button";

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


const Flashcards = () => {
    const navigate = useNavigate();
    const { supabase } = useOutletContext<any>();
    const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);

    useEffect(() => {
        getFlashcardDecks(supabase).then((data) => {
            setFlashcardDecks(data);
        })
    }, [supabase])

    return (
        <div className="max-w-7xl mx-auto">
            <section className="mb-12">

                {flashcardDecks.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No flashcard decks</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {flashcardDecks.map((deck) => (
                            <div
                                key={deck.id}
                                className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                            >
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
                                        <Link to={`/flashcards/${deck.id}/session/${uuidv4()}`}>
                                            <Button variant="link" className="p-0 h-auto text-sm font-medium">
                                                Study now
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Flashcards;