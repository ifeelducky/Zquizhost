'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../supabaseClient';
import Image from 'next/image';

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
            <div className="quiz-container">
                <h3>zone01quiz.vercel.app </h3>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                    <Image
                        src="/qrcode.png"
                        alt="QR Code to join quiz"
                        width={400}
                        height={400}
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>
 
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
