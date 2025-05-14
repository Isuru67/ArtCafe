import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaPalette, FaComments, FaSignInAlt, FaUserPlus, FaSearch } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { getPosts } from '../../services/postService';
import { IMAGE_BASE_URL } from '../../config';

const HomePage = () => {
  const { currentUser } = useContext(AuthContext);
  const [featuredArtwork, setFeaturedArtwork] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Fetch a few posts to feature on the homepage
    const fetchFeaturedArtwork = async () => {
      try {
        // Only attempt to fetch if user is logged in
        if (currentUser) {
          const response = await getPosts(0, 6);
          setFeaturedArtwork(response.posts.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching featured artwork:', error);
      }
    };

    fetchFeaturedArtwork();
  }, [currentUser]);

  // Update search handler function
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await getPosts(0, 10, searchQuery);
      // Filter results to only show posts where title matches search query
      const titleMatchResults = response.posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(titleMatchResults);
    } catch (error) {
      console.error('Error searching posts:', error);
    }
  };

  return (
    <>
      {/* Search Section */}
      <section className="py-4 bg-white border-bottom">
        <Container>
          <Form onSubmit={handleSearch}>
            <InputGroup className="mb-0">
              <Form.Control
                placeholder="Search artwork by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="lg"
              />
              <Button variant="primary" type="submit">
                <FaSearch /> Search
              </Button>
            </InputGroup>
          </Form>
        </Container>
      </section>

      {/* Updated Search Results Section */}
      {searchResults.length > 0 && (
        <section className="py-4">
          <Container>
            <h3 className="mb-4">Search Results for "{searchQuery}"</h3>
            <Row>
              {searchResults.map(artwork => (
                <Col md={4} key={artwork.id} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <Link to={`/posts/${artwork.id}`} className="text-decoration-none">
                        <Card.Title className="text-primary">{artwork.title}</Card.Title>
                      </Link>
                      <Card.Text className="text-muted small">
                        by {artwork.user.fullName || artwork.user.username}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* Show "No results found" message when search yields no results */}
      {searchQuery && searchResults.length === 0 && (
        <section className="py-4">
          <Container>
            <div className="text-center text-muted">
              <h4>No artwork titles found matching "{searchQuery}"</h4>
            </div>
          </Container>
        </section>
      )}

      {/* Hero Section */}
      <section className="hero-section text-white py-5" style={{
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">Welcome to Art Cafe</h1>
              <p className="lead mb-4">
                A vibrant community where artists share their work, connect with peers, and receive meaningful feedback.
                Join us to explore a world of creativity and inspiration.
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                {!currentUser ? (
                  <>
                    <Button as={Link} to="/register" size="lg" variant="light" className="me-md-2">
                      <FaUserPlus className="me-2" /> Join Now
                    </Button>
                    <Button as={Link} to="/login" size="lg" variant="outline-light">
                      <FaSignInAlt className="me-2" /> Sign In
                    </Button>
                  </>
                ) : (
                  <Button as={Link} to="/posts" size="lg" variant="light">
                    <FaPalette className="me-2" /> Explore Artwork
                  </Button>
                )}
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <img 
                src="../assets/images/home1.jpg" 
                alt="Art Cafe Illustration" 
                className="img-fluid" 
                style={{ 
                  maxHeight: '400px',
                  filter: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.2))'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  // Using inline SVG as data URL instead of placeholder.com
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='100%25' height='100%25' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' dominant-baseline='middle' fill='%236c757d'%3EArt Cafe%3C/text%3E%3C/svg%3E";
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Why Join Art Cafe?</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-primary text-white rounded-circle mb-4 mx-auto" style={{
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    <FaPalette />
                  </div>
                  <Card.Title>Showcase Your Art</Card.Title>
                  <Card.Text>
                    Upload and share your creative works with a community that appreciates art in all its forms.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-primary text-white rounded-circle mb-4 mx-auto" style={{
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    <FaUsers />
                  </div>
                  <Card.Title>Connect with Artists</Card.Title>
                  <Card.Text>
                    Build your network by following talented artists and engage with their latest creations.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-primary text-white rounded-circle mb-4 mx-auto" style={{
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    <FaComments />
                  </div>
                  <Card.Title>Receive Feedback</Card.Title>
                  <Card.Text>
                    Get constructive feedback on your work and participate in meaningful artistic discussions.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Artwork Section */}
      {currentUser && featuredArtwork.length > 0 && (
        <section className="py-5">
          <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Featured Artwork</h2>
              <Button as={Link} to="/posts" variant="outline-primary">View All</Button>
            </div>
            
            <Row>
              {featuredArtwork.map(artwork => (
                <Col md={4} lg={4} key={artwork.id} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    {artwork.imageUrl && (
                      <Link to={`/posts/${artwork.id}`}>
                        <Card.Img 
                          variant="top" 
                          src={`${IMAGE_BASE_URL}${artwork.imageUrl}`} 
                          alt={artwork.title}
                          style={{ height: '200px', objectFit: 'cover' }}
                          onError={(e) => { 
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='100%25' height='100%25' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' dominant-baseline='middle' fill='%236c757d'%3ENo Image%3C/text%3E%3C/svg%3E"; 
                          }}
                        />
                      </Link>
                    )}
                    <Card.Body>
                      <Link to={`/posts/${artwork.id}`} className="text-decoration-none text-dark">
                        <Card.Title>{artwork.title}</Card.Title>
                      </Link>
                      <Card.Text className="text-muted">
                        By <Link to={`/users/${artwork.user.id}`} className="text-decoration-none">
                          {artwork.user.fullName || artwork.user.username}
                        </Link>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}
      
      {/* Call to Action Section */}
      {!currentUser && (
        <section className="py-5 text-center text-white" style={{
          background: 'linear-gradient(45deg, #FF5F6D 0%, #FFC371 100%)'
        }}>
          <Container>
            <h2 className="mb-4">Ready to Join Our Creative Community?</h2>
            <p className="lead mb-5">Sign up today and start sharing your artistic journey with fellow creators worldwide.</p>
            <Button as={Link} to="/register" size="lg" variant="light" className="px-4 me-3">
              <FaUserPlus className="me-2" /> Create Account
            </Button>
            <Button as={Link} to="/login" size="lg" variant="outline-light" className="px-4">
              <FaSignInAlt className="me-2" /> Sign In
            </Button>
          </Container>
        </section>
      )}
    </>
  );
};

export default HomePage;
