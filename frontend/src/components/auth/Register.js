import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { checkUsernameAvailability, checkEmailAvailability } from '../../services/userService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateField = async (name, value) => {
    let isValid = true;
    const newErrors = {...errors};
    
    switch (name) {
      case 'username':
        if (value.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
          isValid = false;
        } else {
          try {
            const response = await checkUsernameAvailability(value);
            if (!response.available) {
              newErrors.username = 'Username is already taken';
              isValid = false;
            } else {
              delete newErrors.username;
            }
          } catch (error) {
            console.error('Error checking username:', error);
          }
        }
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
          isValid = false;
        } else {
          try {
            const response = await checkEmailAvailability(value);
            if (!response.available) {
              newErrors.email = 'Email is already in use';
              isValid = false;
            } else {
              delete newErrors.email;
            }
          } catch (error) {
            console.error('Error checking email:', error);
          }
        }
        break;
      
      case 'password':
        if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
          isValid = false;
        } else {
          delete newErrors.password;
        }
        
        // Check password confirmation match
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
          isValid = false;
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
      
      case 'confirmPassword':
        if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
          isValid = false;
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validate field after user stops typing
    if (name === 'username' || name === 'email') {
      // Don't validate on every keystroke for these fields
      return;
    }
    
    await validateField(name, value);
  };
  
  const handleBlur = async (e) => {
    const { name, value } = e.target;
    await validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields before submission
    const validations = await Promise.all([
      validateField('username', formData.username),
      validateField('email', formData.email),
      validateField('password', formData.password),
      validateField('confirmPassword', formData.confirmPassword)
    ]);
    
    if (validations.includes(false) || Object.keys(errors).length > 0) {
      setError('Please fix the errors before submitting');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      navigate('/login', { 
        state: { message: 'Registration successful! Please login with your credentials.' } 
      });
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center">
              <h2>Create an Account</h2>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!errors.username}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Username must be unique and at least 3 characters long.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!errors.email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!errors.password}
                    required
                    autoComplete="new-password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!errors.confirmPassword}
                    required
                    autoComplete="new-password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <p className="mb-0">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
