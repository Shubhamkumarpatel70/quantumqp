# Quantum QP

A MERN Stack application for managing and sharing question papers.

## Project Structure

```
quantum-qp/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package.json
└── README.md        # This file
```

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/Shubhamkumarpatel70/quantumqp.git
cd quantum-qp
```

2. Install dependencies:
```bash
npm run install-all
```

3. Create environment files:

For the server (server/.env):
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

For the client (client/.env):
```
REACT_APP_API_URL=http://localhost:5000
```

4. Start development servers:
```bash
npm run dev
```

## Deployment on Render

### Backend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Root Directory: `/` (leave empty for root)
   - Build Command: `npm install && cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment Variables:
     - PORT
     - MONGODB_URI
     - JWT_SECRET
     - EMAIL_USER
     - EMAIL_PASS

### Frontend Deployment

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Configure the service:
   - Root Directory: `/` (leave empty for root)
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/build`
   - Environment Variables:
     - REACT_APP_API_URL (set to your backend URL)

## Features

- User authentication
- Question paper upload and management
- Search functionality
- Responsive design
- Email notifications

## Technologies Used

- Frontend:
  - React
  - Redux
  - Tailwind CSS
  - Axios

- Backend:
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication
  - Nodemailer

## License

ISC 