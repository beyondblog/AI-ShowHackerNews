import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShowHNList from './components/ShowHNList';
import './App.css';

function App() {
    const [showHNItems, setShowHNItems] = useState([]);

    useEffect(() => {
        const fetchShowHNItems = async () => {
            try {
                const response = await axios.get('/api/showhn');
                setShowHNItems(response.data);
            } catch (error) {
                console.error('Error fetching Show HN items:', error);
            }
        };

        fetchShowHNItems();
    }, []);

    return (
        <div className="App">
            <h1>Hacker News - Show HN Aggregator <span className="blink">_</span></h1>
            <ShowHNList items={showHNItems} />
        </div>
    );
}

export default App;