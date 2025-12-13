import { useState, useRef, useEffect } from 'react';
import { useOutletContext } from "react-router";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { Heading } from '../components/Heading';
import { Text } from '../components/Text';
import { CreateFlashCardsWithAI } from '../lib/flashcards';

// Bottom Sheet Component
const BottomSheet = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation variants
  const overlayVariants: any = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.1 }
    }
  };

  const sheetVariants = {
    hidden: (isMobile: boolean) => ({
      y: isMobile ? '100%' : '0',
      x: isMobile ? '0' : '100%',
      opacity: 0
    }),
    visible: (isMobile: boolean) => ({
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 30,
        stiffness: 400
      }
    }),
    exit: (isMobile: boolean) => ({
      y: isMobile ? '100%' : '0',
      x: isMobile ? '0' : '100%',
      opacity: 0,
      transition: {
        duration: 0.1
      }
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />
          <motion.div 
            className={`fixed ${isMobile ? 'bottom-0 left-0 right-0 rounded-t-2xl' : 'top-0 right-0 h-full w-1/3 min-w-[400px]'} bg-white shadow-xl`}
            onClick={(e) => e.stopPropagation()}
            custom={isMobile}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Generate Flashcards with AI</h3>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

const FlashcardsMaker = () => {
  const { supabase } = useOutletContext<any>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([
    { id: Date.now().toString(), term: '', definition: '' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const handleAddCard = () => {
    const newCard: Flashcard = {
      id: Date.now().toString(),
      term: '',
      definition: ''
    };
    setCards([...cards, newCard]);
    setActiveCardIndex(cards.length);
  };

  const handleRemoveCard = (index: number) => {
    if (cards.length <= 1) return; // Don't remove the last card
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
    if (activeCardIndex >= index) {
      setActiveCardIndex(Math.max(0, activeCardIndex - 1));
    }
  };

  const handleCardChange = (index: number, field: keyof Flashcard, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the flashcard set to your backend
    console.log({
      title,
      description,
      cards
    });
  };

  const handleGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await CreateFlashCardsWithAI(supabase, aiPrompt);
      // console.log('AI Response:', response);
      
      // Parse the JSON response to get flashcard data
      let flashcardsData;
      let aiTitle = '';
      let aiDescription = '';
      try {
        // The response is already parsed from the API call, so we need to extract the result field
        const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
        const flashcardsString = parsedResponse.result;
        
        if (!flashcardsString) {
          throw new Error('No result field found in AI response');
        }
        
        flashcardsData = JSON.parse(flashcardsString);
        
        // Extract title and description from the AI response
        aiTitle = parsedResponse.title || '';
        aiDescription = parsedResponse.description || '';
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Invalid response format from AI');
      }
      
      // Add the generated flashcards to the existing cards
      if (Array.isArray(flashcardsData) && flashcardsData.length > 0) {
        const newCards = flashcardsData.map((card: any) => ({
          id: card.id || Date.now().toString() + Math.random().toString(),
          term: card.term || '',
          definition: card.definition || ''
        }));
        
        // Always replace cards with AI-generated ones (override previous results)
        setCards(newCards);
        
        // Always set title and description from AI (override previous values)
        if (aiTitle) {
          setTitle(aiTitle);
        }
        if (aiDescription) {
          setDescription(aiDescription);
        }
      } else {
        // Empty result array indicates inappropriate content or invalid request
        console.warn('AI returned empty result - request may be inappropriate or invalid');
        throw new Error('Unable to generate flashcards for this request. Please try a different topic.');
      }
      
    } catch (error) {
      console.error('Error generating flashcards:', error);
      // Show error message to user
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An error occurred while generating flashcards. Please try again.');
      }
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
      setIsBottomSheetOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* <div className="text-center mb-8">
          <Heading as="h1" variant="md">New Flashcard Set</Heading>
          <Text className="mt-2 text-gray-600">
            Add a title, description, and create your flashcards below.
          </Text>
        </div> */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Enter set title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Add a description for your flashcard set"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Flashcards</h2>
              <Button
                type="button"
                onClick={() => setIsBottomSheetOpen(true)}
                variant="outline"
                size="sm"
              >
                Generate with AI
              </Button>
            </div>

            {cards.length > 0 && (
              <div className="space-y-4">
                {cards.map((card, index) => (
                  <div 
                    key={card.id} 
                    className={`bg-white rounded-lg shadow-sm border p-4 ${index === activeCardIndex ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setActiveCardIndex(index)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-medium text-gray-700">Card {index + 1}</h3>
                      {cards.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCard(index);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                        <input
                          type="text"
                          value={card.term}
                          onChange={(e) => handleCardChange(index, 'term', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                          placeholder="Enter term"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Definition</label>
                        <textarea
                          value={card.definition}
                          onChange={(e) => handleCardChange(index, 'definition', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                          rows={3}
                          placeholder="Enter definition"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-center mt-4">
              <Button
                type="button"
                onClick={handleAddCard}
                variant="outline"
                className="px-6"
              >
                + Add Card
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              Create Flashcard Set
            </Button>
          </div>
        </form>

        {/* AI Generation Bottom Sheet */}
        <BottomSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)}>
          <form onSubmit={handleGenerateCards} className="space-y-4">
            <div>
              <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-1">
                Describe what you want to learn
              </label>
              <textarea
                id="ai-prompt"
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g., Key concepts from World War II, Spanish vocabulary for beginners, etc."
                disabled={isGenerating}
              />
              <p className="mt-1 text-xs text-gray-500">
                The AI will generate flashcards based on your description
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full justify-center"
              disabled={!aiPrompt.trim() || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Flashcards'}
            </Button>
          </form>
        </BottomSheet>
      </div>
    </div>
  );
};

export default FlashcardsMaker;