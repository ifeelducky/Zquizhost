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
    const [timer, setTimer] = useState(30); // Set timer for 30 seconds
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
        if (isQuizActive && timer > 0) {
            const id = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            setIntervalId(id);
        } else if (timer === 0) {
            handleTimeUp(); // Handle when time is up
        }
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [isQuizActive, timer]);

    const fetchLeaderboard = async () => {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(3); // Get top 3 players

        if (error) {
            console.error('Error fetching leaderboard:', error);
        } else {
            setLeaderboard(data);
        }
    };

    const handleTimeUp = async () => {
        setIsQuizActive(false);
        await fetchLeaderboard(); // Fetch leaderboard when time is up
        setShowResult(true); // Show results
    };

    const handleNextQuestion = async () => {
        if (activeQuestion < questions.length - 1) {
            const nextQuestionIndex = activeQuestion + 1;
            setActiveQuestion(nextQuestionIndex);
            setTimer(30); // Reset timer for the next question
        } else {
            setShowResult(true);
            setIsQuizActive(false); // End quiz
            await fetchLeaderboard(); // Fetch leaderboard at the end
        }
    };

    const handleStartQuiz = async () => {
        setIsQuizActive(true);
        setActiveQuestion(0);
        setTimer(30); // Reset timer
        await supabase
            .from('quiz_state')
            .upsert({ id: 'your_quiz_state_id', current_question: 0, is_active: true });
    };

    return (
        <div className='container'>
            <h1>Host Quiz Page</h1>
            {!isQuizActive ? (
                <button onClick={handleStartQuiz} className='btn'>Start Quiz</button>
            ) : (
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
                                    <button onClick={handleNextQuestion} className='btn'>Next Question</button>
                                </>
                            ) : (
                                <h3>Loading...</h3>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HostQuizPage;
