import { useEffect, useState } from 'react';
import { Heading } from '../components/Heading';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { getPrimaryCategories } from '../lib/categories';
import { useOutletContext } from 'react-router';
import { createInterests, getInterests } from '../lib/interests';
import { useNavigate } from 'react-router';

const Interests = () => {

  const { supabase, user } = useOutletContext<any>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<any>([]);

  useEffect(() => {
    const fetchInterests = async () => {
      const interests = await getInterests(supabase);
      if (interests?.length > 0) {
        navigate("/");
      }
    };

    fetchInterests();
    setLoading(false);

  }, [supabase])

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await getPrimaryCategories(supabase);
      setCategories(categories);
    };
    fetchCategories();
  }, [supabase]);
  

  const toggleInterest = (interest: string) => {
    const newSelection = new Set(selectedInterests);
    if (newSelection.has(interest)) {
      newSelection.delete(interest);
    } else {
      newSelection.add(interest);
    }
    setSelectedInterests(newSelection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const interestsData = Array.from(selectedInterests).map(interestId => ({
      user_id: user.id,
      category_id: interestId
    }));

    try {
      await createInterests(supabase, interestsData);
      navigate("/");
    } catch (error) {
      console.error("Error creating interests:", error);
    }
  };

if (loading) {
  return <div>Loading...</div>;
}

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
              {categories.map((category: any, index: number) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleInterest(category.id)}
                  className={`px-4 py-3 rounded-lg border h-fit ${
                    selectedInterests.has(category.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                  } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {category.name}
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