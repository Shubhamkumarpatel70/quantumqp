import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SharedPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setPost(data);
      } catch (err) {
        setError('Post not found or has been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><span>Loading...</span></div>;
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center h-64 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full">
        <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
        <div className="mb-2 text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</div>
        {post.image && (
          <img src={`http://localhost:5000/uploads/${post.image}`} alt="Post" className="mb-4 max-h-60 rounded" />
        )}
        <p className="mb-4 text-gray-700">{post.content}</p>
        {post.link && (
          <div className="mb-2">
            <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Preview Link</a>
          </div>
        )}
        {post.file && (
          <div className="mt-4">
            {!showPdf ? (
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => setShowPdf(true)}
              >
                View PDF
              </button>
            ) : (
              <div className="mt-4">
                <embed
                  src={`http://localhost:5000/uploads/${post.file}`}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                />
                <div className="mt-2">
                  <a
                    href={`http://localhost:5000/uploads/${post.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Open PDF in new tab
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedPost; 