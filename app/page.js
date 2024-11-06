'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from './supabaseClient';

const HostLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Sign in to Supabase
            const { user, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message);
                return;
            }

            // Delete all entries in the leaderboard table
            const { error: deleteError } = await supabase
                .from('leaderboard')
                .delete()
                .neq('id', -1);  // This condition is effectively a no-op, deleting all rows
            if (deleteError) {
                throw new Error('Error deleting leaderboard entries: ' + deleteError.message);
            }

            // Update `is_active` field to false for the row in the quiz_state table with `id = 1`
            const { error: updateError } = await supabase
                .from('quiz_state')
                .update({ 
                    is_active: false,
                    current_question_index: 0
                })
                .eq('id', 1);
            if (updateError) {
                throw new Error('Error updating is_active field: ' + updateError.message);
            }

            // Set a flag to indicate this is the host
            localStorage.setItem('isHost', 'true');

            // Redirect to the next page (start quiz)
            router.push('/start-quiz');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <div className="logo"></div>
            <h1>Quiz Host Login</h1>
            <div className="quiz-container">
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={error ? 'error' : ''}
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={error ? 'error' : ''}
                        required
                    />
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    <button type="submit">Login as Host</button>
                </form>
            </div>
        </div>
    );
};

export default HostLogin;
