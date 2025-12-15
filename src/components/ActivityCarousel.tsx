import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Button } from './Button';

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

interface ActivityCarouselProps {
    sessions: SessionWithDeck[];
}

const ActivityCarousel = ({ sessions }: ActivityCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

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

    // Responsive configuration
    const getSlidesConfig = () => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width >= 1024) return { slidesPerView: 3, slideWidth: 'w-1/3' }; // Desktop
            if (width >= 768) return { slidesPerView: 2, slideWidth: 'w-1/2' }; // Tablet
            return { slidesPerView: 2, slideWidth: 'w-1/2' }; // Mobile (changed from 1.5 to 2)
        }
        return { slidesPerView: 3, slideWidth: 'w-1/3' }; // Default to desktop
    };

    const [slidesConfig, setSlidesConfig] = useState(getSlidesConfig());
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Update slides config on window resize
    useEffect(() => {
        const handleResize = () => {
            setSlidesConfig(getSlidesConfig());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Drag functionality
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX);
        setCurrentX(e.clientX);
        setIsAnimating(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setCurrentX(e.clientX);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        
        const diff = startX - currentX;
        const threshold = 50; // Minimum drag distance to trigger slide change
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        
        setIsDragging(false);
        setIsAnimating(true);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setStartX(touch.clientX);
        setCurrentX(touch.clientX);
        setIsAnimating(false);
        e.preventDefault(); // Prevent default touch behavior
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent page scroll/overscroll
        const touch = e.touches[0];
        setCurrentX(touch.clientX);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        
        const diff = startX - currentX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        
        setIsDragging(false);
        setIsAnimating(true);
    };

    // Calculate drag transform
    const getDragTransform = () => {
        if (!isDragging) return 0;
        const diff = currentX - startX;
        const maxDrag = 100; // Maximum drag distance
        return Math.max(-maxDrag, Math.min(maxDrag, diff));
    };

    if (sessions.length === 0) {
        return null;
    }

    const visibleSessions = sessions.slice(0, 5); // Show max 5 recent sessions
    const allSlides = [...visibleSessions, { isMoreCard: true } as any]; // Add "More" card
    const maxIndex = Math.max(0, Math.floor(allSlides.length - slidesConfig.slidesPerView));

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => {
            return prevIndex >= maxIndex ? maxIndex : prevIndex + 1;
        });
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            return prevIndex === 0 ? 0 : prevIndex - 1;
        });
    };

    const isAtEnd = currentIndex >= maxIndex;
    const isAtStart = currentIndex === 0;

    const getTransformPercentage = () => {
        const baseTransform = (currentIndex * 100) / slidesConfig.slidesPerView;
        const dragOffset = isDragging ? (getDragTransform() / window.innerWidth) * 100 : 0;
        return baseTransform - dragOffset;
    };

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
                <div className="flex items-center space-x-3">
                    {allSlides.length > slidesConfig.slidesPerView && (
                        <>
                            <button
                                onClick={prevSlide}
                                disabled={isAtStart}
                                className={`w-6 h-6 bg-white rounded-full p-1 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                                    isAtStart 
                                        ? 'cursor-not-allowed opacity-50' 
                                        : 'hover:bg-gray-50 cursor-pointer'
                                }`}
                                aria-label="Previous session"
                            >
                                <svg className={`w-4 h-4 ${isAtStart ? 'text-gray-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                onClick={nextSlide}
                                disabled={isAtEnd}
                                className={`w-6 h-6 bg-white rounded-full p-1 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                                    isAtEnd 
                                        ? 'cursor-not-allowed opacity-50' 
                                        : 'hover:bg-gray-50 cursor-pointer'
                                }`}
                                aria-label="Next session"
                            >
                                <svg className={`w-4 h-4 ${isAtEnd ? 'text-gray-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                    <Link to="/my-activity">
                        <Button variant="outline" size="sm">
                            View All
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="relative">
                {/* Carousel Container */}
                <div className="overflow-hidden rounded-lg">
                    <div 
                        ref={carouselRef}
                        className={`flex ${isAnimating ? 'transition-transform duration-300 ease-in-out' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} touch-none`}
                        style={{ transform: `translateX(-${getTransformPercentage()}%)` }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {allSlides.map((session) => (
                            <div 
                                key={session.isMoreCard ? 'more-card' : session.id} 
                                className={`${slidesConfig.slideWidth} flex-shrink-0 px-2`}
                            >
                                {session.isMoreCard ? (
                                    // More Activity Card
                                    <Link to="/my-activity">
                                        <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
                                            <div className="flex flex-col items-center justify-center h-full text-center min-h-[200px]">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">More Activity</h3>
                                                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">View all your recent sessions</p>
                                                <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
                                                    <span>View All</span>
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    // Regular Session Card
                                    <Link to={`/flashcards/${session.deck_id}/session/${session.id}`}>
                                        <div className="h-full bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
                                            <div className="flex flex-col h-full">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2 break-words">
                                                        {session.deck.title}
                                                    </h3>
                                                    
                                                    {/* {session.deck.description && (
                                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words">
                                                            {session.deck.description}
                                                        </p>
                                                    )} */}
                                                    
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="break-words">{getRelativeTime(session.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
                                                    <span>Review Session</span>
                                                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ActivityCarousel;
