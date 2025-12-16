import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Input from '../components/Input';
import { Text, LinkText } from '../components/Text';
import { Heading } from '../components/Heading';
import { Button } from '../components/Button';
import { useOutletContext } from 'react-router';
import { useNavigate } from 'react-router';

const SetNewPassword = () => {
    const navigate = useNavigate();
    const { supabase } = useOutletContext<any>();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

    // Check if the reset token is valid on component mount using Supabase's auth state change
    useEffect(() => {
        getSession().then((session) => {
            if (session) {
                setIsTokenValid(true);
            } else {
                setIsTokenValid(false);
                setError('Invalid or expired reset link. Please request a new password reset.');
            }
        })

    }, [supabase]);

    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const validatePasswords = () => {
        if (!formData.password.trim()) {
            setError('Please enter a new password');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!validatePasswords()) {
            return;
        }

        setIsLoading(true);
        setError('');

        // Update the user's password
        supabase.auth.updateUser({
            password: formData.password
        }).then(({ error }: { error: any }) => {
            if (error) {
                setError(error.message || 'Failed to update password. Please try again.');
                setIsLoading(false);
            } else {
                setIsSuccess(true);
                setIsLoading(false);
            }
        });
    };

    if (isTokenValid === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <Heading as="h2" variant="xl" className="mt-6">
                            Verifying reset link...
                        </Heading>
                    </div>
                </div>
            </div>
        );
    }

    if (isTokenValid === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <Heading as="h2" variant="xl" className="mt-6">
                            Invalid reset link
                        </Heading>
                    </div>
                    <div className="mt-8 text-center">
                        <Text variant="body" color="muted">
                            {error}
                        </Text>
                    </div>
                    <div className="mt-6">
                        <Button
                            onClick={() => navigate('/reset-password')}
                            className="w-full justify-center"
                        >
                            Request new reset link
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <Heading as="h2" variant="xl" className="mt-6">
                            Password updated!
                        </Heading>
                    </div>
                    <div className="mt-8 text-center">
                        <Text variant="body" color="muted">
                            Your password has been successfully updated. You can now sign in with your new password.
                        </Text>
                    </div>
                    <div className="mt-6">
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full justify-center"
                        >
                            Sign in
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <Heading as="h2" variant="xl" className="mt-6">
                        Set new password
                    </Heading>
                    <Text variant="body" color="muted" className="mt-2">
                        Enter your new password below.
                    </Text>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <Input
                            name="password"
                            type="password"
                            label="New password"
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your new password"
                        />
                        <Input
                            name="confirmPassword"
                            type="password"
                            label="Confirm new password"
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your new password"
                            error={error}
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : 'Update password'}
                        </Button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <Text variant="small" color="muted">
                        Remember your password?{' '}
                        <LinkText href="/login">Back to sign in</LinkText>
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default SetNewPassword;
