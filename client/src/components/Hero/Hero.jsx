import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const fullText = "Аренда сайта, запуск от 8 дней без лишних трат";
    const heroRef = useRef(null);

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
        'url(https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)',
        'url(https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)',
        'url(https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)',
    ];

    // Используем Intersection Observer для отслеживания видимости
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.1 } 
        );

        if (heroRef.current) {
            observer.observe(heroRef.current);
        }

        return () => {
            if (heroRef.current) {
                // eslint-disable-next-line
                observer.unobserve(heroRef.current);
            }
        };
    }, []);

    // Оптимизированная проверка размера экрана с throttle
    useEffect(() => {
        let timeoutId;

        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(checkScreenSize, 100); // throttle 100ms
        };

        // Проверяем при загрузке
        checkScreenSize();

        // Добавляем слушатель изменения размера окна
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    // Анимация текста только когда компонент в видимой области
    useEffect(() => {
        if (!isInView || currentIndex >= fullText.length) return;

        const timeout = setTimeout(() => {
            setDisplayText(prev => prev + fullText[currentIndex]);
            setCurrentIndex(prev => prev + 1);
        }, 100);

        return () => clearTimeout(timeout);
    }, [currentIndex, fullText, isInView]);

    return (
        <section className="hero-section" ref={heroRef}>
            <div className="hero-background">
                <div className={`floating-shapes ${isInView ? 'active' : 'paused'}`}>
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
                                    <span>🚀 Бустущее в веб-присутствии</span>
                                </div>

                                <h1 className="hero-title">
                                    <span className="text-gradient">{displayText}</span>
                                    {currentIndex < fullText.length && (
                                        <span className="cursor">|</span>
                                    )}
                                </h1>

                                <p className="hero-description">
                                    Экономия до 70% бюджета, для малого и среднего бизнеса. Аренда с возможностью выкупа. Бизнес планирование, Seo оптимизация - внутренняя и внешняя перелинковка страниц, Покупка готового интернет - магазина
                                </p>

                                <div className="hero-buttons">
                                    <Button
                                        as={Link}
                                        to="/catalog"
                                        className="btn-primary-custom me-3 hero-btn-primary-custom"
                                    >
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
                            <div className={`hero-visual ${isInView ? 'active' : 'paused'}`}>
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

                <div className={`scroll-indicator ${isInView ? 'active' : 'paused'}`}>
                    <div className="scroll-arrow"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;