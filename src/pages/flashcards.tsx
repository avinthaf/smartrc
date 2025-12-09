import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Heading } from '../components/Heading';
import { Button } from '../components/Button';
import { FlashCard } from '../components/FlashCard';
import { useParams } from 'react-router';
import { getFlashcardsByDeckId } from '../lib/flashcards';

type Flashcard = {
  id: string;
  term: string;
  definition: string;
};


type AnswerStatus = 'right' | 'wrong';
type CardAnswers = Record<string, AnswerStatus>;

const Flashcards = () => {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const { supabase } = useOutletContext<any>();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<CardAnswers>({});
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (deckId) {
      setIsLoading(true);
      getFlashcardsByDeckId(supabase, deckId)
        .then((data) => {
          setFlashcards(data);
        })
        .catch((error) => {
          console.error('Error fetching flashcards:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [deckId, supabase]);

  const handleAnswer = (cardId: string, isCorrect: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [cardId]: isCorrect ? 'right' : 'wrong'
    }));
    nextCard();
  };

  const getAnswerStats = () => {
    const values = Object.values(answers);
    return {
      right: values.filter(v => v === 'right').length,
      wrong: values.filter(v => v === 'wrong').length
    };
  };

  const stats = getAnswerStats();

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;

    // Reset isFlipped whenever currentIndex changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const nextCard = () => {
    // Move to next card with wrap-around
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalCards);
  };


  const getCardStatus = (cardId: string) => {
    return answers[cardId] || null;
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No flashcards found in this deck.</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <Heading as="h1" variant="xl" className="mb-6">Flashcards</Heading>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                ✓ {stats.right}
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                ✗ {stats.wrong}
              </span>
            </div>
            <div className="text-gray-600">
              {Object.keys(answers).length} of {totalCards} answered
            </div>
          </div>
        </div>

        <FlashCard
          key={`card-${currentIndex}`}  // This forces a remount when currentIndex changes
          card={currentCard}
          onAnswer={(isCorrect) => handleAnswer(currentCard.id, isCorrect)}
          showAnswerButtons={true}
          currentIndex={currentIndex}
          totalCards={totalCards}
          isFlipped={isFlipped}
          onFlip={toggleFlip}
          getCardStatus={getCardStatus}
        />

        <div className="flex justify-center mt-6 space-x-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              nextCard();
            }}
            disabled={currentIndex === totalCards - 1}
            variant="outline"
            className="px-6 py-2"
          >
            {currentIndex === totalCards - 1 ? 'Done' : 'Next'}
          </Button>
          <Button
            onClick={() => navigate('/flashcards/game')}
            variant="default"
          >
            Create Game Room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;