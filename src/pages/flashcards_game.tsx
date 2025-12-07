import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heading } from '../components/Heading';
import { Button } from '../components/Button';
import { FlashCard } from '../components/FlashCard';

type Flashcard = {
  id: string;
  title: string;
  description: string;
};

const flashcardData: Flashcard[] = [
  {
    id: '1',
    title: 'Cell Biology',
    description: 'The study of cell structure and function, and it revolves around the concept that the cell is the fundamental unit of life.'
  },
  {
    id: '2',
    title: 'Photosynthesis',
    description: 'The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.'
  },
  {
    id: '3',
    title: 'Mitochondria',
    description: 'The powerhouse of the cell, responsible for producing energy through cellular respiration.'
  },
  {
    id: '4',
    title: 'DNA Replication',
    description: 'The process by which a double-stranded DNA molecule is copied to produce two identical DNA molecules.'
  },
  {
    id: '5',
    title: 'Neuron Function',
    description: 'Neurons transmit information through electrical and chemical signals, forming the basis of the nervous system.'
  }
];

type AnswerStatus = 'right' | 'wrong';
type CardAnswers = Record<string, AnswerStatus>;

const FlashcardsGame = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<CardAnswers>({});

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

  const currentCard = flashcardData[currentIndex];
  const totalCards = flashcardData.length;

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalCards);
  };


  const getCardStatus = (cardId: string) => {
    return answers[cardId] || null;
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <Heading as="h1" variant="xl" className="mb-6">Flashcards Game Room</Heading>
          
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
          variant="game"
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
            onClick={() => navigate('/flashcards')}
            variant="default"
          >
            Back to Flashcards
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsGame;