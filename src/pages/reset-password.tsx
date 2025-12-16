import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Input from '../components/Input';
import { Text, LinkText } from '../components/Text';
import { Heading } from '../components/Heading';
import { Button } from '../components/Button';
import { resetPassword } from '../lib/auth';
import { useOutletContext } from 'react-router';
import { useNavigate } from 'react-router';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const { supabase } = useOutletContext<any>();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setError('');
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);
        setError('');

        resetPassword(supabase, email, () => {
            setIsSuccess(true);
            setIsLoading(false);
        }, (error) => {
            setError(error.message || 'Failed to send reset email. Please try again.');
            setIsLoading(false);
        });
    };

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
                            Check your email
                        </Heading>
                    </div>
                    <div className="mt-8 text-center">
                        <Text variant="body" color="muted">
                            We've sent a password reset link to{' '}
                            <span className="font-medium text-gray-900">{email}</span>
                        </Text>
                        <Text variant="body" color="muted" className="mt-2">
                            Please check your email and follow the instructions to reset your password.
                        </Text>
                    </div>
                    <div className="mt-6 space-y-3">
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full justify-center"
                        >
                            Back to sign in
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsSuccess(false);
                                setEmail('');
                            }}
                            className="w-full justify-center"
                        >
                            Try another email
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
                        Reset your password
                    </Heading>
                    <Text variant="body" color="muted" className="mt-2">
                        Enter your email address and we'll send you a link to reset your password.
                    </Text>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <Input
                            name="email"
                            type="email"
                            label="Email address"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            error={error}
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send reset link'}
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

export default ResetPassword;
