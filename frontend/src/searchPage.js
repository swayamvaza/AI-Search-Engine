import React, { useState } from 'react';
import axios from 'axios';
import { Search, BookOpen, Zap, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom'; // This is new

function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/search', { query });
            setResults(response.data);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px' }}>
                <header style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '10px' }}>
                        CHIKUPIXELS <span style={{ color: '#888' }}>/ AI</span>
                    </h1>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>Semantic gateway to my photography & stories</p>
                </header>

                <div style={{ position: 'relative', marginBottom: '50px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f4f4f4', borderRadius: '16px', padding: '8px 16px' }}>
                        <Search size={22} color="#999" />
                        <input
                            type="text"
                            placeholder="Search by vibe..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '12px', fontSize: '1.1rem' }}
                        />
                        <button onClick={handleSearch} style={{ backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 25px', fontWeight: '600', cursor: 'pointer' }}>
                            {loading ? 'Searching...' : 'Explore'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '24px' }}>
                    {results.map((item) => (
                        <Link to={`/blog/${item._id}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ border: '1px solid #eaeaea', borderRadius: '20px', padding: '30px', backgroundColor: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <BookOpen size={18} color="#000" />
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>{item.title}</h3>
                                    </div>
                                    <div style={{ background: '#f0f0f0', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem' }}>
                                        {Math.round(item.score * 100)}% Match
                                    </div>
                                </div>
                                <p style={{ color: '#444', lineHeight: '1.7' }}>{item.content.substring(0, 200)}...</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#007bff', marginTop: '15px' }}>
                                    Read Full Story <ArrowUpRight size={16} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SearchPage;