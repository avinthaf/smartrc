import { useState } from 'react';
import { Heading } from '../components/Heading';
import { TopNavigation } from '../components/TopNavigation';
import { Link, Outlet, useNavigate, useOutletContext } from 'react-router';
import { signOut } from '../lib/auth';
import { searchProductsByTags } from '../lib/search';

const MainLayout = () => {
    const navigate = useNavigate();
    const { supabase, user, setUser } = useOutletContext<any>();

    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                        <Link to="/flashcards">
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                                Flashcards
                            </button>
                        </Link>
                        <Link to="/fill-in-the-blanks">
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                                Fill in the Blanks
                            </button>
                        </Link>
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
                    <Outlet context={{ user, setUser, supabase }} />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;