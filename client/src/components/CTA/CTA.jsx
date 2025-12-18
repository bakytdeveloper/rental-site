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
                            {/*<div className="cta-stats">*/}
                            {/*    <div className="stat">*/}
                            {/*        <div className="stat-number">500+</div>*/}
                            {/*        <div className="stat-label">Арендованных сайтов</div>*/}
                            {/*    </div>*/}
                            {/*    <div className="stat">*/}
                            {/*        <div className="stat-number">98%</div>*/}
                            {/*        <div className="stat-label">Удовлетворенность клиентов</div>*/}
                            {/*    </div>*/}
                            {/*    <div className="stat">*/}
                            {/*        <div className="stat-number">24ч</div>*/}
                            {/*        <div className="stat-label">Средняя настройка</div>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default CTA;