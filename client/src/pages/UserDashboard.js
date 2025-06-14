import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiCalendar, FiArchive, FiList, FiLogOut, FiHeart, FiFileText } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import api from '../utils/axios';

const UserDashboard = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [olderPosts, setOlderPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('latest');
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [subject, setSubject] = useState('');
  const [questionPapers, setQuestionPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [error, setError] = useState('');
  
  // Academic data states (for dropdowns only)
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [college, setCollege] = useState("");
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState("");
  const [branchError, setBranchError] = useState("");
  const [colleges, setColleges] = useState([]);
  const [semesterError, setSemesterError] = useState("");
  const [subjectError, setSubjectError] = useState("");

  // Add states for likes and share
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [shareLink, setShareLink] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    if (token) {
      dispatch(setUser({ user, token, role }));
    } else {
      navigate('/login');
    }
  }, [navigate, dispatch]);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/api/posts');
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
    fetchYears();
    fetchSemesters();
    fetchCourses();
    fetchSubjects();
    fetchColleges();
    fetchBranches();

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
        likedPosts={likedPosts}
        handleLike={handleLike}
        handleShare={handleShare}
      />
    ));
  };

  const fetchQuestionPapers = async () => {
    setLoadingPapers(true);
    setError('');
    try {
      const { data } = await api.get('/api/question-papers', {
        params: { year, semester, course, subject }
      });
      setQuestionPapers(data);
    } catch (err) {
      setError('Sorry, question papers are not available.');
    } finally {
      setLoadingPapers(false);
    }
  };

  const handleSearch = () => {
    fetchQuestionPapers();
  };

  // Academic data fetch functions (for dropdowns only)
  const fetchYears = async () => {
    try {
      const response = await api.get('/api/academic/years');
      setYears(response.data);
    } catch (err) {
      console.error('Error fetching years:', err);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await api.get('/api/academic/semesters');
      setSemesters(response.data);
    } catch (err) {
      setSemesterError('Failed to fetch semesters');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/academic/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/academic/subjects');
      setSubjects(response.data);
    } catch (err) {
      setSubjectError('Failed to fetch subjects');
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await api.get('/api/academic/colleges');
      setColleges(response.data);
    } catch (err) {
      console.error('Error fetching colleges:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/academic/branches');
      setBranches(response.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  useEffect(() => {
    fetchColleges();
    fetchCourses();
    fetchBranches();
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [semester, course]);

  // Add useEffect to fetch liked posts when component mounts
  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }
        const response = await axios.get('/api/posts/liked', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLikedPosts(new Set(response.data.map(post => post._id)));
      } catch (err) {
        console.error('Error fetching liked posts:', err);
      }
    };
    fetchLikedPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const isLiked = likedPosts.has(postId);
      const response = await axios.put(
        `/api/posts/${postId}/like`,
        { like: !isLiked },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update liked posts set
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      // Update posts with new like count
      setAllPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
      setLatestPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
      setOlderPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleShare = (postId) => {
    const shareUrl = `${window.location.origin}/shared-post/${postId}`;
    setShareLink(shareUrl);
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-indigo-100">
      {/* Mobile menu button */}
      <div className="lg:hidden bg-indigo-600 shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white hover:text-indigo-200 focus:outline-none"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar/Navigation */}
        <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-indigo-600 shadow-lg transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="p-4 border-b border-indigo-500">
            <h1 className="text-xl font-bold text-white">User Dashboard</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActiveSection('latest');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'latest' ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-500'}`}
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
                  className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'older' ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-500'}`}
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
                  className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'all' ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-500'}`}
                >
                  <FiList className="mr-3" />
                  <span>All Posts</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection('questionPaper');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'questionPaper' ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-500'}`}
                >
                  <FiList className="mr-3" />
                  <span>Question Papers</span>
                </button>
              </li>
              <li className="border-t border-indigo-500 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center p-2 text-indigo-100 rounded-lg hover:bg-indigo-500"
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
              <h1 className="text-2xl font-bold text-indigo-800">
                {activeSection === 'latest' && 'Latest Posts (Today)'}
                {activeSection === 'older' && 'Older Posts (5+ Days Ago)'}
                {activeSection === 'all' && 'All Posts'}
                {activeSection === 'questionPaper' && 'Question Papers'}
              </h1>
            </div>

            {loading && activeSection !== 'questionPaper' ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-indigo-600">Loading...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSection !== 'questionPaper' && renderPosts()}
              </div>
            )}

            {activeSection === 'questionPaper' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Search Question Papers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">College</label>
                    <select
                      value={college}
                      onChange={e => { setCollege(e.target.value); setCourse(""); setBranch(""); setSemester(""); setSubject(""); }}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select College</option>
                      {colleges.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                    <select
                      value={course}
                      onChange={e => { 
                        setCourse(e.target.value); 
                        setBranch(""); 
                        setSemester(""); 
                        setSubject(""); 
                      }}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!college}
                    >
                      <option value="">Select Program</option>
                      {courses.map(c => (
                        <option key={c._id} value={c.course}>{c.course}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                    <select
                      value={branch}
                      onChange={e => { setBranch(e.target.value); setSemester(""); setSubject(""); }}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!course}
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => (
                        <option key={b._id} value={b.branch}>{b.branch}</option>
                      ))}
                    </select>
                    {branchError && <div className="text-xs text-red-600 mt-1">{branchError}</div>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    <select
                      value={semester}
                      onChange={e => { setSemester(e.target.value); setSubject(""); }}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!course}
                    >
                      <option value="">Select Semester</option>
                      {semesters.map(s => (
                        <option key={s._id} value={s.semester}>{s.semester}</option>
                      ))}
                    </select>
                    {semesterError && <div className="text-xs text-red-600 mt-1">{semesterError}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!semester}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => (
                        <option key={s._id} value={s.subject}>{s.subject}</option>
                      ))}
                    </select>
                    {subjectError && <div className="text-xs text-red-600 mt-1">{subjectError}</div>}
                  </div>
                </div>
                
                <button
                  onClick={handleSearch}
                  className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  disabled={!college || !course || !branch || !semester || !subject}
                >
                  Search Question Papers
                </button>
                <div className="mt-6">
                  {loadingPapers ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-red-700">{error}</p>
                    </div>
                  ) : questionPapers.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Found {questionPapers.length} question paper(s)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {questionPapers.map((paper) => (
                          <div key={paper._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <h4 className="font-medium text-gray-900 mb-2">{paper.title}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><span className="font-medium">Year:</span> {paper.year}</p>
                              <p><span className="font-medium">Semester:</span> {paper.semester}</p>
                              <p><span className="font-medium">Course:</span> {paper.course}</p>
                              <p><span className="font-medium">Subject:</span> {paper.subject}</p>
                            </div>
                            {paper.file && (
                              <div className="mt-3">
                                <a
                                  href={`http://localhost:5000/uploads/${paper.file}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  View PDF
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No question papers found. Try adjusting your search criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu at the bottom */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-indigo-600 shadow-lg border-t border-indigo-500 z-50">
              <nav className="flex justify-around p-2">
                <button
                  onClick={() => setActiveSection('latest')}
                  className={`p-2 rounded-lg ${activeSection === 'latest' ? 'bg-indigo-700 text-white' : 'text-indigo-100'}`}
                >
                  <FiCalendar className="mx-auto mb-1" size={18} />
                  <span className="text-xs block">Latest</span>
                </button>
                <button
                  onClick={() => setActiveSection('older')}
                  className={`p-2 rounded-lg ${activeSection === 'older' ? 'bg-indigo-700 text-white' : 'text-indigo-100'}`}
                >
                  <FiArchive className="mx-auto mb-1" size={18} />
                  <span className="text-xs block">Older</span>
                </button>
                <button
                  onClick={() => setActiveSection('all')}
                  className={`p-2 rounded-lg ${activeSection === 'all' ? 'bg-indigo-700 text-white' : 'text-indigo-100'}`}
                >
                  <FiList className="mx-auto mb-1" size={18} />
                  <span className="text-xs block">All</span>
                </button>
                <button
                  onClick={() => setActiveSection('questionPaper')}
                  className={`p-2 rounded-lg ${activeSection === 'questionPaper' ? 'bg-indigo-700 text-white' : 'text-indigo-100'}`}
                >
                  <FiFileText className="mx-auto mb-1" size={18} />
                  <span className="text-xs block">Papers</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, socket, likedPosts, handleLike, handleShare }) => {
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
    return categories[category] || category?.toUpperCase();
  };

  const onLike = async () => {
    await handleLike(post._id);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-white">{post.title}</h3>
          {post.courseCategory && (
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
              {formatCategory(post.courseCategory)}
            </span>
          )}
        </div>
        {post.image && (
          <img src={`http://localhost:5000/uploads/${post.image}`} alt="Post" className="mt-2 max-h-40 rounded" />
        )}
        <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>
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
          <div className="flex items-center space-x-4">
            <button
              onClick={onLike}
              className={`flex items-center space-x-1 ${likedPosts.has(post._id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <FiHeart className={likedPosts.has(post._id) ? 'fill-current' : ''} />
              <span>{post.likes?.length || 0}</span>
            </button>
            <button
              onClick={() => handleShare(post._id)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;