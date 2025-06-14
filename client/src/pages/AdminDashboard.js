import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  FiMenu, FiX, FiHome, FiPlusSquare, FiUsers,
  FiFileText, FiLogOut
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [courseCategory, setCourseCategory] = useState('btech');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0); // Define activeUsers state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  // Academic data states
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newYear, setNewYear] = useState('');
  const [newSemester, setNewSemester] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [academicError, setAcademicError] = useState('');
  const [academicSuccess, setAcademicSuccess] = useState('');
  const [colleges, setColleges] = useState([]);
  const [newCollege, setNewCollege] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [batch, setBatch] = useState("");
  const [specializations, setSpecializations] = useState([
    "AI & ML",
    "Data Science",
    "Cyber Security",
    "IoT",
    "Cloud Computing"
  ]);
  const [newSpecialization, setNewSpecialization] = useState("");

  // Branches state and fetch
  const [branches, setBranches] = useState([]);
  const [newBranch, setNewBranch] = useState("");
  const [branchError, setBranchError] = useState("");
  const [branchSuccess, setBranchSuccess] = useState("");

  const [semesterError, setSemesterError] = useState("");

  // Add online users state
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/posts'),
        axios.get('http://localhost:5000/api/users')
      ]);
      setPosts(postsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchYears = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/academic/years');
      setYears(response.data);
    } catch (err) {
      console.error('Error fetching years:', err);
    }
  };

  const addYear = async (e) => {
    e.preventDefault();
    setAcademicError('');
    setAcademicSuccess('');
    
    if (!newYear.trim()) {
      setAcademicError('Year is required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/academic/years', { year: newYear });
      setAcademicSuccess('Year added successfully!');
      setNewYear('');
      fetchYears();
    } catch (err) {
      setAcademicError(err.response?.data?.error || 'Failed to add year');
    }
  };

  const deleteYear = async (id) => {
    if (window.confirm('Are you sure you want to delete this year?')) {
      try {
        await axios.delete(`http://localhost:5000/api/academic/years/${id}`);
        fetchYears();
      } catch (err) {
        console.error('Error deleting year:', err);
      }
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/academic/semesters');
      setSemesters(response.data);
    } catch (err) {
      setSemesterError('Failed to fetch semesters');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/academic/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const params = {};
      if (selectedCourse) params.course = selectedCourse;
      if (selectedSemester) params.semester = selectedSemester;
      
      const response = await axios.get('http://localhost:5000/api/academic/subjects', { params });
      setSubjects(response.data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const addSemester = async (e) => {
    e.preventDefault();
    setAcademicError('');
    setAcademicSuccess('');
    
    if (!newSemester.trim()) {
      setAcademicError('Semester is required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/academic/semesters', { semester: newSemester });
      setAcademicSuccess('Semester added successfully!');
      setNewSemester('');
      fetchSemesters();
    } catch (err) {
      setAcademicError(err.response?.data?.error || 'Failed to add semester');
    }
  };

  const addCourse = async (e) => {
    e.preventDefault();
    setAcademicError('');
    setAcademicSuccess('');
    
    if (!newCourse.trim()) {
      setAcademicError('Course is required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/academic/courses', { course: newCourse });
      setAcademicSuccess('Course added successfully!');
      setNewCourse('');
      fetchCourses();
    } catch (err) {
      setAcademicError(err.response?.data?.error || 'Failed to add course');
    }
  };

  const addSubject = async (e) => {
    e.preventDefault();
    setAcademicError('');
    setAcademicSuccess('');
    
    if (!newSubject.trim() || !selectedCourse || !selectedSemester) {
      setAcademicError('Subject, course, and semester are required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/academic/subjects', { 
        subject: newSubject,
        course: selectedCourse,
        semester: selectedSemester
      });
      setAcademicSuccess('Subject added successfully!');
      setNewSubject('');
      fetchSubjects();
    } catch (err) {
      setAcademicError(err.response?.data?.error || 'Failed to add subject');
    }
  };

  const deleteSemester = async (id) => {
    if (window.confirm('Are you sure you want to delete this semester?')) {
      try {
        await axios.delete(`http://localhost:5000/api/academic/semesters/${id}`);
        fetchSemesters();
      } catch (err) {
        console.error('Error deleting semester:', err);
      }
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`http://localhost:5000/api/academic/courses/${id}`);
        fetchCourses();
      } catch (err) {
        console.error('Error deleting course:', err);
      }
    }
  };

  const deleteSubject = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await axios.delete(`http://localhost:5000/api/academic/subjects/${id}`);
        fetchSubjects();
      } catch (err) {
        console.error('Error deleting subject:', err);
      }
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/academic/colleges');
      setColleges(response.data);
    } catch (err) {
      console.error('Error fetching colleges:', err);
    }
  };

  const addCollege = async (e) => {
    e.preventDefault();
    setAcademicError('');
    setAcademicSuccess('');
    
    if (!newCollege.trim()) {
      setAcademicError('College name is required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/academic/colleges', { name: newCollege });
      setAcademicSuccess('College added successfully!');
      setNewCollege('');
      fetchColleges();
    } catch (err) {
      setAcademicError(err.response?.data?.error || 'Failed to add college');
    }
  };

  const deleteCollege = async (id) => {
    if (window.confirm('Are you sure you want to delete this college?')) {
      try {
        await axios.delete(`http://localhost:5000/api/academic/colleges/${id}`);
        fetchColleges();
      } catch (err) {
        console.error('Error deleting college:', err);
      }
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/academic/branches');
      setBranches(response.data);
    } catch (err) {
      setBranchError('Failed to fetch branches');
    }
  };

  const addBranch = async (e) => {
    e.preventDefault();
    setBranchError("");
    setBranchSuccess("");
    if (!newBranch.trim()) {
      setBranchError('Branch is required');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/academic/branches', { branch: newBranch });
      setBranchSuccess('Branch added successfully!');
      setNewBranch("");
      fetchBranches();
    } catch (err) {
      setBranchError(err.response?.data?.error || 'Failed to add branch');
    }
  };

  const deleteBranch = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await axios.delete(`http://localhost:5000/api/academic/branches/${id}`);
        fetchBranches();
      } catch (err) {
        setBranchError('Failed to delete branch');
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchYears();
    fetchSemesters();
    fetchCourses();
    fetchColleges();
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [selectedCourse, selectedSemester]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };
  useEffect(() => {
    fetchData();

    // Connect to the Socket.io server
    const socket = io('http://localhost:5000/'); // Replace with your backend URL if hosted elsewhere

    // Listen for active users count
    socket.on('activeUsers', (count) => {
      setActiveUsers(count);
    });

    // Listen for online users
    socket.on('userConnected', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socket.on('userDisconnected', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

 const handlePostSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  const formData = new FormData();
  formData.append('title', postTitle);
  formData.append('content', postContent);
  formData.append('courseCategory', courseCategory);
  if (imageFile) {
    formData.append('image', imageFile);
  }
  formData.append('link', e.target.link.value);
  try {
    const response = await axios.post('http://localhost:5000/api/posts', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    setSuccess('Post created successfully!');
    setPostTitle('');
    setPostContent('');
    setImageFile(null);
    setImagePreview(null);
    fetchData();
    setActiveTab('view-posts');
  } catch (err) {
    console.error('Error creating post:', err);
    setError(err.response?.data?.error || 'Failed to create post. Please try again.');
  }
};

  const deletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:5000/api/posts/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Statistics</h3>
            <div className="space-y-4">
  <div className="flex justify-between p-4 bg-blue-50 rounded">
    <span>Total Posts</span>
    <span className="font-bold">{posts.length}</span>
  </div>
  <div className="flex justify-between p-4 bg-green-50 rounded">
    <span>Total Users</span>
    <span className="font-bold">{users.length}</span>
  </div>
  <div className="flex justify-between p-4 bg-yellow-50 rounded">
    <span>Active Users</span>
    <span className="font-bold">{activeUsers}</span>
  </div>
</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              {posts.slice(0, 5).map(post => (
                <div key={post._id} className="mb-4 pb-4 border-b last:border-0">
                  <h4 className="font-medium">{post.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'create-post':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Create New Post</h3>
            <form onSubmit={handlePostSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
              {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}
              <div>
                <label className="block mb-1">Course Category</label>
                <select
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="btech">BTech</option>
                  <option value="bca">BCA</option>
                  <option value="mca">MCA</option>
                  <option value="mba">MBA</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Post Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Post Title"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Post Content</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Post Content"
                  className="w-full p-2 border rounded"
                  rows="5"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Attach Image (optional)</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                      setImagePreview(URL.createObjectURL(e.target.files[0]));
                    } else {
                      setImageFile(null);
                      setImagePreview(null);
                    }
                  }}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded" />
                )}
              </div>
              <div>
                <label className="block mb-1">Add Link</label>
                <input
                  type="url"
                  name="link"
                  placeholder="https://example.com"
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Post
              </button>
            </form>
          </div>
        );

      case 'view-posts':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">All Posts</h3>
              <button
                onClick={() => setActiveTab('create-post')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <FiPlusSquare className="mr-2" />
                Add New Post
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                            {post.courseCategory?.toUpperCase() || 'OTHER'}
                          </span>
                          <h4 className="mt-2 font-semibold text-lg">{post.title}</h4>
                        </div>
                        <button
                          onClick={() => deletePost(post._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                      {post.image && (
                        <img src={`http://localhost:5000/uploads/${post.image}`} alt="Post" className="mt-2 max-h-40 rounded" />
                      )}
                      <p className="mt-2 text-gray-600">{post.content}</p>
                      <div className="mt-4 text-sm text-gray-500">
                        Posted on: {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'manage-users':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Manage Users</h3>
            {loading ? (
              <div>Loading users...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                  <div key={user._id} className="bg-white p-4 rounded shadow relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                      </div>
                      {onlineUsers.has(user._id) && (
                        <div className="flex items-center">
                          <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                          <span className="text-xs text-green-600">Online</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete User
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'add-question-paper':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Add New Question Paper</h3>
            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setSuccess("");
                const formData = new FormData();
                const college = e.target.college.value;
                const course = e.target.course.value;
                const semester = e.target.semester.value;
                const subject = e.target.subject.value;
                const file = e.target.file.files[0];
                const branch = e.target.branch.value;
                formData.append("college", college);
                formData.append("course", course);
                formData.append("semester", semester);
                formData.append("subject", subject);
                if (file) formData.append("file", file);
                if (branch) formData.append("branch", branch);
                try {
                  await axios.post(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/question-papers`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                  );
                  setSuccess("Question paper uploaded successfully!");
                  e.target.reset();
                } catch (err) {
                  setError(err?.response?.data?.error || "Failed to upload question paper.");
                }
              }}
            >
              <div>
                <label className="block mb-1">College</label>
                <select
                  name="college"
                  value={college}
                  onChange={e => { setCollege(e.target.value); setSelectedCourse(""); setBranch(""); setSelectedSemester(""); setNewSubject(""); }}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map(col => (
                    <option key={col._id} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Program</label>
                <select
                  name="course"
                  value={selectedCourse}
                  onChange={e => { setSelectedCourse(e.target.value); setBranch(""); setSelectedSemester(""); setNewSubject(""); }}
                  className="w-full p-2 border rounded"
                  required
                  disabled={!college}
                >
                  <option value="">Select Program</option>
                  {courses.map(c => (
                    <option key={c._id} value={c.course}>{c.course}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Semester</label>
                <select
                  name="semester"
                  value={selectedSemester}
                  onChange={e => { setSelectedSemester(e.target.value); setNewSubject(""); }}
                  className="w-full p-2 border rounded"
                  required
                  disabled={!selectedCourse}
                >
                  <option value="">Select Semester</option>
                  {semesters.map(s => (
                    <option key={s._id} value={s.semester}>{s.semester}</option>
                  ))}
                </select>
                {semesterError && <div className="text-xs text-red-600 mt-1">{semesterError}</div>}
              </div>
              <div>
                <label className="block mb-1">Subject</label>
                <select
                  name="subject"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  disabled={!selectedSemester}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s.subject}>{s.subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Branch</label>
                <select
                  name="branch"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b.branch}>{b.branch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Upload Question Paper (PDF)</label>
                <input
                  type="file"
                  name="file"
                  accept="application/pdf"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                disabled={!college || !selectedCourse || !selectedSemester || !newSubject || !branch}
              >
                Upload Question Paper
              </button>
            </form>
          </div>
        );

      case 'manage-semesters':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Manage Semesters</h3>
            
            {/* Add New Semester Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h4 className="text-lg font-medium mb-3">Add New Semester</h4>
              {academicError && <div className="p-3 bg-red-100 text-red-700 rounded mb-3">{academicError}</div>}
              {academicSuccess && <div className="p-3 bg-green-100 text-green-700 rounded mb-3">{academicSuccess}</div>}
              
              <form onSubmit={addSemester} className="flex gap-3">
                <input
                  type="text"
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  placeholder="Enter semester (e.g., 1st, 2nd, 3rd)"
                  className="flex-1 p-2 border rounded"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Semester
                </button>
              </form>
            </div>

            {/* Semesters List */}
            <div>
              <h4 className="text-lg font-medium mb-3">Existing Semesters</h4>
              {semesters.length === 0 ? (
                <p className="text-gray-500">No semesters added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {semesters.map((semester) => (
                    <div key={semester._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{semester.semester}</span>
                      <button
                        onClick={() => deleteSemester(semester._id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'manage-courses':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Manage Courses</h3>
            
            {/* Add New Course Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h4 className="text-lg font-medium mb-3">Add New Course</h4>
              {academicError && <div className="p-3 bg-red-100 text-red-700 rounded mb-3">{academicError}</div>}
              {academicSuccess && <div className="p-3 bg-green-100 text-green-700 rounded mb-3">{academicSuccess}</div>}
              
              <form onSubmit={addCourse} className="flex gap-3">
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="Enter course (e.g., BTech, BCA, MCA)"
                  className="flex-1 p-2 border rounded"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Course
                </button>
              </form>
            </div>

            {/* Courses List */}
            <div>
              <h4 className="text-lg font-medium mb-3">Existing Courses</h4>
              {courses.length === 0 ? (
                <p className="text-gray-500">No courses added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{course.course}</span>
                      <button
                        onClick={() => deleteCourse(course._id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'manage-subjects':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Manage Subjects</h3>
            
            {/* Add New Subject Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h4 className="text-lg font-medium mb-3">Add New Subject</h4>
              {academicError && <div className="p-3 bg-red-100 text-red-700 rounded mb-3">{academicError}</div>}
              {academicSuccess && <div className="p-3 bg-green-100 text-green-700 rounded mb-3">{academicSuccess}</div>}
              
              <form onSubmit={addSubject} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="p-2 border rounded"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course.course}>
                        {course.course}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="p-2 border rounded"
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((semester) => (
                      <option key={semester._id} value={semester.semester}>
                        {semester.semester}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Enter subject name"
                    className="flex-1 p-2 border rounded"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Subject
                  </button>
                </div>
              </form>
            </div>

            {/* Filter Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded">
              <h4 className="text-lg font-medium mb-3">Filter Subjects</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course.course}>
                      {course.course}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="">All Semesters</option>
                  {semesters.map((semester) => (
                    <option key={semester._id} value={semester.semester}>
                      {semester.semester}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subjects List */}
            <div>
              <h4 className="text-lg font-medium mb-3">
                Subjects 
                {selectedCourse && ` - ${selectedCourse}`}
                {selectedSemester && ` - ${selectedSemester}`}
              </h4>
              {subjects.length === 0 ? (
                <p className="text-gray-500">No subjects found for the selected filters.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subject) => (
                    <div key={subject._id} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{subject.subject}</span>
                        <button
                          onClick={() => deleteSubject(subject._id)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Course: {subject.course}</div>
                        <div>Semester: {subject.semester}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'manage-colleges':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Manage Colleges</h3>
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h4 className="text-lg font-medium mb-3">Add New College</h4>
              {academicError && <div className="p-3 bg-red-100 text-red-700 rounded mb-3">{academicError}</div>}
              {academicSuccess && <div className="p-3 bg-green-100 text-green-700 rounded mb-3">{academicSuccess}</div>}
              <form onSubmit={addCollege} className="flex gap-3">
                <input
                  type="text"
                  value={newCollege}
                  onChange={(e) => setNewCollege(e.target.value)}
                  placeholder="Enter college name"
                  className="flex-1 p-2 border rounded"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add College
                </button>
              </form>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-3">Existing Colleges</h4>
              {colleges.length === 0 ? (
                <p className="text-gray-500">No colleges added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colleges.map((college) => (
                    <div key={college._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{college.name}</span>
                      <button
                        onClick={() => deleteCollege(college._id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'manage-branches':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Manage Branches</h3>
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h4 className="text-lg font-medium mb-3">Add New Branch</h4>
              {branchError && <div className="p-3 bg-red-100 text-red-700 rounded mb-3">{branchError}</div>}
              {branchSuccess && <div className="p-3 bg-green-100 text-green-700 rounded mb-3">{branchSuccess}</div>}
              <form onSubmit={addBranch} className="flex gap-3">
                <input
                  type="text"
                  value={newBranch}
                  onChange={e => setNewBranch(e.target.value)}
                  placeholder="Enter branch (e.g., CSE)"
                  className="flex-1 p-2 border rounded"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Branch
                </button>
              </form>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-3">Existing Branches</h4>
              {branches.length === 0 ? (
                <p className="text-gray-500">No branches added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {branches.map((branch) => (
                    <div key={branch._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{branch.branch}</span>
                      <button
                        onClick={() => deleteBranch(branch._id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <div className="flex pt-16 lg:pt-0">
        {/* Side Navigation */}
        <div 
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static lg:inset-auto lg:z-auto`}
        >
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-500">Welcome, {user.name || 'Admin'}</p>
          </div>
          <nav className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
            <ul className="space-y-2">
              <li>
                <button onClick={() => { setActiveTab('dashboard'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <FiHome className="mr-3" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('create-post'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'create-post' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <FiPlusSquare className="mr-3" />
                  <span>Create Post</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('view-posts'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'view-posts' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <FiFileText className="mr-3" />
                  <span>View Posts</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('manage-users'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'manage-users' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <FiUsers className="mr-3" />
                  <span>Manage Users</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('add-question-paper'); setMenuOpen(false); }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'add-question-paper' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-100'}`}
                >
                  <FiFileText className="mr-3" />
                  <span>Add Question Paper</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('manage-semesters'); setMenuOpen(false); }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'manage-semesters' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-100'}`}
                >
                  <FiPlusSquare className="mr-3" />
                  <span>Manage Semesters</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('manage-courses'); setMenuOpen(false); }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'manage-courses' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-100'}`}
                >
                  <FiPlusSquare className="mr-3" />
                  <span>Manage Courses</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('manage-subjects'); setMenuOpen(false); }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'manage-subjects' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-100'}`}
                >
                  <FiPlusSquare className="mr-3" />
                  <span>Manage Subjects</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('manage-colleges'); setMenuOpen(false); }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'manage-colleges' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-100'}`}
                >
                  <FiPlusSquare className="mr-3" />
                  <span>Manage Colleges</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('manage-branches'); setMenuOpen(false); }}
                  className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'manage-branches' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-100'}`}
                >
                  <FiPlusSquare className="mr-3" />
                  <span>Manage Branches</span>
                </button>
              </li>
              <li className="border-t border-gray-200 pt-2 mt-2">
                <button onClick={logout} className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                  <FiLogOut className="mr-3" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
        <nav className="flex justify-around p-2">
          <button
            onClick={() => { setActiveTab('dashboard'); setMenuOpen(false); }}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            <FiHome size={18} />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button
            onClick={() => { setActiveTab('create-post'); setMenuOpen(false); }}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'create-post' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            <FiPlusSquare size={18} />
            <span className="text-xs mt-1">Create</span>
          </button>
          <button
            onClick={() => { setActiveTab('view-posts'); setMenuOpen(false); }}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'view-posts' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            <FiFileText size={18} />
            <span className="text-xs mt-1">Posts</span>
          </button>
          <button
            onClick={() => { setActiveTab('manage-users'); setMenuOpen(false); }}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'manage-users' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            <FiUsers size={18} />
            <span className="text-xs mt-1">Users</span>
          </button>
          <button
            onClick={() => { setActiveTab('add-question-paper'); setMenuOpen(false); }}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'add-question-paper' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            <FiFileText size={18} />
            <span className="text-xs mt-1">Q. Paper</span>
          </button>
        </nav>
      </div>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
