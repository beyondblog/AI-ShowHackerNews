import React, { useState } from 'react';

function ShowHNItem({ item }) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="show-hn-item">
            <div className="item-content">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="title">
                    {item.title}
                </a>
                {item.summary && <p className="summary">{item.summary}</p>}
                <div className="item-meta">
                    <span>{item.points} points</span>
                    <span>by {item.author}</span>
                    <a href={item.commentsLink} target="_blank" rel="noopener noreferrer" className="comments-link">
                        {item.comments} comments
                    </a>
                </div>
            </div>
            {item.image && !imageError && (
                <div className="item-image">
                    <img src={item.image} alt={item.title} onError={handleImageError} />
                </div>
            )}
        </div>
    );
}

export default ShowHNItem;