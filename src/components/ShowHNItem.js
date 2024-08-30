import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ShowHNItem({ item }) {
    const [imageUrl, setImageUrl] = useState('');
    const [summary, setSummary] = useState('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(item.url)}`);
                const { image, description } = response.data.data;
                if (image && image.url) {
                    setImageUrl(image.url);
                }
                if (description) {
                    setSummary(description);
                }
            } catch (error) {
                console.error('Error fetching metadata:', error);
            }
        };

        fetchMetadata();
    }, [item.url]);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="show-hn-item">
            <div className="item-content">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="title">
                    {item.title}
                </a>
                {summary && <p className="summary">{summary}</p>}
                <div className="item-meta">
                    <span>{item.points} points</span>
                    <span>by {item.author}</span>
                    <a href={item.commentsLink} target="_blank" rel="noopener noreferrer" className="comments-link">
                        {item.comments} comments
                    </a>
                </div>
            </div>
            {imageUrl && !imageError && (
                <div className="item-image">
                    <img src={imageUrl} alt={item.title} onError={handleImageError} />
                </div>
            )}
        </div>
    );
}

export default ShowHNItem;