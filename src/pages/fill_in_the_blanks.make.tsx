import { useState } from 'react';
import { useOutletContext } from "react-router";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { Heading } from '../components/Heading';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import { createFillInBlanksWithAI, createFillInBlankDeck, type FillInBlank } from '../lib/fill_in_blanks';

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
            onClick={(e) => e.stopPropagation()}
            custom={window.innerWidth < 768}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Generate Fill-in-the-Blanks with AI</h3>
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

const FillInBlanksMaker = () => {
  const { supabase } = useOutletContext<any>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [exercises, setExercises] = useState<FillInBlank[]>([
    { id: Date.now().toString(), prompt: '', answers: [''], explanation: '' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const handleAddExercise = () => {
    const newExercise: FillInBlank = {
      id: Date.now().toString(),
      prompt: '',
      answers: [''],
      explanation: ''
    };
    setExercises([...exercises, newExercise]);
    setActiveExerciseIndex(exercises.length);
  };

  const handleRemoveExercise = (index: number) => {
    if (exercises.length <= 1) return; // Don't remove the last exercise
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
    if (activeExerciseIndex >= index) {
      setActiveExerciseIndex(Math.max(0, activeExerciseIndex - 1));
    }
  };

  const handleExerciseChange = (index: number, field: keyof FillInBlank, value: string | string[]) => {
    const newExercises = [...exercises];
    if (field === 'answers') {
      newExercises[index] = { ...newExercises[index], [field]: value as string[] };
    } else {
      newExercises[index] = { ...newExercises[index], [field]: value as string };
    }
    setExercises(newExercises);
  };

  const handleAnswerChange = (exerciseIndex: number, answerIndex: number, value: string) => {
    const newExercises = [...exercises];
    const newAnswers = [...newExercises[exerciseIndex].answers];
    newAnswers[answerIndex] = value;
    newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], answers: newAnswers };
    setExercises(newExercises);
  };

  const handleAddAnswer = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex] = { 
      ...newExercises[exerciseIndex], 
      answers: [...newExercises[exerciseIndex].answers, ''] 
    };
    setExercises(newExercises);
  };

  const handleRemoveAnswer = (exerciseIndex: number, answerIndex: number) => {
    const newExercises = [...exercises];
    const newAnswers = newExercises[exerciseIndex].answers.filter((_, i) => i !== answerIndex);
    newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], answers: newAnswers };
    setExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty exercises and remove IDs for auto-generation
    const validExercises = exercises
      .filter(exercise => exercise.prompt.trim() && exercise.answers.some(answer => answer.trim()))
      .map(({ prompt, answers, explanation }, index) => ({ 
        id: `fillblank-${String(index + 1).padStart(3, '0')}`,
        prompt, 
        answers: answers.filter(answer => answer.trim()),
        explanation 
      }));
    
    if (!title.trim()) {
      alert('Please enter a title for the fill-in-the-blanks set');
      return;
    }
    
    if (validExercises.length === 0) {
      alert('Please add at least one fill-in-the-blanks exercise with prompt and at least one answer');
      return;
    }

    try {
      // Get current user ID (you may need to adjust this based on your auth setup)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        alert('You must be logged in to create a fill-in-the-blanks set');
        return;
      }

      const deckData = {
        title: title.trim(),
        description: description.trim(),
        user_id: userId,
        publish_status: 'draft', // You may want to make this configurable
        fill_in_blanks: validExercises,
        category_ids: categoryIds
      };
      
      const result = await createFillInBlankDeck(supabase, deckData);
      console.log('Fill-in-the-blanks deck created successfully:', result);
      
      // Show success message
      alert('Fill-in-the-blanks set created successfully!');
      
      // Reset form or redirect as needed
      // For example: window.location.href = '/fill-in-the-blanks';
      
    } catch (error) {
      console.error('Error creating fill-in-the-blanks set:', error);
      alert('Failed to create fill-in-the-blanks set. Please try again.');
    }
  };

  const handleGenerateExercises = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);

    try {
      const response = await createFillInBlanksWithAI(supabase, aiPrompt);
      console.log('Raw AI API Response:', response);
      
      // Parse the JSON response to get fill-in-the-blanks data
      let fillInBlanksData;
      let aiTitle = '';
      let aiDescription = '';
      let aiCategories = '';
      try {
        console.log('Raw response type:', typeof response);
        console.log('Raw response value:', response);
        
        // The response from createFillInBlanksWithAI might be a string or object
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
        fillInBlanksData = parsedResponse.result;
        if (typeof fillInBlanksData === 'string') {
          console.log('Result is string, parsing...');
          // Handle the escaped JSON string properly
          try {
            // First, try to parse as-is
            const parsedResult = JSON.parse(fillInBlanksData);
            console.log('Parsed inner result:', parsedResult);
            // The parsedResult should have: {result: string, title: string, description: string, categories: array}
            
            // Extract title, description, and categories from the inner parsed result
            aiTitle = parsedResult.title || '';
            aiDescription = parsedResult.description || '';
            
            if (parsedResult.categories && parsedResult.categories.length > 0) {
              console.log('Found categories in inner result:', parsedResult.categories);
              const categoryNames = parsedResult.categories.map((cat: any) => cat.name).filter(Boolean);
              const categoryIds = parsedResult.categories.map((cat: any) => cat.id).filter(Boolean);
              
              const validCategoryIds = categoryIds.filter((id: string) => {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                return uuidRegex.test(id);
              });
              
              aiCategories = categoryNames.join(', ');
              setCategoryIds(validCategoryIds);
              console.log('Set categories from inner result:', aiCategories, validCategoryIds);
            }
            
            // Now parse the exercises from the inner result
            if (parsedResult.result && typeof parsedResult.result === 'string') {
              fillInBlanksData = JSON.parse(parsedResult.result);
            } else if (Array.isArray(parsedResult.result)) {
              fillInBlanksData = parsedResult.result;
            } else {
              fillInBlanksData = parsedResult;
            }
            
          } catch (firstError) {
            console.log('First parse failed, cleaning and retrying...');
            // If that fails, clean up the string and try again
            let cleanedResult = fillInBlanksData
              .replace(/\\"/g, '"')  // Fix escaped quotes
              .replace(/"\s+}/g, '"}')  // Fix spaces before closing brackets
              .replace(/"\s+\]/g, '"]')  // Fix spaces before closing array brackets
              .trim();
            
            const parsedResult = JSON.parse(cleanedResult);
            console.log('Cleaned parsed inner result:', parsedResult);
            
            // Extract title, description, and categories from the inner parsed result
            aiTitle = parsedResult.title || '';
            aiDescription = parsedResult.description || '';
            
            if (parsedResult.categories && parsedResult.categories.length > 0) {
              console.log('Found categories in cleaned inner result:', parsedResult.categories);
              const categoryNames = parsedResult.categories.map((cat: any) => cat.name).filter(Boolean);
              const categoryIds = parsedResult.categories.map((cat: any) => cat.id).filter(Boolean);
              
              const validCategoryIds = categoryIds.filter((id: string) => {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                return uuidRegex.test(id);
              });
              
              aiCategories = categoryNames.join(', ');
              setCategoryIds(validCategoryIds);
              console.log('Set categories from cleaned inner result:', aiCategories, validCategoryIds);
            }
            
            // Now parse the exercises from the inner result
            if (parsedResult.result && typeof parsedResult.result === 'string') {
              fillInBlanksData = JSON.parse(parsedResult.result);
            } else if (Array.isArray(parsedResult.result)) {
              fillInBlanksData = parsedResult.result;
            } else {
              fillInBlanksData = parsedResult;
            }
          }
        } else if (Array.isArray(fillInBlanksData)) {
          console.log('Result is already an array');
        } else {
          console.log('Result is already parsed:', typeof fillInBlanksData);
        }

        // Extract title, description, and categories from the AI response
        // These are now extracted in the parsing logic above
        console.log('Final extracted values - aiTitle:', aiTitle, 'aiDescription:', aiDescription, 'aiCategories:', aiCategories);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Invalid response format from AI');
      }

      // Add the generated exercises to the existing exercises
      if (Array.isArray(fillInBlanksData) && fillInBlanksData.length > 0) {
        const newExercises = fillInBlanksData.map((exercise: any) => ({
          id: exercise.id || Date.now().toString() + Math.random().toString(),
          prompt: exercise.prompt || exercise.sentence || '',
          answers: exercise.answers || (exercise.answer ? [exercise.answer] : ['']),
          explanation: exercise.explanation || exercise.hint || ''
        }));

        // Always replace exercises with AI-generated ones (override previous results)
        setExercises(newExercises);

        // Always set title, description, and category from AI (override previous values)
        console.log('Setting final values - aiTitle:', aiTitle, 'aiDescription:', aiDescription, 'aiCategories:', aiCategories);
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
        throw new Error('Unable to generate fill-in-the-blanks exercises for this request. Please try a different topic.');
      }

    } catch (error) {
      console.error('Error generating fill-in-the-blanks exercises:', error);
      // Show error message to user
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An error occurred while generating exercises. Please try again.');
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
          <Heading as="h1" variant="sm">Create a new fill-in-the-blanks set</Heading>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex-col">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="mb-2"
            />
            <TextArea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="mb-2"
            />
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (e.g., Grammar, Science, Mathematics)"
            />

          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div></div>
              <Button
                type="button"
                onClick={() => setIsBottomSheetOpen(true)}
                variant="outline"
                size="sm"
              >
                Generate with AI
              </Button>
            </div>

            {exercises.length > 0 && (
              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className={`bg-white rounded-lg border border-gray-200 p-4 ${index === activeExerciseIndex ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setActiveExerciseIndex(index)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-bold text-gray-700">Exercise {index + 1}</h3>
                      {exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveExercise(index);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prompt (use ___ for the blank)
                        </label>
                        <TextArea
                          id={`prompt-${index}`}
                          rows={2}
                          value={exercise.prompt}
                          onChange={(e) => handleExerciseChange(index, 'prompt', e.target.value)}
                          placeholder="e.g., The capital of France is ___."
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Answers
                          </label>
                          <Button
                            type="button"
                            onClick={() => handleAddAnswer(index)}
                            variant="outline"
                            size="sm"
                          >
                            + Add Answer
                          </Button>
                        </div>
                        {exercise.answers.map((answer, answerIndex) => (
                          <div key={answerIndex} className="flex gap-2 mb-2">
                            <Input
                              id={`answer-${index}-${answerIndex}`}
                              value={answer}
                              onChange={(e) => handleAnswerChange(index, answerIndex, e.target.value)}
                              placeholder={`Answer ${answerIndex + 1}`}
                              className="flex-1"
                            />
                            {exercise.answers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAnswer(index, answerIndex)}
                                className="text-red-500 hover:text-red-700 px-2"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Explanation (optional)
                        </label>
                        <TextArea
                          id={`explanation-${index}`}
                          rows={2}
                          value={exercise.explanation || ''}
                          onChange={(e) => handleExerciseChange(index, 'explanation', e.target.value)}
                          placeholder="Optional explanation for the answer"
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
                onClick={handleAddExercise}
                variant="outline"
                className="px-6"
              >
                + Add Exercise
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              Create Fill-in-the-Blanks Set
            </Button>
          </div>
        </form>

        {/* AI Generation Bottom Sheet */}
        <BottomSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)}>
          <form onSubmit={handleGenerateExercises} className="space-y-4">
            <div>
              <TextArea
                id="ai-prompt"
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Create fill-in-the-blanks exercises about world capitals, basic math operations, etc."
                disabled={isGenerating}
              />
              <p className="mt-1 text-xs text-gray-500">
                The AI will generate fill-in-the-blanks exercises based on your description
              </p>
            </div>
            <Button
              type="submit"
              className="w-full justify-center"
              disabled={!aiPrompt.trim() || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Exercises'}
            </Button>
          </form>
        </BottomSheet>
      </div>
    </div>
  );
};

export default FillInBlanksMaker;
