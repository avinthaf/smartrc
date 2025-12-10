import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Heading } from '../components/Heading';
import { Button } from '../components/Button';
import { FlashCard } from '../components/FlashCard';
import { useParams } from 'react-router';
import { createFlashcardDeckSession, createFlashcardScore, getFlashcardsByDeckId, getFlashcardScoresBySessionId } from '../lib/flashcards';

type Flashcard = {
  id: string;
  term: string;
  definition: string;
};

type FlashcardDeck = {
  id: string;
  title: string;
  description: string | null;
  user_id: string | null;
  publish_status: string;
  created_at: string;
  updated_at: string;
};

type FlashcardDeckSession = {
  id: string;
  deck_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type AnswerStatus = 'right' | 'wrong';
type CardAnswers = Record<string, AnswerStatus>;

const Flashcards = () => {
  const navigate = useNavigate();
  const { deckId, sessionId } = useParams();
  const { supabase } = useOutletContext<any>();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [deckSession, setDeckSession] = useState<FlashcardDeckSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<CardAnswers>({});
  const [isLoading, setIsLoading] = useState(true);
  const hasAnswers = Object.keys(answers).length > 0;

  useEffect(() => {
    if (deckId) {
      setIsLoading(true);
      getFlashcardsByDeckId(supabase, deckId)
        .then((data) => {
          setDeck(data.deck);
          setFlashcards(data.flashcards);
        })
        .catch((error) => {
          console.error('Error fetching flashcards:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [deckId, supabase]);

  useEffect(() => {
    if (deckId && sessionId && !deckSession) {
      createFlashcardDeckSession(supabase, deckId, sessionId)
        .then((data) => {
          setDeckSession(data);
        })
        .catch((error) => {
          console.error('Error creating flashcard deck session:', error);
        });
    }
  }, [deckId, supabase, deckSession, sessionId]);

  useEffect(() => {
    if (sessionId && !deckSession) {
      getFlashcardScoresBySessionId(supabase, sessionId)
        .then((scores) => {
          // Transform scores array into the answers state format
          const answersMap = scores.reduce((acc: Record<string, 'right' | 'wrong'>, score: { card_id: string; score: number }) => {
            acc[score.card_id] = score.score === 1 ? 'right' : 'wrong';
            return acc;
          }, {} as Record<string, 'right' | 'wrong'>);
          setAnswers(answersMap);
        })
        .catch((error) => {
          console.error('Error fetching flashcard scores:', error);
        });
    }
  }, [sessionId, supabase, deckSession]);

  const handleAnswer = async (cardId: string, isCorrect: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [cardId]: isCorrect ? 'right' : 'wrong'
    }));

    await createFlashcardScore(supabase, { cardId, score: isCorrect ? 1 : 0, sessionId: sessionId as string });
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
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  };

  const allCardsAnswered = Object.keys(answers).length === totalCards;


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
          <Heading as="h1" variant="xl" className="mb-6">{deck?.title}</Heading>

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

        {
          allCardsAnswered ? (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg mb-4 text-center">
              🎉 You've completed all the cards in this deck!
            </div>
          )
            : (
              <>
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

                <div className="text-center mt-6">
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevCard();
                      }}
                      disabled={currentIndex === 0}
                      variant="outline"
                      className="px-6 py-2"
                    >
                      Prev
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextCard();
                      }}
                      disabled={currentIndex >= totalCards - 1}
                      variant="outline"
                      className="px-6 py-2"
                    >
                      {currentIndex >= totalCards - 1 ? 'No more cards' : 'Next'}
                    </Button>
                  </div>
                </div>
              </>
            )
        }
        {/* <Button
            onClick={() => navigate('/flashcards/game')}
            variant="default"
          >
            Create Game Room
          </Button> */}
      </div>
    </div>

  );
};

export default Flashcards;