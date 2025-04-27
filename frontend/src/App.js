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
import PostList from './components/posts/PostList';
import PostDetail from './components/posts/PostDetail';
import CreatePost from './components/posts/CreatePost';
import EditPost from './components/posts/EditPost';

// User Components
import Profile from './components/user/Profile';
import EditProfile from './components/user/EditProfile';
import AccountSettings from './components/user/AccountSettings';
import UserPublicProfile from './components/user/UserPublicProfile';

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
  return (
    <Router>
      <Header />
      <main className="py-4">
        <Container>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PostList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/users/:id" element={<UserPublicProfile />} />
            
            {/* Protected Routes */}
            <Route path="/create-post" element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            } />
            <Route path="/edit-post/:id" element={
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
