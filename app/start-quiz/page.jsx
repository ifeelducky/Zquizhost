'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../supabaseClient';

const StartQuizPage = () => {
    const router = useRouter();
    const [error, setError] = useState('');

    const handleStartQuiz = async () => {
        try {
            const { data, error } = await supabase
                .from('quiz_state')
                .update({ is_active: true })
                .eq('id', 1);

            if (error) {
                setError('Error starting quiz: ' + error.message);
            } else {
                console.log('Quiz started successfully:', data);
                router.push('/quiz-display');
            }
        } catch (error) {
            setError('Unexpected error: ' + error.message);
        }
    };

    return (
        <div className='container'>
            <div className="logo"></div>
            <h1>Quiz Control Panel</h1>
            <div className="quiz-container">
                <h3>Ready to Begin?</h3>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
                    Click the button below to start the quiz session. 
                    This will allow participants to join and begin answering questions.
                </p>
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                <button onClick={handleStartQuiz}>
                    Start Quiz Session
                </button>
            </div>
        </div>
    );
};

export default StartQuizPage;
