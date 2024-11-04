'use client';
import React, { useState } from 'react';
import supabase from '../supabaseClient'; 
import { useRouter } from 'next/navigation';

const StartQuiz = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleStartQuiz = async () => {
        setLoading(true);
        try {
            // Check if the user is authenticated
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                alert('You must be logged in to start the quiz');
                return;
            }

            // Update quiz state to indicate the quiz is running
            const { data, error } = await supabase
                .from('quiz_state')
                .insert({ id: 1, is_active: true, current_question_index: 0 });

            if (error) throw error;

            // Navigate to the quiz display page or whatever you need next
            router.push('..//quiz-display'); // Example route
        } catch (error) {
            console.error('Error starting quiz:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Welcome to the Zone01 quiz game!</h1>
            <button onClick={handleStartQuiz} disabled={loading}>
                {loading ? 'Starting...' : 'Start Quiz'}
            </button>
        </div>
    );
};

export default StartQuiz;
