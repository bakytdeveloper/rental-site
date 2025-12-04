import { Container, Row, Col } from 'react-bootstrap';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <div className="about-hero">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto text-center">
                            <h1 className="page-title">О RentalSite</h1>
                            <p className="page-subtitle">
                                Бизнес онлайн — шаг к успеху
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="about-content">
                <Row className="mb-5">
                    <Col lg={6}>
                        <h2 className="section-title">Наша миссия</h2>
                        <p className="section-text">
                            В RentalSite мы верим, что каждый бизнес заслуживает профессионального онлайн-присутствия
                            без сложностей и затрат традиционной веб-разработки. Наша миссия - сделать премиальные
                            сайты доступными для всех через нашу инновационную модель аренды.
                        </p>
                    </Col>
                    <Col lg={6}>
                        <h2 className="section-title">Что мы предлагаем</h2>
                        <p className="section-text">
                            Мы предоставляем тщательно подобранную коллекцию высококачественных сайтов в различных
                            отраслях и категориях. От потрясающих лендингов до комплексных интернет-магазинов,
                            наши шаблоны разработаны, чтобы помочь вам быстро запуститься и эффективно масштабироваться.
                        </p>
                    </Col>
                </Row>

                <Row className="stats-section">

                    <Col md={3} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Арендованных сайтов</div>
                        </div>
                    </Col>
                    <Col md={3} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Время работы</div>
                        </div>
                    </Col>
                    <Col md={3} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Поддержка</div>
                        </div>
                    </Col>
                    <Col md={3} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">50+</div>
                            <div className="stat-label">Шаблонов</div>
                        </div>
                    </Col>

                </Row>
            </Container>
        </div>
    );
};

export default About;