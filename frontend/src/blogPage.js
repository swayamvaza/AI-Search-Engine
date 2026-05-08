import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, Printer, Search, Globe, HelpCircle } from 'lucide-react';

function BlogPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/items/${id}`)
            .then(res => setPost(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!post) return (
        <div style={{ backgroundColor: '#5A7EDC', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#ECE9D8', padding: '20px', border: '2px solid #0054E3', fontWeight: 'bold' }}>
                LOADING DATASET...
            </div>
        </div>
    );

    return (
        <div style={{
            backgroundColor: '#5A7EDC', // Deep XP Blue Desktop
            minHeight: '100vh',
            fontFamily: 'Tahoma, sans-serif',
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            {/* DOCUMENT WINDOW */}
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
                        <FileText size={14} color="white" />
                        <span>{post.title} - Vectra Document Viewer</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <div style={winBtnStyle}>_</div>
                        <div style={winBtnStyle}>□</div>
                        <div style={{ ...winBtnStyle, backgroundColor: '#E81123' }}>X</div>
                    </div>
                </div>

                {/* NAVIGATION TOOLBAR */}
                <div style={{
                    padding: '5px 10px',
                    borderBottom: '1px solid #ACA899',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    backgroundColor: '#F1F1F1'
                }}>
                    <Link to="/" style={{
                        textDecoration: 'none',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        border: '1px solid transparent'
                    }}
                          onMouseEnter={(e) => e.currentTarget.style.border = '1px outset #fff'}
                          onMouseLeave={(e) => e.currentTarget.style.border = '1px solid transparent'}
                    >
                        <ArrowLeft size={14} /> <b>Back</b>
                    </Link>
                    <div style={dividerStyle} />
                    <Printer size={16} color="#666" />
                    <Search size={16} color="#666" />
                    <HelpCircle size={16} color="#666" />
                    <div style={{ flex: 1 }} />
                    <Globe size={16} color="#008000" />
                </div>

                {/* CONTENT AREA */}
                <div style={{ padding: '30px', backgroundColor: '#FFF', margin: '15px', border: '2px inset #fff', minHeight: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h1 style={{
                            fontSize: '2.2rem',
                            color: '#000',
                            margin: '0 0 20px 0',
                            fontFamily: 'Tahoma',
                            fontWeight: 'bold',
                            letterSpacing: '-1px'
                        }}>
                            {post.title}
                        </h1>
                        {post.thumbnail && (
                            <div style={{ border: '4px double #ACA899', padding: '2px', backgroundColor: '#fff' }}>
                                <img
                                    src={post.thumbnail}
                                    alt="entry-media"
                                    style={{ maxWidth: '200px', height: 'auto', display: 'block' }}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{
                        borderTop: '1px solid #ECE9D8',
                        paddingTop: '20px',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        color: '#333',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'Tahoma, sans-serif'
                    }}>
                        {post.content}
                    </div>
                </div>

                {/* SYSTEM STATUS BAR */}
                <footer style={{
                    backgroundColor: '#ECE9D8',
                    borderTop: '1px solid #ACA899',
                    padding: '3px 10px',
                    fontSize: '0.7rem',
                    color: '#000',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <div>Address: {post.url || 'Internal System Storage'}</div>
                    <div style={{ borderLeft: '1px solid #ACA899', paddingLeft: '10px' }}>
                        Neural Link: Active
                    </div>
                </footer>
            </div>
        </div>
    );
}

// Styling Constants
const winBtnStyle = {
    width: '22px',
    height: '22px',
    backgroundColor: '#3784F5',
    border: '1px solid #fff',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '1px 1px 1px rgba(0,0,0,0.3)'
};

const dividerStyle = {
    width: '1px',
    height: '20px',
    backgroundColor: '#ACA899',
    margin: '0 5px'
};

export default BlogPage;