import { useState } from 'react';
import Input from '../components/Input';
import { Text } from '../components/Text';
import { Heading } from '../components/Heading';
import { Button } from '../components/Button';
import { useNavigate, useOutletContext } from 'react-router';
import { updateUser } from '../lib/users';

const OnboardingInfo = () => {
    const navigate = useNavigate();
    const { supabase } = useOutletContext<any>();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        
        setIsLoading(true);
        
        try {
            await updateUser(supabase, formData.firstName, formData.lastName);
            // Navigate to next step
            navigate('/onboarding/interests');
        } catch (error) {
            console.error('Failed to update user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <Heading as="h2" variant="xl" className="mt-6">
                        Tell us about yourself
                    </Heading>
                    <Text variant="small" color="muted" className="mt-2">
                        Help us personalize your learning experience
                    </Text>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <Input
                            name="firstName"
                            type="text"
                            label="First name"
                            autoComplete="given-name"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="John"
                        />
                        <Input
                            name="lastName"
                            type="text"
                            label="Last name"
                            autoComplete="family-name"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Continue'}
                        </Button>
                    </div>
                </form>
                
                <div className="mt-6 text-center">
                    <Text variant="small" color="muted">
                        You can update this information later in your profile settings
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default OnboardingInfo;