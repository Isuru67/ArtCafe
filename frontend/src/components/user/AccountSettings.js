import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { changePassword, deleteAccount, checkEmailAvailability } from '../../services/userService';

const AccountSettings = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // Validate password length
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== currentUser.username) {
      setDeleteError('Username confirmation does not match');
      return;
    }
    
    try {
      await deleteAccount();
      logout();
      navigate('/login', { state: { message: 'Your account has been deleted successfully' } });
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Account Settings</h2>
      
      <Tabs defaultActiveKey="password" className="mb-4">
        <Tab eventKey="password" title="Change Password">
          <Card>
            <Card.Body>
              <h4 className="mb-3">Change Password</h4>
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
              {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
              
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
                
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={submitting}
                >
                  {submitting ? 'Changing...' : 'Change Password'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="deleteAccount" title="Delete Account">
          <Card className="border-danger">
            <Card.Body>
              <h4 className="text-danger mb-3">Delete Account</h4>
              <Alert variant="warning">
                <Alert.Heading>Warning!</Alert.Heading>
                <p>
                  This action is permanent and cannot be undone. All your data, posts, comments, and likes will be permanently deleted.
                </p>
              </Alert>
              
              <Button 
                variant="danger" 
                className="mt-3"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete My Account
              </Button>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {/* Delete Account Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          <p>This action is permanent. Please type your username <strong>{currentUser?.username}</strong> to confirm:</p>
          <Form.Control
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="mb-3"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AccountSettings;
