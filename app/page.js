// app/host/page.js
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
        } else {
            localStorage.setItem('isHost', 'true');
            router.push('/start-quiz');
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
