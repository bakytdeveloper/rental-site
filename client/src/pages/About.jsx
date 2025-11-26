import { Container, Row, Col, Card } from 'react-bootstrap';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <div className="about-hero">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto text-center">
                            <h1 className="page-title">About RentalSite</h1>
                            <p className="page-subtitle">
                                Revolutionizing the way businesses establish their online presence
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="about-content">
                <Row className="mb-5">
                    <Col lg={6}>
                        <h2 className="section-title">Our Mission</h2>
                        <p className="section-text">
                            At RentalSite, we believe every business deserves a professional online
                            presence without the complexity and cost of traditional web development.
                            Our mission is to make premium websites accessible to everyone through
                            our innovative rental model.
                        </p>
                    </Col>
                    <Col lg={6}>
                        <h2 className="section-title">What We Offer</h2>
                        <p className="section-text">
                            We provide a curated collection of high-quality websites across various
                            industries and categories. From stunning landing pages to comprehensive
                            e-commerce solutions, our templates are designed to help you launch
                            quickly and scale efficiently.
                        </p>
                    </Col>
                </Row>

                <Row className="stats-section">
                    <Col md={3} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Websites Rented</div>
                        </div>
                    </Col>
                    <Col md={3} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Uptime</div>
                        </div>
                    </Col>
                    <Col md={3} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Support</div>
                        </div>
                    </Col>
                    <Col md={3} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">50+</div>
                            <div className="stat-label">Templates</div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default About;