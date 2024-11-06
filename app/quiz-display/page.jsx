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
        const loadQuizData = async () => {
            const quiz = await fetchQuizData();
            if (quiz) {
                setQuestions(quiz.questions);
            }
        };
        loadQuizData();
    }, [router]);

    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (!showResult && questions.length > 0 && !isMovingRef.current) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
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
    
        if (activeQuestion < questions.length - 1) {
            const newIndex = activeQuestion + 1;
            setActiveQuestion(newIndex);
            setTimeLeft(15);
    
            const { error } = await supabase
                .from('quiz_state')
                .update({ current_question_index: newIndex })
                .eq('id', 1);
    
            if (error) {
                console.error('Error updating quiz state:', error.message);
            }
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        const { data, error } = await supabase
            .from('leaderboard')
            .select('nickname, score')
            .order('score', { ascending: false })
            .limit(3);

        if (error) {
            setSubmitError('Error fetching leaderboard: ' + error.message);
        } else {
            setTopScores(data);
        }

        setShowResult(true);
    };

    const { question, answers } = questions[activeQuestion] || {};

    const getMedalEmoji = (index) => {
        const medals = ['🥇', '🥈', '🥉'];
        return medals[index] || '';
    };

    return (
        <div className="container">
            <div className="logo"></div>
            <h1>Quiz Host Panel</h1>
            <div>
                <h2>
                    Question: {activeQuestion + 1}<span>/{questions.length}</span>
                </h2>
                {!showResult && questions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="timer">
                            Time Remaining: {timeLeft}s
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            color: '#fff',
                            textAlign: 'center',
                        }}>
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
                                        <li key={idx} className="li-hover">
                                            <span>{answer}</span>
                                        </li>
                                    ))}
                                <button onClick={nextQuestion}>
                                    {activeQuestion === questions.length - 1 ? 'Show Results' : 'Next Question'}
                                </button>
                            </>
                        ) : (
                            <h3>Loading...</h3>
                        )}
                    </div>
                ) : (
                    <div className="quiz-container">
                        <h3>🏆 Leaderboard</h3>
                        {topScores.length > 0 ? (
                            <div className="leaderboard">
                                {topScores.map((score, idx) => (
                                    <div key={idx} className="leaderboard-item">
                                        <div>
                                            {getMedalEmoji(idx)} <strong>{score.nickname}</strong>
                                        </div>
                                        <div style={{ 
                                            fontWeight: 'bold',
                                            color: '#0066ff'
                                        }}>
                                            {score.score} points
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#666' }}>
                                No scores available yet
                            </p>
                        )}
                        {submitError && (
                            <div className="error-message">
                                {submitError}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;
