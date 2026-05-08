import React, { useState } from 'react';
import axios from 'axios';
import { Search, Globe, Zap, Database, Activity, Monitor, HardDrive, ZoomInIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setResults([]);
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
        <div style={{
            backgroundColor: '#5A7EDC',
            minHeight: '100vh',
            fontFamily: 'Tahoma, sans-serif',
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            <div style={{
                width: '850px',
                backgroundColor: '#ECE9D8',
                border: '3px solid #0054E3',
                borderRadius: '8px 8px 0 0',
                boxShadow: '8px 8px 15px rgba(0,0,0,0.3)',
                overflow: 'hidden'
            }}>

                {/* XP TITLE BAR */}
                <div style={{
                    background: 'linear-gradient(to bottom, #0058EE 0%, #3784F5 100%)',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'white',
                    fontWeight: 'bold',
                    textShadow: '1px 1px #000',
                    borderBottom: '1px solid #003399'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                        <Monitor size={14} color="white" />
                        <span>Lynx Intelligence - Neural Engine v1.02</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <WindowButton label="_" />
                        <WindowButton label="□" />
                        <WindowButton label="X" color="#E81123" />
                    </div>
                </div>

                <div style={{padding: '30px'}}>
                    {/* LOGO AREA */}
                    <header style={{ textAlign: 'center', marginBottom: '40px', padding: '10px 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '20px', textAlign: 'left' }}>
                            <div style={{ padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ZoomInIcon size={52} color="#716F64" strokeWidth={1.5}/>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h1 style={{
                                    fontSize: '2.8rem',
                                    fontWeight: '900',
                                    color: '#003399',
                                    margin: 0,
                                    fontStyle: 'italic',
                                    lineHeight: '1.1',
                                    letterSpacing: '-1.5px'
                                }}>
                                    Lynx<span style={{color: '#FF6600'}}>Engine</span>
                                </h1>
                                <p style={{ fontSize: '0.75rem', color: '#444', fontWeight: 'bold', margin: '4px 0 0 2px' }}>
                                    A novice AI-powered search engine by {' '}
                                    <a
                                        href="https://github.com/swayamvaza/AI-Search-Engine"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="header-link"
                                        style={{ color: '#0000CC', textDecoration: 'underline' }}
                                    >
                                        Swayam Kumar
                                    </a>
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* SEARCH INTERFACE */}
                    <div style={{
                        backgroundColor: '#FFF',
                        border: '2px inset #fff',
                        padding: '15px',
                        marginBottom: '30px',
                        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    border: '1px solid #7F9DB9',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                                placeholder="Type a query for the neural network..."
                            />
                            <button onClick={handleSearch} style={{
                                background: 'linear-gradient(to bottom, #F0F0F0, #D1D1D1)',
                                border: '1px solid #707070',
                                padding: '0 20px',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                height: '35px'
                            }}>
                                {loading ? 'BUSY...' : 'SEARCH'}
                            </button>
                        </div>
                    </div>

                    {/* RESULTS LIST */}
                    <div style={{
                        backgroundColor: '#FFF',
                        border: '2px inset #fff',
                        height: '400px',
                        overflowY: 'scroll',
                        padding: '15px'
                    }}>
                        {loading && (
                            <div style={{textAlign: 'center', padding: '40px'}}>
                                <Activity size={24} style={{animation: 'spin 1s linear infinite'}}/>
                                <p style={{fontSize: '0.8rem', fontWeight: 'bold', marginTop: '10px'}}>Searching Nodes...</p>
                            </div>
                        )}

                        {results.map((item) => (
                            <div key={item._id} style={{
                                display: 'flex',
                                gap: '15px',
                                marginBottom: '20px',
                                borderBottom: '1px solid #ECE9D8',
                                paddingBottom: '15px'
                            }}>
                                <div style={{
                                    width: '120px', height: '80px',
                                    border: '1px solid #999', backgroundColor: '#F5F5F5',
                                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {item.thumbnail ? (
                                        <img
                                            src={item.thumbnail}
                                            alt="media"
                                            referrerPolicy="no-referrer"
                                            style={{
                                                width: '100%', height: '100%',
                                                objectFit: item.thumbnail.includes('.svg') ? 'contain' : 'cover'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML = '<span style="font-size: 8px; color: #999;">MEDIA_NULL</span>';
                                            }}
                                        />
                                    ) : (
                                        <span style={{fontSize: '8px', color: '#999'}}>NO_IMAGE</span>
                                    )}
                                </div>

                                <div style={{flex: 1}}>
                                    <Link to={`/blog/${item._id}`} style={{
                                        color: '#0000CC', textDecoration: 'underline', fontSize: '1rem', fontWeight: 'bold'
                                    }}>
                                        {item.title}
                                    </Link>
                                    <p style={{fontSize: '0.8rem', color: '#333', margin: '5px 0'}}>
                                        {item.content.substring(0, 160)}...
                                    </p>
                                    <div style={{fontSize: '0.7rem', color: '#008000'}}>
                                        <b>Vector Match:</b> {Math.round(item.score * 100)}% |
                                        <b> Ref: </b>
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ref-link"
                                            style={{ color: '#008000', textDecoration: 'underline' }}
                                        >
                                            {item.url.substring(0, 45)}{item.url.length > 45 ? '...' : ''}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <footer style={{
                    backgroundColor: '#ECE9D8', borderTop: '1px solid #ACA899',
                    padding: '3px 10px', fontSize: '0.7rem', color: '#000',
                    display: 'flex', justifyContent: 'space-between'
                }}>
                    <div style={{borderRight: '1px solid #ACA899', paddingRight: '10px'}}>
                        {loading ? "Searching..." : "Ready"}
                    </div>
                    <div>Local Intranet | 100%</div>
                </footer>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .ref-link:hover { color: #004d00 !important; }
                .header-link:hover { color: #ff6600 !important; }
            `}</style>
        </div>
    );
}

const WindowButton = ({label, color}) => (
    <div style={{
        width: '22px', height: '22px', backgroundColor: color || '#3784F5',
        border: '1px solid #fff', borderRadius: '3px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '10px',
        fontWeight: 'bold', cursor: 'pointer', boxShadow: '1px 1px 1px rgba(0,0,0,0.3)'
    }}>{label}</div>
);

export default SearchPage;