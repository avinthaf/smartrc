import { useState } from 'react';
import { Heading } from '../components/Heading';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { TopNavigation } from '../components/TopNavigation';
import { useNavigate, useOutletContext } from 'react-router';
import { signOut } from '../lib/auth';
import { searchProductsByTags } from '../lib/search';

type FlashcardPack = {
    id: string;
    title: string;
    description: string;
    cardsCount: number;
    subject: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
};

type Section = {
    id: string;
    title: string;
    packs: FlashcardPack[];
};

const Home = () => {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { supabase } = useOutletContext<any>();

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

    // Hardcoded sections with flashcard packs
    const sections: Section[] = [
        {
            id: 'recommended',
            title: 'Recommended for You',
            packs: [
                {
                    id: 'mcat-bio-1',
                    title: 'MCAT Biology: Cell Structure',
                    description: 'Master the fundamentals of cell biology for the MCAT',
                    cardsCount: 35,
                    subject: 'Biology',
                    difficulty: 'Intermediate'
                },
                {
                    id: 'gen-chem-1',
                    title: 'General Chemistry Basics',
                    description: 'Essential chemistry concepts for beginners',
                    cardsCount: 35,
                    subject: 'Chemistry',
                    difficulty: 'Beginner'
                },
                {
                    id: 'physics-mechanics',
                    title: 'Physics: Mechanics',
                    description: 'Kinematics, forces, and energy principles',
                    cardsCount: 28,
                    subject: 'Physics',
                    difficulty: 'Intermediate'
                }
            ]
        },
        {
            id: 'top-mcat',
            title: 'Top MCAT Study Packs',
            packs: [
                {
                    id: 'mcat-chem-1',
                    title: 'MCAT Organic Chemistry',
                    description: 'Key reactions and mechanisms',
                    cardsCount: 57,
                    subject: 'Chemistry',
                    difficulty: 'Advanced'
                },
                {
                    id: 'mcat-psych',
                    title: 'MCAT Psychology',
                    description: 'Theories and key concepts in psychology',
                    cardsCount: 63,
                    subject: 'Psychology',
                    difficulty: 'Intermediate'
                },
                {
                    id: 'mcat-biochem',
                    title: 'MCAT Biochemistry',
                    description: 'Metabolic pathways and molecular biology',
                    cardsCount: 48,
                    subject: 'Biochemistry',
                    difficulty: 'Advanced'
                }
            ]
        },
        {
            id: 'popular',
            title: 'Popular Study Packs',
            packs: [
                {
                    id: 'anatomy-1',
                    title: 'Human Anatomy Basics',
                    description: 'Major body systems and structures',
                    cardsCount: 75,
                    subject: 'Anatomy',
                    difficulty: 'Beginner'
                },
                {
                    id: 'microbio-1',
                    title: 'Microbiology',
                    description: 'Bacteria, viruses, and microorganisms',
                    cardsCount: 52,
                    subject: 'Microbiology',
                    difficulty: 'Intermediate'
                },
                {
                    id: 'physio-1',
                    title: 'Human Physiology',
                    description: 'How the body works',
                    cardsCount: 45,
                    subject: 'Physiology',
                    difficulty: 'Intermediate'
                }
            ]
        }
    ];

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
                            Flashcards
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                            Game Rooms
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                            Dashboard
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                            My Decks
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                            Study Now
                        </button>
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
                        {sections.map((section) => (
                            <section key={section.id} className="mb-12">
                                <div className="flex items-center justify-between mb-4">
                                    <Heading as="h2" variant="md">{section.title}</Heading>
                                    <button className="text-sm text-blue-600 hover:text-blue-800">
                                        See all
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {section.packs.map((pack) => (
                                        <div
                                            key={pack.id}
                                            className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                                        >
                                            <div className="p-5 h-full flex flex-col">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-gray-900 font-medium text-lg leading-tight truncate">{pack.title}</h3>
                                                        <Text className="mt-1 text-gray-500">{pack.subject} • {pack.difficulty}</Text>
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {pack.cardsCount} cards
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-2">{pack.description}</p>
                                                <div className="mt-auto pt-4 flex justify-between items-center">
                                                    <Button variant="link" className="p-0 h-auto text-sm font-medium">
                                                        Study now
                                                    </Button>
                                                    <div className="flex space-x-2">
                                                        <button className="p-1 text-gray-400 hover:text-gray-500">
                                                            <span className="sr-only">Save</span>
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;