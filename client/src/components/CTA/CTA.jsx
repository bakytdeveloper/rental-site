import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './CTA.css';

const CTA = () => {
    return (
        <section className="cta-section">
            <Container className="container-custom">
                <Row className="text-center">
                    <Col lg={8} className="mx-auto">
                        <div className="cta-content">
                            <h2 className="cta-title">
                                Готовы запустить свое
                                <span className="text-gradient"> онлайн-присутствие</span>?
                            </h2>
                            <p className="cta-description">
                                Присоединяйтесь к сотням бизнесов, которые ускорили свой рост
                                с помощью нашей услуги аренды сайтов. Никаких технических навыков не требуется.
                            </p>
                            <div className="cta-buttons">
                                <Button
                                    as={Link}
                                    to="/catalog"
                                    className="btn-cta-primary"
                                    size="lg"
                                >
                                    Смотреть все сайты
                                </Button>
                                <Button
                                    as={Link}
                                    to="/contact"
                                    className="btn-cta-secondary"
                                    size="lg"
                                >
                                    Связаться с нами
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default CTA;