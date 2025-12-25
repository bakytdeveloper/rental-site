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

    const cardImages = [
        // 'url(https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)', // Интерфейс магазина
        'url(https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)', // UI/UX дизайн
        'url(https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)',  // Бизнес-лендинг
        'url(https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)', // Интерфейс магазина
    ];


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
            <div itemScope itemType="https://schema.org/WebPage">
                <meta itemProp="name" content="Главная страница RentalSite" />
                <meta itemProp="description" content="Аренда профессиональных сайтов для бизнеса в Казахстане" />
            <Container>
                <Row className="align-items-center min-vh-100 hero-align-items-center">
                    <Col lg={6}>
                        <div className="hero-content">
                            <div className="hero-badge">
                                <span>🚀 Будущее в веб-присутствии</span>
                            </div>

                            <h1 className="hero-title">
                                <span className="text-gradient">{displayText}</span>
                                <span className="cursor">|</span>
                            </h1>

                            <p className="hero-description">
                                Получите доступ к Своему сайту за короткое время и за минимальные расходы.
                                Мы предаставляем сайты в Аренду, для начинающих организаций и частных предпринимателей.
                                Мы можем не только сдавать в Аренду сайты, но и создать ваш индивидуальный сайт,
                                как на продажу, так и в Аренду.
                            </p>

                            <div className="hero-buttons">
                                <Button
                                    as={Link}
                                    to="/catalog"
                                    className="btn-primary-custom me-3 hero-btn-primary-custom"
                                >
                                    {/* Отображаем разный текст в зависимости от размера экрана */}
                                    {isMobile ? 'Каталог' : 'Исследовать каталог'}
                                </Button>
                                <Button
                                    as={Link}
                                    to="/about"
                                    className="btn-outline-custom hero-btn-outline-custom"
                                >
                                    Узнать больше
                                </Button>
                            </div>

                            <div className="hero-stats">
                                <div className="stat-item hero-stat-item">
                                    <div className="stat-number">24/7</div>
                                    <div className="stat-label">Поддержка</div>
                                </div>

                                <div className="stat-item hero-stat-item">
                                    <div className="stat-number">100%</div>
                                    <div className="stat-label">Сопровождение</div>
                                </div>

                                <div className="stat-item hero-stat-item">
                                    <div className="stat-number">99.9%</div>
                                    <div className="stat-label">Доступность</div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col lg={6} className="col-hero-visual">
                        <div className="hero-visual">
                            <div className="floating-card card-1">
                                <div className="card-content">
                                    <div
                                        className="card-preview"
                                        style={{ backgroundImage: cardImages[0] }}
                                    ></div>
                                    <div className="card-glow"></div>
                                </div>
                            </div>
                            <div className="floating-card card-2">
                                <div className="card-content">
                                    <div
                                        className="card-preview"
                                        style={{ backgroundImage: cardImages[1] }}
                                    ></div>
                                    <div className="card-glow"></div>
                                </div>
                            </div>
                            <div className="floating-card card-3">
                                <div className="card-content">
                                    <div
                                        className="card-preview"
                                        style={{ backgroundImage: cardImages[2] }}
                                    ></div>
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

            </div>
        </section>
    );
};

export default Hero;