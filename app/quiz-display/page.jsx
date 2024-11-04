'use client';
import React, { useState, useEffect } from 'react';
import { fetchQuizData } from '../fetchQuizData'; // Adjust the path if needed
import supabase from '../supabaseClient'; // Adjust the path if needed

const HostQuizPage = () => {
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [isQuizActive, setIsQuizActive] = useState(false);
    const [timer, setTimer] = useState(15); // Set timer for 15 seconds
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        const loadQuizData = async () => {
            const quiz = await fetchQuizData();
            if (quiz) {
                setQuestions(quiz.questions);
            }
        };
        loadQuizData();
    }, []);

    useEffect(() => {
        // Start the quiz when questions are loaded
        if (questions.length > 0) {
            handleStartQuiz();
        }
    }, [questions]);

    useEffect(() => {
        if (isQuizActive) {
            const id = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(id);
                        handleTimeUp(); // Handle when time is up
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            setIntervalId(id);
        }
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [isQuizActive]);

    const fetchLeaderboard = async () => {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(5); // Get top 5 players

        if (error) {
            console.error('Error fetching leaderboard:', error);
        } else {
            setLeaderboard(data);
        }
    };

    const handleTimeUp = async () => {
        if (activeQuestion < questions.length - 1) {
            setActiveQuestion((prev) => prev + 1); // Move to next question
            setTimer(15); // Reset timer for the next question
        } else {
            setShowResult(true);
            setIsQuizActive(false); // End quiz
            await fetchLeaderboard(); // Fetch leaderboard at the end
        }
    };

    const handleStartQuiz = async () => {
        setIsQuizActive(true);
        setActiveQuestion(0);
        setTimer(15); // Reset timer
        await supabase
            .from('quiz_state')
            .upsert({ id: 'your_quiz_state_id', is_active: true }); // Update quiz state
    };

    return (
        <div className='container'>
            <h1>Host Quiz Page</h1>
            {isQuizActive ? (
                <div>
                    <h2>
                        Question: {activeQuestion + 1} <span>/{questions.length}</span>
                    </h2>
                    <h3>Time Left: {timer}s</h3>
                    {showResult ? (
                        <div className='quiz-container'>
                            <h3>Quiz Over!</h3>
                            <h3>Leaderboard:</h3>
                            <ul>
                                {leaderboard.map((player) => (
                                    <li key={player.user_id}>
                                        {player.nickname}: {player.score}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className='quiz-container'>
                            {questions[activeQuestion] ? (
                                <>
                                    <h3>{questions[activeQuestion].question}</h3>
                                    <ul>
                                        {questions[activeQuestion].answers.map((answer, idx) => (
                                            <li key={idx}>{answer}</li>
                                        ))}
                                    </ul>
                                    {/* Removed Next Question button */}
                                </>
                            ) : (
                                <h3>Loading...</h3>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <h3>Loading questions...</h3>
            )}
        </div>
    );
};

export default HostQuizPage;
