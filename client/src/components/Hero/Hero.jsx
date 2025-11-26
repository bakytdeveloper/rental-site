import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const fullText = "Rent Professional Websites Today";

    useEffect(() => {
        if (currentIndex < fullText.length) {
            const timeout = setTimeout(() => {
                setDisplayText(prev => prev + fullText[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, fullText]);

    return (
        <section className="hero-section">
            <div className="hero-background">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                </div>
            </div>

            <Container>
                <Row className="align-items-center min-vh-100">
                    <Col lg={6}>
                        <div className="hero-content">
                            <div className="hero-badge">
                                <span>🚀 Future of Web Presence</span>
                            </div>

                            <h1 className="hero-title">
                                <span className="text-gradient">{displayText}</span>
                                <span className="cursor">|</span>
                            </h1>

                            <p className="hero-description">
                                Access premium websites instantly. No development time,
                                no technical hassle. Launch your online presence with
                                our curated collection of high-converting templates.
                            </p>

                            <div className="hero-buttons">
                                <Button
                                    as={Link}
                                    to="/catalog"
                                    className="btn-primary-custom me-3"
                                >
                                    Explore Catalog
                                </Button>
                                <Button
                                    as={Link}
                                    to="/about"
                                    className="btn-outline-custom"
                                >
                                    Learn More
                                </Button>
                            </div>

                            <div className="hero-stats">
                                <div className="stat-item">
                                    <div className="stat-number">50+</div>
                                    <div className="stat-label">Premium Sites</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">24/7</div>
                                    <div className="stat-label">Support</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">99.9%</div>
                                    <div className="stat-label">Uptime</div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col lg={6}>
                        <div className="hero-visual">
                            <div className="floating-card card-1">
                                <div className="card-content">
                                    <div className="card-preview"></div>
                                    <div className="card-glow"></div>
                                </div>
                            </div>
                            <div className="floating-card card-2">
                                <div className="card-content">
                                    <div className="card-preview"></div>
                                    <div className="card-glow"></div>
                                </div>
                            </div>
                            <div className="floating-card card-3">
                                <div className="card-content">
                                    <div className="card-preview"></div>
                                    <div className="card-glow"></div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            <div className="scroll-indicator">
                <div className="scroll-arrow"></div>
            </div>
        </section>
    );
};

export default Hero;