import { useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import { useNavigate, useOutletContext } from "react-router";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { Heading } from '../components/Heading';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import { createFlashCardsWithAI, createFlashcardDeck } from '../lib/flashcards';
import { v4 as uuidv4 } from 'uuid';

// Bottom Sheet Component
const BottomSheet = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  // Animation variants
  const overlayVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.1 }
    }
  };

  const sheetVariants = {
    hidden: (_mobile: boolean) => ({
      y: _mobile ? '100%' : '0',
      x: _mobile ? '0' : '100%',
      opacity: 0
    }),
    visible: (_mobile: boolean) => ({
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 30,
        stiffness: 400
      }
    }),
    exit: (_mobile: boolean) => ({
      y: _mobile ? '100%' : '0',
      x: _mobile ? '0' : '100%',
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
            className={`fixed ${window.innerWidth < 768 ? 'bottom-0 left-0 right-0 rounded-t-2xl' : 'top-0 right-0 h-full w-1/3 min-w-[400px]'} bg-white border border-gray-200`}
            onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            custom={window.innerWidth < 768}
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
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty flashcards and remove IDs for auto-generation
    const validFlashcards = cards
      .filter(card => card.term.trim() && card.definition.trim())
      .map(({ term, definition }) => ({ term, definition }));
    
    if (!title.trim()) {
      alert('Please enter a title for the flashcard deck');
      return;
    }
    
    if (validFlashcards.length === 0) {
      alert('Please add at least one flashcard with term and definition');
      return;
    }

    try {
      const deckData = {
        title: title.trim(),
        description: description.trim(),
        categoryIds: categoryIds,
        flashcards: validFlashcards
      };
      
      const result = await createFlashcardDeck(supabase, deckData);
      
      
      // Reset form or redirect as needed
      navigate(`/flashcards/${result.id}/session/${uuidv4()}`)
      
    } catch (error) {
      console.error('Error creating flashcard deck:', error);
      alert('Failed to create flashcard deck. Please try again.');
    }
  };

  const handleGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);

    try {
      const response = await createFlashCardsWithAI(supabase, aiPrompt);
      console.log('Raw AI API Response:', response);
      
      // Parse the JSON response to get flashcard data
      let flashcardsData;
      let aiTitle = '';
      let aiDescription = '';
      let aiCategories = '';
      try {
        console.log('Raw response type:', typeof response);
        console.log('Raw response value:', response);
        
        // The response from createFlashCardsWithAI might be a string or object
        let parsedResponse;
        try {
          if (typeof response === 'object' && response !== null) {
            // Response is already parsed as an object
            parsedResponse = response;
          } else if (typeof response === 'string') {
            // Response is a string that needs parsing
            // First, try to parse it directly
            try {
              parsedResponse = JSON.parse(response);
            } catch (firstParseError) {
              console.log('Direct parse failed, cleaning string...');
              // If direct parse fails, clean the string and try again
              let cleanedResponse = response
                .replace(/\\"/g, '"')  // Fix escaped quotes
                .replace(/"\s+}/g, '"}')  // Fix spaces before closing brackets
                .replace(/"\s+\]/g, '"]')  // Fix spaces before closing array brackets
                .trim();
              
              console.log('Cleaned response:', cleanedResponse);
              parsedResponse = JSON.parse(cleanedResponse);
            }
          } else {
            throw new Error('Unexpected response type: ' + typeof response);
          }
        } catch (parseError) {
          console.error('Failed to parse main response:', parseError);
          console.error('Response that failed to parse:', response);
          throw new Error('Invalid JSON response from API');
        }
        
        console.log('Parsed AI Response:', parsedResponse);
        
        // Check if result is a string or already parsed array
        flashcardsData = parsedResponse.result;
        if (typeof flashcardsData === 'string') {
          console.log('Result is string, parsing...');
          // Handle the escaped JSON string properly
          try {
            // First, try to parse as-is
            flashcardsData = JSON.parse(flashcardsData);
          } catch (firstError) {
            console.log('First parse failed, cleaning and retrying...');
            // If that fails, clean up the string and try again
            let cleanedResult = flashcardsData
              .replace(/\\"/g, '"')  // Fix escaped quotes
              .replace(/"\s+}/g, '"}')  // Fix spaces before closing brackets
              .replace(/"\s+\]/g, '"]')  // Fix spaces before closing array brackets
              .trim();
            
            flashcardsData = JSON.parse(cleanedResult);
          }
        } else if (Array.isArray(flashcardsData)) {
          console.log('Result is already an array');
        } else {
          console.log('Result is already parsed:', typeof flashcardsData);
        }

        // Extract title, description, and categories from the AI response
        aiTitle = parsedResponse.title || '';
        aiDescription = parsedResponse.description || '';
        
        // Handle new categories format: array of objects with id and name
        if (parsedResponse.categories && parsedResponse.categories.length > 0) {
          const categoryNames = parsedResponse.categories.map((cat: any) => cat.name).filter(Boolean);
          const categoryIds = parsedResponse.categories.map((cat: any) => cat.id).filter(Boolean);
          
          // Validate that category IDs are valid UUIDs
          const validCategoryIds = categoryIds.filter((id: string) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(id);
          });
          
          aiCategories = categoryNames.join(', ');
          setCategoryIds(validCategoryIds);
        } else {
          aiCategories = '';
          setCategoryIds([]);
        }
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

        // Always set title, description, and category from AI (override previous values)
        if (aiTitle) {
          setTitle(aiTitle);
        }
        if (aiDescription) {
          setDescription(aiDescription);
        }
        if (aiCategories) {
          setCategory(aiCategories);
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
    <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className=" mb-8">
          <Heading as="h1" variant="sm">Create a new flashcard deck</Heading>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex-col">
            <Input
              id="title"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="mb-2"
            />
            <TextArea
              id="description"
              rows={3}
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Description"
              className="mb-2"
            />
            <Input
              id="category"
              value={category}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
              placeholder="Category (e.g., Biology, Mathematics, History)"
            />

          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div></div>
              {/* <h2 className="text-lg font-medium text-gray-900">Flashcards</h2> */}
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
                    className={`bg-white rounded-lg border border-gray-200 p-4 ${index === activeCardIndex ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setActiveCardIndex(index)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-bold text-gray-700">{index + 1}</h3>
                      {cards.length > 1 && (
                        <button
                          type="button"
                          onClick={(e: MouseEvent<HTMLButtonElement>) => {
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
                        <Input
                          id={`term-${index}`}
                          value={card.term}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardChange(index, 'term', e.target.value)}
                          placeholder="Term"
                        />
                      </div>

                      <div>
                        <TextArea
                          id={`definition-${index}`}
                          rows={3}
                          value={card.definition}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleCardChange(index, 'definition', e.target.value)}
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
              <TextArea
                id="ai-prompt"
                // label="Describe what you want to learn"
                rows={4}
                value={aiPrompt}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAiPrompt(e.target.value)}
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