import { useState } from 'react';
import { Heading } from './Heading';
import { Button } from './Button';

type FillInTheBlankCardProps = {
    card: {
        id: string;
        prompt: string;
        answers: string[];
        explanation: string;
    };
    onAnswer?: (isCorrect: boolean) => void;
    showAnswerButtons?: boolean;
    currentIndex: number;
    totalCards: number;
    onFlip: () => void;
    getCardStatus?: (cardId: string) => 'right' | 'wrong' | null;
};

export const FillInTheBlankCard = ({
    card,
    onAnswer,
    showAnswerButtons = false,
    currentIndex,
    totalCards,
    onFlip: externalOnFlip,
    getCardStatus = () => null,
}: FillInTheBlankCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        const newFlippedState = !isFlipped;
        setIsFlipped(newFlippedState);
        externalOnFlip();
    };

    return (
        <div className="w-full">
            <div
                className="relative w-full min-h-80 mb-8 cursor-pointer"
                onClick={handleFlip}
            >
                <div className="bg-white rounded-xl shadow-md p-6">
                    {!isFlipped ? (
                        // Front of the card
                        <div className="flex flex-col items-center justify-center min-h-64">
                            <Heading as="h2" variant="lg" className="text-center mb-4">
                                Fill in the Blank
                            </Heading>
                            <div className="text-lg text-gray-800 text-center font-medium mb-4">
                                {card.prompt}
                            </div>
                            <p className="text-sm text-gray-500 italic text-center">
                                Tap to reveal answers and explanation
                            </p>
                        </div>
                    ) : (
                        // Back of the card
                        <div className="space-y-4">
                            {/* Answers Section */}
                            <div>
                                <Heading as="h3" variant="md" className="text-green-700 mb-3">
                                    Possible Answers:
                                </Heading>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {card.answers.map((answer, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                                        >
                                            {answer}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Explanation Section */}
                            {card.explanation && (
                                <div className="pt-3 border-t border-gray-200">
                                    <Heading as="h3" variant="md" className="text-blue-700 mb-3">
                                        Explanation:
                                    </Heading>
                                    <div className="p-4 bg-blue-50 rounded-lg text-sm text-gray-700 border border-blue-200">
                                        {card.explanation}
                                    </div>
                                </div>
                            )}

                            {/* Answer Buttons */}
                            {showAnswerButtons && onAnswer && (
                                <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
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
                    )}
                </div>
            </div>

            <p className="text-center text-gray-600 mb-6">
                Card {currentIndex + 1} of {totalCards}
            </p>
        </div>
    );
};
