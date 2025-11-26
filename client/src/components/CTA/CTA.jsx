import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './CTA.css';

const CTA = () => {
    return (
        <section className="cta-section">
            <Container>
                <Row className="text-center">
                    <Col lg={8} className="mx-auto">
                        <div className="cta-content">
                            <h2 className="cta-title">
                                Ready to Launch Your
                                <span className="text-gradient"> Online Presence</span>?
                            </h2>
                            <p className="cta-description">
                                Join hundreds of businesses that have accelerated their growth
                                with our website rental service. No technical skills required.
                            </p>
                            <div className="cta-buttons">
                                <Button
                                    as={Link}
                                    to="/catalog"
                                    className="btn-cta-primary"
                                    size="lg"
                                >
                                    Browse All Websites
                                </Button>
                                <Button
                                    as={Link}
                                    to="/contact"
                                    className="btn-cta-secondary"
                                    size="lg"
                                >
                                    Get In Touch
                                </Button>
                            </div>
                            <div className="cta-stats">
                                <div className="stat">
                                    <div className="stat-number">500+</div>
                                    <div className="stat-label">Websites Rented</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-number">98%</div>
                                    <div className="stat-label">Client Satisfaction</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-number">24h</div>
                                    <div className="stat-label">Average Setup</div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default CTA;