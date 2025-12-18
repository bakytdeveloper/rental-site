import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const fullText = "Арендуйте профессиональные сайты сегодня";

    const location = useLocation();

// Функция для прокрутки наверх
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    };

// Прокрутка вверх при монтировании компонента и изменении фильтров
    useEffect(() => {
        scrollToTop();
    }, [location.search]);


    useEffect(() => {
        // Функция для проверки размера экрана
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768); // 768px - breakpoint для мобильных
        };

        // Проверяем при загрузке
        checkScreenSize();

        // Добавляем слушатель изменения размера окна
        window.addEventListener('resize', checkScreenSize);

        // Очищаем слушатель при размонтировании
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

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
                                <span>🚀 Будущее веб-присутствия</span>
                            </div>

                            <h1 className="hero-title">
                                <span className="text-gradient">{displayText}</span>
                                <span className="cursor">|</span>
                            </h1>

                            <p className="hero-description">
                                Получите доступ к премиальным сайтам мгновенно. Никакого времени на разработку,
                                никаких технических сложностей. Запустите свое онлайн-присутствие с нашей
                                тщательно подобранной коллекцией высококонверсионных шаблонов.
                            </p>

                            <div className="hero-buttons">
                                <Button
                                    as={Link}
                                    to="/catalog"
                                    className="btn-primary-custom me-3"
                                >
                                    {/* Отображаем разный текст в зависимости от размера экрана */}
                                    {isMobile ? 'Каталог' : 'Исследовать каталог'}
                                </Button>
                                <Button
                                    as={Link}
                                    to="/about"
                                    className="btn-outline-custom"
                                >
                                    Узнать больше
                                </Button>
                            </div>

                            <div className="hero-stats">
                                <div className="stat-item hero-stat-item">
                                    <div className="stat-number">100%</div>
                                    <div className="stat-label">Сопровождение</div>
                                </div>
                                <div className="stat-item hero-stat-item">
                                    <div className="stat-number">24/7</div>
                                    <div className="stat-label">Поддержка</div>
                                </div>
                                <div className="stat-item hero-stat-item">
                                    <div className="stat-number">99.9%</div>
                                    <div className="stat-label">Доступность</div>
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