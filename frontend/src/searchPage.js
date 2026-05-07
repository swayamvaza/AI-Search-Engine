import React, {useState} from 'react';
import axios from 'axios';
import {Search, BookOpen, Zap, ArrowUpRight} from 'lucide-react';
import {Link} from 'react-router-dom'; // This is new

function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setResults([]); // Clear the screen
        setLoading(true); // Show a "Hunting the web..." spinner
        try {
            const response = await axios.post('http://localhost:5000/search', {query});
            setResults(response.data);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{backgroundColor: '#ffffff', minHeight: '100vh', color: '#1a1a1a', fontFamily: 'Inter, sans-serif'}}>
            <div style={{maxWidth: '900px', margin: '0 auto', padding: '60px 20px'}}>
                <header style={{marginBottom: '60px', textAlign: 'center'}}>
                    <h1 style={{fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '10px'}}>
                        CHIKUPIXELS <span style={{color: '#888'}}>/ AI</span>
                    </h1>
                    <p style={{color: '#666', fontSize: '1.1rem'}}>Semantic gateway to my photography & stories</p>
                </header>

                <div style={{position: 'relative', marginBottom: '50px'}}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#f4f4f4',
                        borderRadius: '16px',
                        padding: '8px 16px'
                    }}>
                        <Search size={22} color="#999"/>
                        <input
                            type="text"
                            placeholder="Search by vibe..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                padding: '12px',
                                fontSize: '1.1rem'
                            }}
                        />
                        <button onClick={handleSearch} style={{
                            backgroundColor: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 25px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            {loading ? 'Searching...' : 'Explore'}
                        </button>
                    </div>
                </div>
                {/* LOADING / HUNTER MODE STATUS */}
                {loading && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: '#fafafa',
                        borderRadius: '20px',
                        border: '2px dashed #ddd',
                        marginBottom: '30px'
                    }}>
                        <div className="spinner" style={{
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #000',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            margin: '0 auto 15px',
                            animation: 'spin 1s linear infinite'
                        }}/>
                        <h3 style={{margin: 0, color: '#333'}}>AI is scouting the web...</h3>
                        <p style={{color: '#777', marginTop: '8px'}}>
                            No direct match found in Chikupixels. Searching Wikipedia and generating embeddings for
                            "{query}"
                        </p>
                    </div>
                )}
                <div style={{display: 'grid', gap: '24px'}}>
                    {results.map((item) => (
                        <Link to={`/blog/${item._id}`} key={item._id}
                              style={{textDecoration: 'none', color: 'inherit'}}>
                            <div style={{
                                border: '1px solid #eaeaea',
                                borderRadius: '24px',
                                backgroundColor: '#fff',
                                display: 'flex', // Side-by-side layout
                                overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer'
                            }}
                                 onMouseEnter={(e) => {
                                     e.currentTarget.style.transform = 'translateY(-4px)';
                                     e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                                 }}
                                 onMouseLeave={(e) => {
                                     e.currentTarget.style.transform = 'translateY(0)';
                                     e.currentTarget.style.boxShadow = 'none';
                                 }}>

                                {/* IMAGE SECTION */}
                                <div style={{width: '220px', minWidth: '220px', height: 'auto', background: '#f0f0f0'}}>
                                    <img
                                        src={item.thumbnail || "https://placehold.co/600x400/f4f4f4/999999?text=Chikupixels+Media"}
                                        alt={item.title}
                                        referrerPolicy="no-referrer" // <--- ADD THIS LINE
                                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/600x400/f4f4f4/999999?text=Chikupixels+Media";
                                        }}
                                    />
                                </div>

                                {/* TEXT SECTION */}
                                <div style={{padding: '24px', flex: 1}}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '10px'
                                    }}>
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: '1.25rem',
                                            fontWeight: '800',
                                            color: '#000'
                                        }}>{item.title}</h3>
                                        <div style={{
                                            background: '#000',
                                            color: '#fff',
                                            padding: '4px 12px',
                                            borderRadius: '30px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {Math.round(item.score * 100)}%
                                        </div>
                                    </div>

                                    <p style={{
                                        color: '#555',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        marginBottom: '15px'
                                    }}>
                                        {item.content.substring(0, 160)}...
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        color: '#007bff',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}>
                                        View Perspective <ArrowUpRight size={14}/>
                                    </div>
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