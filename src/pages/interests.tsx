import { useEffect, useState } from 'react';
import { Heading } from '../components/Heading';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { getPrimaryCategories } from '../lib/categories';
import { useOutletContext } from 'react-router';

const Interests = () => {

  const { supabase } = useOutletContext<any>();

  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [interests, setInterests] = useState<any>([]);

  useEffect(() => {
    const fetchInterests = async () => {
      const interests = await getPrimaryCategories(supabase);
      console.log("Interests", interests);
      setInterests(interests.map((interest: any) => interest.name));
    };
    fetchInterests();
  }, []);

  const toggleInterest = (interest: string) => {
    const newSelection = new Set(selectedInterests);
    if (newSelection.has(interest)) {
      newSelection.delete(interest);
    } else {
      newSelection.add(interest);
    }
    setSelectedInterests(newSelection);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will be implemented later with actual submission
    console.log('Selected interests:', Array.from(selectedInterests));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <Heading as="h2" variant="xl" className="mt-2">
            What are you interested in studying?
          </Heading>
          <Text className="mt-2 text-gray-600">
            Select a few topics you'd like to explore. You can always change these later.
          </Text>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {interests.map((interest: string) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-3 rounded-lg border h-fit ${
                    selectedInterests.has(interest)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                  } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {interest}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                disabled={selectedInterests.size === 0}
                className={`${selectedInterests.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Continue
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Interests;