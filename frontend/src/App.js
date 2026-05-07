import React from 'react';
import { Routes, Route } from 'react-router-dom'; // No need for Router here
import SearchPage from './searchPage'; // Change 'S' to 's'
import BlogPage from './blogPage';     // Change 'B' to 'b'

function App() {
    return (
        <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/blog/:id" element={<BlogPage />} />
        </Routes>
    );
}

export default App;