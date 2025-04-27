import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="footer mt-auto">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start">
            <h5>Art Cafe</h5>
            <p className="text-muted">
              A social media platform for artists to share their artwork and connect with others.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="text-muted">
              &copy; {new Date().getFullYear()} Art Cafe. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
