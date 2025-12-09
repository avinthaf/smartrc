import { useState } from 'react';
import { Heading } from './Heading';
import { Button } from './Button';

type FlashCardVariant = 'default' | 'game';

type FlashCardProps = {
  card: {
    id: string;
    term: string;
    definition: string;
  };
  onAnswer?: (isCorrect: boolean) => void;
  showAnswerButtons?: boolean;
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  onFlip: () => void;
  getCardStatus?: (cardId: string) => 'right' | 'wrong' | null;
  variant?: FlashCardVariant;
};

export const FlashCard = ({
  card,
  onAnswer,
  showAnswerButtons = false,
  currentIndex,
  totalCards,
  isFlipped: externalIsFlipped,
  onFlip: externalOnFlip,
  getCardStatus = () => null,
  variant = 'default',
}: FlashCardProps) => {
  const [answer, setAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const isGameMode = variant === 'game';

  const handleFlip = () => {
    // In game mode, only allow flipping if not submitted or not already flipped
    if (isGameMode && (!hasSubmitted || isFlipped)) return;
    
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);
    externalOnFlip();
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!answer.trim()) return; // Don't allow empty submissions
    
    setHasSubmitted(true);
    // Auto-flip after submission in game mode
    if (isGameMode) {
      setIsFlipped(true);
      externalOnFlip();
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative w-full h-64 mb-8 perspective-1000 ${
          isGameMode && !hasSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={isGameMode && !hasSubmitted ? undefined : handleFlip}
      >
        <div 
          className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front of the card */}
          <div className={`absolute w-full h-full backface-hidden bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center ${
            isFlipped ? 'opacity-0' : 'opacity-100'
          }`}>
            <Heading as="h2" variant="lg" className="text-center mb-4">
              {card.term}
            </Heading>
            {isGameMode && (
              <div className="w-full max-w-xs mt-4 space-y-2">
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <input
                  type="text"
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type your answer..."
                  onClick={(e) => e.stopPropagation()}
                  disabled={hasSubmitted}
                />
                {!hasSubmitted && (
                  <Button
                    onClick={handleSubmit}
                    variant="default"
                    className="w-full mt-2"
                    disabled={!answer.trim()}
                  >
                    Submit Answer
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Back of the card */}
          <div className={`absolute w-full h-full backface-hidden bg-white rounded-xl shadow-md p-6 rotate-y-180 flex flex-col ${
            isFlipped ? 'opacity-100' : 'opacity-0'
          }`}>
            <p className="text-gray-700 text-center flex-grow flex items-center justify-center">
              {card.definition}
            </p>
            
            {showAnswerButtons && onAnswer && (
              <div className="flex justify-center space-x-4 mt-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnswer(false);
                  }}
                  variant={getCardStatus(card.id) === 'wrong' ? 'danger' : 'outline'}
                  className={getCardStatus(card.id) === 'wrong' ? 'bg-red-500 text-white' : 'text-red-700 hover:bg-red-100 hover:border-red-300'}
                >
                  Wrong
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnswer(true);
                  }}
                  variant={getCardStatus(card.id) === 'right' ? 'success' : 'outline'}
                  className={getCardStatus(card.id) === 'right' ? 'bg-green-500 text-white' : 'text-green-700 hover:bg-green-100 hover:border-green-300'}
                >
                  Right
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-center text-gray-600 mb-6">
        Card {currentIndex + 1} of {totalCards}
      </p>
    </div>
  );
};
