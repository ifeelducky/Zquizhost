'use client';
import React, { useState, useEffect, useRef } from 'react';
import { fetchQuizData } from '../fetchQuizData';
import supabase from '../supabaseClient';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(15);
    const timerRef = useRef(null);
    const isMovingRef = useRef(false);
    const [submitError, setSubmitError] = useState(null);
    const [topScores, setTopScores] = useState([]);

    useEffect(() => {
        // Load quiz data
        const loadQuizData = async () => {
            const quiz = await fetchQuizData();
            if (quiz) {
                setQuestions(quiz.questions);
            }
        };
        loadQuizData();
    }, [router]);

    // Timer effect
    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (!showResult && questions.length > 0 && !isMovingRef.current) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        // Timer expires and stays at 0, no auto transition
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [activeQuestion, showResult, questions.length]);

    const nextQuestion = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    
        // Proceed to the next question
        if (activeQuestion < questions.length - 1) {
            const newIndex = activeQuestion + 1;
            setActiveQuestion(newIndex);  // Move to the next question
            setTimeLeft(15);  // Reset the timer
    
            // Update the current_question_index in the quiz_state table
            const { data, error } = await supabase
                .from('quiz_state')
                .update({ current_question_index: newIndex })
                .eq('id', 1); // Assuming the record with `id = 1` stores the current quiz state
    
            if (error) {
                console.error('Error updating quiz state:', error.message);
            } else {
                console.log('Quiz state updated successfully:', data);
            }
        } else {
            handleFinish();
        }
    };
    

    const handleFinish = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        // Fetch top 3 scores from the leaderboard
        const { data, error } = await supabase
            .from('leaderboard')
            .select('nickname, score')
            .order('score', { ascending: false })
            .limit(3);  // Fetch the top 3 scores

        if (error) {
            setSubmitError('Error fetching leaderboard: ' + error.message);
        } else {
            setTopScores(data);
        }

        setShowResult(true);
    };

    const { question, answers } = questions[activeQuestion] || {};

    return (
        <div className="container">
            <h1>Quiz Page</h1>
            <div>
                <h2>
                    Question: {activeQuestion + 1} <span>/{questions.length}</span>
                </h2>
                {!showResult && questions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                            className="timer"
                            style={{
                                color: timeLeft <= 5 ? '#ff4444' : '#333',
                                fontWeight: 'bold',
                                fontSize: '1.5rem',
                                marginBottom: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: '#f8f9fa',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                display: 'inline-block',
                                minWidth: '200px',
                                textAlign: 'center',
                            }}
                        >
                            Time Remaining: {timeLeft}s
                        </div>
                        <div
                            style={{
                                fontSize: '0.9rem',
                                color: '#666',
                                textAlign: 'center',
                            }}
                        >
                            Correct answers earn 5 points + remaining seconds as bonus!
                        </div>
                    </div>
                )}
            </div>
            <div>
                {!showResult ? (
                    <div className="quiz-container">
                        {question ? (
                            <>
                                <h3>{question}</h3>
                                {answers &&
                                    answers.map((answer, idx) => (
                                        <li key={idx}>
                                            <span>{answer}</span>
                                        </li>
                                    ))}
                                <button onClick={nextQuestion} className="btn">
                                    {activeQuestion === questions.length - 1 ? 'Finish' : 'Next Question'}
                                </button>
                            </>
                        ) : (
                            <h3>Loading...</h3>
                        )}
                    </div>
                ) : (
                    <div className="quiz-container">
                        <h3>TOP 3</h3>

                        {/* Display Top 3 scores */}
                        {topScores.length > 0 ? (
                            <ul>
                                {topScores.map((score, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                                        <strong>{score.nickname}</strong>: {score.score} points
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No leaderboard data available.</p>
                        )}

                        {submitError && <p style={{ color: 'red', marginTop: '1rem' }}>{submitError}</p>}
                        
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;
