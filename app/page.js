'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from './supabaseClient';

const HostLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Sign in to Supabase
        const { user, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
            return;
        }

        // Perform the operations after successful login
        try {
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
            alert(err.message);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
            />
            <button type="submit">Login as Host</button>
        </form>
    );
};

export default HostLogin;
