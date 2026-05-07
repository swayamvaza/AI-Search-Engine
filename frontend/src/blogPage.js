import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

function BlogPage() {
    const { id } = useParams(); // Gets the ID from the URL
    const [post, setPost] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/items/${id}`)
            .then(res => setPost(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!post) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Georgia, serif' }}>
            <Link to="/" style={{ color: '#999', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                <ArrowLeft size={16} /> Back to search
            </Link>
            <h1 style={{ fontSize: '3rem', fontFamily: 'Inter', fontWeight: '800' }}>{post.title}</h1>
            <hr style={{ margin: '40px 0', borderColor: '#eee' }} />
            <p style={{ fontSize: '1.25rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{post.content}</p>
        </div>
    );
}

export default BlogPage;