import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShowHNList from './components/ShowHNList';
import './App.css';

function App() {
    const [showHNItems, setShowHNItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShowHNItems = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/showhn');
                setShowHNItems(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching Show HN items:', error);
                setError('Failed to fetch data. Please try again later.');
                setIsLoading(false);
            }
        };

        fetchShowHNItems();
    }, []);

    return (
        <div className="App">
            <h1>Hacker News - Show HN Aggregator <span className="blink">_</span></h1>
            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <ShowHNList items={showHNItems} />
            )}
        </div>
    );
}

export default App;