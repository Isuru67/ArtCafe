import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Post Components
// eslint-disable-next-line no-unused-vars
import PostList from './components/posts/PostList';
import PostDetail from './components/posts/PostDetail';
import CreatePost from './components/posts/CreatePost';
import EditPost from './components/posts/EditPost';

// User Components
import Profile from './components/user/Profile';
import EditProfile from './components/user/EditProfile';
import AccountSettings from './components/user/AccountSettings';
import UserPublicProfile from './components/user/UserPublicProfile';
import UserLandingPage from './components/user/UserLandingPage';

// Home Component
import HomePage from './components/home/HomePage';

//Learning Component
import LearningPlanDashboard from './components/LearningPlans/LearningPlanDashboard';
import LearningPlanCreate from './components/LearningPlans/LearningPlanCreate';

import LearningPlanEdit from './components/LearningPlans/LearningPlanEdit';

// PrivateRoute component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppContent() {
  // eslint-disable-next-line no-unused-vars
  const { currentUser } = useContext(AuthContext);  // Add this line

  return (
    <Router>
      <Header />
      <main className="py-4">
        <Container>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/users/:id" element={<UserPublicProfile />} />
            <Route 
              path="/:userid/lerning-dashboard" 
              element={
                <PrivateRoute>
                  <LearningPlanDashboard />
                </PrivateRoute>
              } 
            />
            {/* <Route 
              path="/:userid/view-planlist" 
              element={
                <PrivateRoute>
                  <LearningPlanList />
                </PrivateRoute>
              } 
            /> */}
            <Route 
              path="/:userid/create-plan" 
              element={
                <PrivateRoute>
                  <LearningPlanCreate />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/:userid/edit-plan/:planId" 
              element={
                <PrivateRoute>
                  <LearningPlanEdit />
                </PrivateRoute>
              } 
            />
            {/* Protected Routes */}
            <Route path="/:username/edit-post/:id" element={
              <PrivateRoute>
                <EditPost />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/edit-profile" element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            } />
            <Route path="/account-settings" element={
              <PrivateRoute>
                <AccountSettings />
              </PrivateRoute>
            } />
            
            {/* Add username-specific create post route */}
            <Route path="/:username/create-post" element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            } />
            
            {/* Username route - must be after specific routes */}
            <Route path="/:username" element={
              <PrivateRoute>
                <UserLandingPage />
              </PrivateRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<div className="text-center p-5">Page not found</div>} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
