import React, { useState } from 'react';
import axios from 'axios';
import { Search, Image as ImageIcon, MapPin } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/search', { query });
      setResults(response.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <header style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h1 style={{ fontWeight: '800', letterSpacing: '-1px', fontSize: '2.5rem' }}>VISUAL DIARY</h1>
            <p style={{ color: '#666' }}>AI-Powered Semantic Search for your Photography</p>
          </header>

          <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by mood or concept (e.g. 'shadows in the city')"
                style={{ flex: 1, border: 'none', outline: 'none', padding: '10px', fontSize: '1rem' }}
            />
            <button
                onClick={handleSearch}
                style={{ backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {loading ? '...' : <Search size={20} />}
            </button>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {results.length === 0 && !loading && (
                <p style={{ textAlign: 'center', color: '#999' }}>Enter a concept to see AI in action.</p>
            )}

            {results.map((item) => (
                <div key={item._id} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem' }}>{item.title}</h3>
                    <span style={{ fontSize: '0.8rem', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
                  {Math.round(item.score * 100)}% Match
                </span>
                  </div>
                  <p style={{ color: '#444', lineHeight: '1.6', margin: '0' }}>{item.content}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}

export default App;