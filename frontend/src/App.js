import React, { useState } from 'react';
import axios from 'axios';
import { Search, Camera, Zap } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Connects to your backend on port 5000
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

          {/* Header Section */}
          <header style={{ marginBottom: '60px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '10px' }}>
              CHIKUPIXELS <span style={{ color: '#888' }}>/ AI</span>
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>Semantic search for your photography collection</p>
          </header>

          {/* Search Bar Container */}
          <div style={{ position: 'relative', marginBottom: '50px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f4f4f4',
              borderRadius: '16px',
              padding: '12px 24px',
              border: '2px solid transparent',
              transition: '0.3s'
            }}>
              <Search size={22} color="#999" />
              <input
                  type="text"
                  placeholder="Search by vibe (e.g. 'moody mountain shadows' or 'street silhouettes')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '12px',
                    fontSize: '1.1rem',
                    marginLeft: '10px'
                  }}
              />
              <button
                  onClick={handleSearch}
                  style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 25px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
              >
                {loading ? 'Finding...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ display: 'grid', gap: '24px' }}>
            {results.length > 0 ? results.map((item) => (
                <div key={item._id} style={{
                  border: '1px solid #eaeaea',
                  borderRadius: '20px',
                  padding: '30px',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Camera size={18} color="#007bff" />
                      <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>{item.title}</h3>
                    </div>
                    <div style={{
                      background: '#e7f3ff',
                      color: '#007bff',
                      padding: '6px 14px',
                      borderRadius: '30px',
                      fontSize: '0.85rem',
                      fontWeight: '700'
                    }}>
                      {Math.round(item.score * 100)}% Match
                    </div>
                  </div>
                  <p style={{ color: '#444', lineHeight: '1.7', fontSize: '1.05rem', margin: 0 }}>{item.content}</p>
                </div>
            )) : !loading && query && (
                <div style={{ textAlign: 'center', marginTop: '40px', color: '#999' }}>
                  <Zap size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                  <p>No direct concept found. Try a different mood!</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default App;