import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Heading } from './Heading';

interface TopNavigationProps {
  onToggleSidebar: () => void;
  onSearch?: (query: string) => void;
  userInitial?: string;
  onSignOut?: () => Promise<void>;
}

export const TopNavigation = ({
  onToggleSidebar,
  onSearch = () => { },
  userInitial = 'U',
  onSignOut = async () => { }
}: TopNavigationProps) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Clean up any pending timeouts when component unmounts
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Memoize the search handler to prevent unnecessary re-renders
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(query);
    }, 1000); // 1 second debounce
  }, [onSearch]);

  const handleSignOutClick = async () => {
    try {
      if (onSignOut) {
        await onSignOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 mr-4"
            onClick={onToggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Heading as="h2" variant="lg" className="text-gray-800">Smartr</Heading>
        </div>

        {/* <div className="flex-1 md:ml-6">
          <form className="max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search flashcard decks..."
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  handleSearch(query);
                }}
              />
            </div>
          </form>
        </div> */}

        {/* Avatar and Dropdown */}
        <div className="ml-4 relative" ref={dropdownRef}>
          <button
            type="button"
            className="bg-gray-200 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            id="user-menu"
            aria-expanded="false"
            aria-haspopup="true"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {userInitial}
            </div>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white focus:outline-none z-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                <button
                  onClick={handleSignOutClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
