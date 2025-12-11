import { useEffect, useState } from 'react';
import { Heading } from '../components/Heading';
import { Button } from '../components/Button';
import { TopNavigation } from '../components/TopNavigation';
import { Link, useNavigate, useOutletContext } from 'react-router';
import { signOut } from '../lib/auth';
import { searchProductsByTags } from '../lib/search';
import { getFlashcardDecks } from '../lib/flashcards';
import { v4 as uuidv4 } from 'uuid';

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

// type Section = {
//     id: string;
//     title: string;
//     decks: FlashcardDeck[];
// };

const Home = () => {
    const navigate = useNavigate();
    const { supabase } = useOutletContext<any>();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);

    const handleSearch = (query: string) => {
        console.log('Searching for:', query);
        searchProductsByTags(supabase, query);

    };

    const handleSignOut = async () => {
        try {
            await signOut(supabase, () => navigate('/login'), (error) => console.error('Error signing out:', error));
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    useEffect(() => {
        getFlashcardDecks(supabase).then((data) => {
            setFlashcardDecks(data);
        })
    }, [supabase])

    // const sections: Section[] = [
    //     {
    //         id: 'recommended',
    //         title: 'Recommended for You',
    //         decks: [
    //             {
    //                 id: 'mcat-bio-1',
    //                 title: 'MCAT Biology: Cell Structure',
    //                 description: 'Master the fundamentals of cell biology for the MCAT',
    //                 cardsCount: 35,
    //                 subject: 'Biology',
    //                 difficulty: 'Intermediate'
    //             },
    //             {
    //                 id: 'gen-chem-1',
    //                 title: 'General Chemistry Basics',
    //                 description: 'Essential chemistry concepts for beginners',
    //                 cardsCount: 35,
    //                 subject: 'Chemistry',
    //                 difficulty: 'Beginner'
    //             },
    //             {
    //                 id: 'physics-mechanics',
    //                 title: 'Physics: Mechanics',
    //                 description: 'Kinematics, forces, and energy principles',
    //                 cardsCount: 28,
    //                 subject: 'Physics',
    //                 difficulty: 'Intermediate'
    //             }
    //         ]
    //     },
    //     {
    //         id: 'top-mcat',
    //         title: 'Top MCAT Study Packs',
    //         packs: [
    //             {
    //                 id: 'mcat-chem-1',
    //                 title: 'MCAT Organic Chemistry',
    //                 description: 'Key reactions and mechanisms',
    //                 cardsCount: 57,
    //                 subject: 'Chemistry',
    //                 difficulty: 'Advanced'
    //             },
    //             {
    //                 id: 'mcat-psych',
    //                 title: 'MCAT Psychology',
    //                 description: 'Theories and key concepts in psychology',
    //                 cardsCount: 63,
    //                 subject: 'Psychology',
    //                 difficulty: 'Intermediate'
    //             },
    //             {
    //                 id: 'mcat-biochem',
    //                 title: 'MCAT Biochemistry',
    //                 description: 'Metabolic pathways and molecular biology',
    //                 cardsCount: 48,
    //                 subject: 'Biochemistry',
    //                 difficulty: 'Advanced'
    //             }
    //         ]
    //     },
    //     {
    //         id: 'popular',
    //         title: 'Popular Study Packs',
    //         packs: [
    //             {
    //                 id: 'anatomy-1',
    //                 title: 'Human Anatomy Basics',
    //                 description: 'Major body systems and structures',
    //                 cardsCount: 75,
    //                 subject: 'Anatomy',
    //                 difficulty: 'Beginner'
    //             },
    //             {
    //                 id: 'microbio-1',
    //                 title: 'Microbiology',
    //                 description: 'Bacteria, viruses, and microorganisms',
    //                 cardsCount: 52,
    //                 subject: 'Microbiology',
    //                 difficulty: 'Intermediate'
    //             },
    //             {
    //                 id: 'physio-1',
    //                 title: 'Human Physiology',
    //                 description: 'How the body works',
    //                 cardsCount: 45,
    //                 subject: 'Physiology',
    //                 difficulty: 'Intermediate'
    //             }
    //         ]
    //     }
    // ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-white border-r border-gray-200`}>
                <div className="p-4">
                    <Heading as="h2" variant="lg" className="text-gray-800">Smartr</Heading>
                    <div className="mt-8 space-y-1">
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                            Home
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                            My Activity
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavigation
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    onSearch={handleSearch}
                    onSignOut={handleSignOut}
                    userInitial="U"
                />
                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                </main>
            </div>
        </div>
    );
};

export default Home;