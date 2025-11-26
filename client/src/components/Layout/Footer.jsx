import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="custom-footer">
            <Container>
                <Row>
                    <Col lg={4} md={6} className="mb-4">
                        <div className="footer-brand">
                            <h3 className="brand-logo">
                                <span className="brand-accent">Rental</span>Site
                            </h3>
                            <p className="footer-description">
                                Revolutionizing web presence with premium website rentals.
                                Fast, reliable, and professional solutions for modern businesses.
                            </p>
                        </div>
                    </Col>

                    <Col lg={2} md={6} className="mb-4">
                        <h4 className="footer-title">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/catalog">Catalog</Link></li>
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </Col>

                    <Col lg={3} md={6} className="mb-4">
                        <h4 className="footer-title">Services</h4>
                        <ul className="footer-links">
                            <li><a href="#website-rental">Website Rental</a></li>
                            <li><a href="#maintenance">Maintenance</a></li>
                            <li><a href="#support">24/7 Support</a></li>
                            <li><a href="#customization">Customization</a></li>
                        </ul>
                    </Col>

                    <Col lg={3} md={6} className="mb-4">
                        <h4 className="footer-title">Contact Info</h4>
                        <div className="contact-info">
                            <p>📧 hello@rentalsite.com</p>
                            <p>📞 +1 (555) 123-4567</p>
                            <p>📍 123 Business Ave, Suite 100</p>
                        </div>
                    </Col>
                </Row>

                <hr className="footer-divider" />

                <Row className="align-items-center">
                    <Col md={6}>
                        <p className="footer-copyright">
                            © 2024 RentalSite. All rights reserved.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <div className="footer-social">
                            <a href="#" className="social-link">Twitter</a>
                            <a href="#" className="social-link">LinkedIn</a>
                            <a href="#" className="social-link">GitHub</a>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;