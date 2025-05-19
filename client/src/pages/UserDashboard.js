import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiCalendar, FiArchive, FiList, FiLogOut, FiHeart } from 'react-icons/fi';
import { io } from 'socket.io-client';

const UserDashboard = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [olderPosts, setOlderPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('latest');
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/posts');
      const today = new Date();
      const latest = [];
      const older = [];

      data.forEach(post => {
        const postDate = new Date(post.createdAt);
        const diffTime = Math.abs(today - postDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          latest.push(post);
        } else if (diffDays >= 5) {
          older.push(post);
        }
      });

      setLatestPosts(latest);
      setOlderPosts(older);
      setAllPosts(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    if (socket) {
      socket.on('postUpdated', (updatedPost) => {
        setAllPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === updatedPost._id ? updatedPost : post
          )
        );
        setLatestPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === updatedPost._id ? updatedPost : post
          )
        );
        setOlderPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === updatedPost._id ? updatedPost : post
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('postUpdated');
      }
    };
  }, [socket]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderPosts = () => {
    const postsToRender = 
      activeSection === 'latest' ? latestPosts :
      activeSection === 'older' ? olderPosts :
      allPosts;

    if (postsToRender.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500">
            {activeSection === 'latest' && 'No new posts today.'}
            {activeSection === 'older' && 'No older posts.'}
            {activeSection === 'all' && 'No posts found.'}
          </p>
        </div>
      );
    }

    return postsToRender.map((post) => (
      <PostCard 
        key={post._id} 
        post={post} 
        socket={socket}
        onLike={fetchPosts} // Optional: refetch posts after like
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar/Navigation */}
        <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">User Dashboard</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActiveSection('latest');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'latest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <FiCalendar className="mr-3" />
                  <span>Latest Posts</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection('older');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'older' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <FiArchive className="mr-3" />
                  <span>Older Posts</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection('all');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <FiList className="mr-3" />
                  <span>All Posts</span>
                </button>
              </li>
              <li className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <FiLogOut className="mr-3" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-6">
            {/* Desktop header */}
            <div className="hidden lg:flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeSection === 'latest' && 'Latest Posts (Today)'}
                {activeSection === 'older' && 'Older Posts (5+ Days Ago)'}
                {activeSection === 'all' && 'All Posts'}
              </h1>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderPosts()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, socket }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const formatCategory = (category) => {
    const categories = {
      btech: 'BTech',
      bca: 'BCA',
      mca: 'MCA',
      mba: 'MBA',
      other: 'Other'
    };
    return categories[category] || category.toUpperCase();
  };

  const handleLike = async () => {
    try {
      const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;
      setLikeCount(newLikeCount);
      setIsLiked(!isLiked);

      await axios.put(`http://localhost:5000/api/posts/${post._id}/like`, {
        like: !isLiked
      });

      if (socket) {
        socket.emit('likePost', {
          postId: post._id,
          likes: newLikeCount
        });
      }
    } catch (err) {
      console.error('Failed to like post:', err);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
      setIsLiked(isLiked);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800">{post.title}</h3>
          {post.courseCategory && (
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
              {formatCategory(post.courseCategory)}
            </span>
          )}
        </div>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>

        {/* File Download Button */}
        {post.file && (
          <div className="mt-4">
            <a
              href={`http://localhost:5000/uploads/${post.file}`}
              download
              className="text-blue-500 hover:underline"
            >
              Download File
            </a>
          </div>
        )}

        {/* Link Preview Button */}
        {post.link && (
          <div className="mt-4">
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Preview Link
            </a>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Posted on: {postDate}
          </div>
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            <FiHeart className={isLiked ? 'fill-current' : ''} />
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;