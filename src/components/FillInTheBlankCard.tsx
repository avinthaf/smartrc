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
    const [userInputs, setUserInputs] = useState<string[]>([]);

    // Parse the prompt to identify blanks and initialize user inputs
    const parsePrompt = (prompt: string) => {
        const parts = prompt.split('[blank]');
        const blankCount = parts.length - 1;

        // Initialize user inputs if needed
        if (userInputs.length !== blankCount) {
            setUserInputs(new Array(blankCount).fill(''));
        }

        return parts;
    };

    const promptParts = parsePrompt(card.prompt);

    const handleInputChange = (index: number, value: string) => {
        const newInputs = [...userInputs];
        newInputs[index] = value;
        setUserInputs(newInputs);
    };

    const handleSubmit = () => {
        // Check if all blanks are filled
        const allFilled = userInputs.every(input => input.trim() !== '');
        if (allFilled) {
            const newFlippedState = !isFlipped;
            setIsFlipped(newFlippedState);
            externalOnFlip();
        }
    };

    const handleFlip = () => {
        // Only allow flip if all blanks are filled or already flipped
        const allFilled = userInputs.every(input => input.trim() !== '');
        if (isFlipped || allFilled) {
            const newFlippedState = !isFlipped;
            setIsFlipped(newFlippedState);
            externalOnFlip();
        }
    };

    return (
        <div className="w-full">
            <div
                className="relative w-full min-h-80 mb-8"
            >
                <div className="bg-white rounded-xl shadow-md p-6">
                    {!isFlipped ? (
                        // Front of the card
                        <div className="flex flex-col items-center justify-center min-h-64">
                            <Heading as="h2" variant="lg" className="text-center mb-4">
                                Fill in the Blank
                            </Heading>
                            <div className="text-lg text-gray-800 text-center font-medium mb-4">
                                {promptParts.map((part, index) => (
                                    <span key={index}>
                                        {part}
                                        {index < promptParts.length - 1 && (
                                            <input
                                                type="text"
                                                value={userInputs[index] || ''}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                                className="inline-block mx-1 px-2 py-1 w-32 border-b-2 border-blue-500 text-center focus:outline-none focus:border-blue-700 bg-blue-50"
                                                placeholder="answer"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        )}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-6 space-y-2">
                                <p className="text-sm text-gray-500 italic text-center">
                                    Fill in all blanks, then click submit to reveal answers
                                </p>
                                <Button
                                    onClick={handleSubmit}
                                    variant="default"
                                    className="w-full max-w-xs"
                                    disabled={!userInputs.every(input => input.trim() !== '')}
                                >
                                    Submit Answers
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Back of the card
                        <div className="space-y-4">
                            {/* User's Answers Section */}
                            <div>
                                <Heading as="h3" variant="md" className="text-blue-700 mb-3">
                                    Your Answers:
                                </Heading>
                                <div className="text-lg text-gray-800 text-center font-medium mb-4">
                                    {promptParts.map((part, index) => (
                                        <span key={index}>
                                            {part}
                                            {index < promptParts.length - 1 && (
                                                <span className="inline-block mx-1 px-2 py-1 w-32 text-center bg-yellow-100 border border-yellow-300 rounded font-medium">
                                                    {userInputs[index] || '______'}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Correct Answers Section */}
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

                            {/* Flip Back Button */}
                            <div className="flex justify-center pt-2">
                                <Button
                                    onClick={handleFlip}
                                    variant="outline"
                                    className="text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                                >
                                    Back to Question
                                </Button>
                            </div>
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
