// client/src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Welcome to Our Platform!
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          We're glad you're here! Whether you're new or returning, we've got you covered. 
          Join our community to access amazing features tailored just for you.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            New User? Continue to Sign Up
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-600 font-medium rounded-lg shadow-sm transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Existing User? Continue to Login
          </button>
        </div>
        
        <p className="text-gray-500 text-sm">
          Need help? <span className="text-indigo-600 cursor-pointer hover:underline">Contact our support team</span>
        </p>
      </div>
      
      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Why choose us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-indigo-600 text-2xl mb-2">🔒</div>
            <h3 className="font-medium mb-1">Secure</h3>
            <p className="text-gray-600 text-sm">Your data is always protected</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-indigo-600 text-2xl mb-2">⚡</div>
            <h3 className="font-medium mb-1">Fast</h3>
            <p className="text-gray-600 text-sm">Lightning fast performance</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-indigo-600 text-2xl mb-2">❤️</div>
            <h3 className="font-medium mb-1">Easy</h3>
            <p className="text-gray-600 text-sm">Simple and intuitive to use</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;