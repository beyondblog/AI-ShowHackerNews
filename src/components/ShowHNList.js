import React from 'react';
import ShowHNItem from './ShowHNItem';

function ShowHNList({ items }) {
    return (
        <div className="show-hn-list">
            {items.map((item, index) => (
                <ShowHNItem key={index} item={item} />
            ))}
        </div>
    );
}

export default ShowHNList;