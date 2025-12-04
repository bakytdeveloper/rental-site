import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <Container>
                <Row className="footer-content">
                    <Col xl={4} lg={4} md={6} className="footer-section">
                        <div className="footer-brand">
                            <h3 className="footer-logo">
                                <span className="footer-logo-accent">Rental</span>Site
                            </h3>
                            <p className="footer-description">
                                Изменяем веб-присутствие с помощью премиальной аренды сайтов.
                                Быстрые, надежные и профессиональные решения для современных бизнесов.
                            </p>
                        </div>
                    </Col>

                    <Col xl={2} lg={2} md={3} className="footer-section">
                        <h4 className="footer-title">Навигация</h4>
                        <ul className="footer-links">
                            <li><Link to="/" className="footer-link">Главная</Link></li>
                            <li><Link to="/catalog" className="footer-link">Каталог</Link></li>
                            <li><Link to="/about" className="footer-link">О нас</Link></li>
                            <li><Link to="/contact" className="footer-link">Контакты</Link></li>
                        </ul>
                    </Col>

                    <Col xl={3} lg={3} md={3} className="footer-section">
                        <h4 className="footer-title">Контакты</h4>
                        <div className="footer-contact">
                            <div className="footer-contact-item">
                                <span className="footer-contact-icon">✉️</span>
                                <span className="footer-contact-text">hello@rentalsite.com</span>
                            </div>
                            <div className="footer-contact-item">
                                <span className="footer-contact-icon">📱</span>
                                <span className="footer-contact-text">+7 (778) 008-33-14</span>
                            </div>
                            <div className="footer-contact-item">
                                <span className="footer-contact-icon">📍</span>
                                <span className="footer-contact-text">123 Бизнес Авеню, Офис 100</span>
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="footer-divider"></div>

                <Row className="footer-bottom align-items-center">
                    <Col md={12} className="mb-3 mb-md-0">
                        <p className="footer-copyright">
                            © {currentYear} RentalSite. Все права защищены.
                        </p>
                    </Col>
                    {/*<Col lg={6} md={12} className="text-lg-end">*/}
                    {/*    <div className="footer-social">*/}
                    {/*        <a href="#" className="footer-social-link" aria-label="Twitter">Twitter</a>*/}
                    {/*        <a href="#" className="footer-social-link" aria-label="LinkedIn">LinkedIn</a>*/}
                    {/*        <a href="#" className="footer-social-link" aria-label="GitHub">GitHub</a>*/}
                    {/*    </div>*/}
                    {/*</Col>*/}
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;