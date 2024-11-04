'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../supabaseClient'; // Adjust the path if needed

const StartQuizPage = () => {
    const router = useRouter();

    const handleStartQuiz = async () => {
        try {
            const { data, error } = await supabase
                .from('quiz_state')
                .update({ is_active: true }) // Update is_active to true
                .eq('id', 1); // Assuming the id of the quiz state you want to update is 1

            if (error) {
                console.error('Error updating quiz state:', error);
                // Optionally show an error message to the user
            } else {
                console.log('Quiz started successfully:', data);
                router.push('/quiz-display'); // Navigate to quiz-display page
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };

    return (
        <div className='container'>
            <h1>Start Quiz</h1>
            <button onClick={handleStartQuiz} className='btn'>
                Start Quiz
            </button>
        </div>
    );
};

export default StartQuizPage;
