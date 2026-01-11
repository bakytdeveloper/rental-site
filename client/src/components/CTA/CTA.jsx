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
                            {/* Рекомендуемый вариант */}
                            <h2 className="text-gradient">
                                Начните бизнес онлайн без разработки с нуля
                            </h2>

                            <p className="cta-description">
                                Арендуйте профессиональный сайт за короткое время. Никаких длительных  ожиданий,
                                технических сложностей или больших вложений. Если вы только начинаете своё дело, то мы поможем это сделать быстро и качественно
                            </p>

                            <div className="cta-buttons">
                                <Button
                                    as={Link}
                                    to="/catalog"
                                    className="btn-cta-primary"
                                    size="lg"
                                >
                                    Выбрать сайт
                                </Button>
                                <Button
                                    as={Link}
                                    to="/contact"
                                    className="btn-cta-secondary"
                                    size="lg"
                                >
                                    Бесплатная консультация
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