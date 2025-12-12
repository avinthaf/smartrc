import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { Heading } from '../components/Heading';
import { Button } from '../components/Button';
import { FillInTheBlankCard } from '../components/FillInTheBlankCard';
import { useParams } from 'react-router';
import { createFillInBlankDeckSession, createFillInBlankScore, getFillInBlanksByDeckId, getFillInBlankScoresBySessionId } from '../lib/fill_in_blanks';

type FillInBlank = {
  id: string;
  deck_id: string;
  prompt: string;
  answers: string[];
  explanation: string;
};

type FillInBlankDeck = {
  id: string;
  title: string;
  description: string;
  user_id: string | null;
  publish_status: string;
  created_at: string;
  updated_at: string;
};

type FillInBlankDeckSession = {
  id: string;
  deck_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type AnswerStatus = 'right' | 'wrong';
type CardAnswers = Record<string, AnswerStatus>;

const FillInTheBlanksDeck = () => {
  const { deckId, sessionId } = useParams();
  const { supabase } = useOutletContext<any>();

  const [fillInBlanks, setFillInBlanks] = useState<FillInBlank[]>([]);
  const [deck, setDeck] = useState<FillInBlankDeck | null>(null);
  const [deckSession, setDeckSession] = useState<FillInBlankDeckSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<CardAnswers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (deckId) {
      setIsLoading(true);
      getFillInBlanksByDeckId(supabase, deckId)
        .then((data) => {
          setDeck(data.deck);
          setFillInBlanks(data.fill_in_blanks);
        })
        .catch((error) => {
          console.error('Error fetching fill in blanks:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [deckId, supabase]);

  useEffect(() => {
    if (deckId && sessionId && !deckSession) {
      createFillInBlankDeckSession(supabase, deckId, sessionId)
        .then((data) => {
          setDeckSession(data);
        })
        .catch((error) => {
          console.error('Error creating fill in blank deck session:', error);
        });
    }
  }, [deckId, supabase, deckSession, sessionId]);

  useEffect(() => {
    if (sessionId && !deckSession) {
      getFillInBlankScoresBySessionId(supabase, sessionId)
        .then((scores) => {
          // Transform scores array into the answers state format
          const answersMap = scores.reduce((acc: Record<string, 'right' | 'wrong'>, score: { fill_in_blank_id: string; score: number }) => {
            acc[score.fill_in_blank_id] = score.score === 1 ? 'right' : 'wrong';
            return acc;
          }, {} as Record<string, 'right' | 'wrong'>);
          setAnswers(answersMap);
        })
        .catch((error) => {
          console.error('Error fetching fill in blank scores:', error);
        });
    }
  }, [sessionId, supabase, deckSession]);

  const handleAnswer = async (fillInBlankId: string, isCorrect: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [fillInBlankId]: isCorrect ? 'right' : 'wrong'
    }));

    await createFillInBlankScore(supabase, { fillInBlankId, score: isCorrect ? 1 : 0, sessionId: sessionId as string });
    nextCard();
  };


  const getAnswerStats = () => {
    const values = Object.values(answers);
    return {
      right: values.filter(v => v === 'right').length,
      wrong: values.filter(v => v === 'wrong').length
    };
  };

  const getGroupedAnswers = () => {
    const rightCards = fillInBlanks.filter(card => answers[card.id] === 'right');
    const wrongCards = fillInBlanks.filter(card => answers[card.id] === 'wrong');
    return { rightCards, wrongCards };
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const toggleSectionExpansion = (section: 'right' | 'wrong') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const stats = getAnswerStats();

  const currentCard = fillInBlanks[currentIndex];
  const totalCards = fillInBlanks.length;

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
          <p className="mt-4 text-gray-600">Loading fill in the blanks...</p>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No fill in the blanks found in this deck.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <Heading as="h1" variant="sm" className="mb-6">{deck?.title}</Heading>

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
            <div className="space-y-6">
              <div className="p-4 text-green-700 rounded-lg text-center">
                🎉 You've completed all the fill in the blanks in this deck!
              </div>
              
              <div className="space-y-6">
                {/* Right Answers */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSectionExpansion('right')}
                    className="w-full text-left px-4 py-4 bg-green-50 hover:bg-green-100 transition-colors duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-3">
                        ✓
                      </div>
                      <h3 className="text-lg font-semibold text-green-800">
                        Correct Answers ({stats.right})
                      </h3>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections['right'] ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections['right'] && (
                    <div className="p-4 space-y-2">
                      {getGroupedAnswers().rightCards.map((card) => (
                        <div key={card.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleCardExpansion(card.id)}
                            className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                          >
                            <span className="font-medium text-gray-900">{card.prompt}</span>
                            <svg
                              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedCards[card.id] ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {expandedCards[card.id] && (
                            <div className="px-4 py-3 bg-white border-t border-gray-200">
                              <div className="space-y-3">
                                <div>
                                  <div className="font-medium text-sm text-gray-700 mb-2">Answers:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {card.answers.map((answer, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                      >
                                        {answer}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                {card.explanation && (
                                  <div className="pt-2 border-t border-gray-100">
                                    <div className="font-medium text-sm text-gray-700 mb-2">Explanation:</div>
                                    <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200">
                                      {card.explanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {stats.right === 0 && (
                        <div className="text-gray-500 italic">No correct answers</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Wrong Answers */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSectionExpansion('wrong')}
                    className="w-full text-left px-4 py-4 bg-red-50 hover:bg-red-100 transition-colors duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 text-red-800 rounded-full flex items-center justify-center mr-3">
                        ✗
                      </div>
                      <h3 className="text-lg font-semibold text-red-800">
                        Incorrect Answers ({stats.wrong})
                      </h3>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections['wrong'] ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections['wrong'] && (
                    <div className="p-4 space-y-2">
                      {getGroupedAnswers().wrongCards.map((card) => (
                        <div key={card.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleCardExpansion(card.id)}
                            className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                          >
                            <span className="font-medium text-gray-900">{card.prompt}</span>
                            <svg
                              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedCards[card.id] ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {expandedCards[card.id] && (
                            <div className="px-4 py-3 bg-white border-t border-gray-200">
                              <div className="space-y-3">
                                <div>
                                  <div className="font-medium text-sm text-gray-700 mb-2">Answers:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {card.answers.map((answer, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                      >
                                        {answer}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                {card.explanation && (
                                  <div className="pt-2 border-t border-gray-100">
                                    <div className="font-medium text-sm text-gray-700 mb-2">Explanation:</div>
                                    <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200">
                                      {card.explanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {stats.wrong === 0 && (
                        <div className="text-gray-500 italic">No incorrect answers</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
            : (
              <>
                <FillInTheBlankCard
                  key={`card-${currentIndex}`}  // This forces a remount when currentIndex changes
                  card={currentCard}
                  onAnswer={(isCorrect) => handleAnswer(currentCard.id, isCorrect)}
                  showAnswerButtons={true}
                  currentIndex={currentIndex}
                  totalCards={totalCards}
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
      </div>
    </div>

  );
};

export default FillInTheBlanksDeck;
