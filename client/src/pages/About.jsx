import { Container, Row, Col } from 'react-bootstrap';
import './About.css';
import {useEffect} from "react";
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO/SEO';
import Features from "../components/Features/Features";
import AOS from 'aos';

const About = () => {
    const location = useLocation();

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }, []);

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "О компании RentalSite",
        "description": "RentalSite - сервис аренды готовых сайтов для бизнеса в Казахстане. Инновационная модель аренды сайтов.",
        "url": "https://rentalsite.kz/about",
        "mainEntity": {
            "@type": "Organization",
            "name": "RentalSite",
            "description": "Сервис аренды готовых сайтов для бизнеса в Казахстане",
            "foundingDate": "2025",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "KZ",
                "addressRegion": "Казахстан"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+7-778-008-33-14",
                "contactType": "customer service",
                "availableLanguage": ["Russian", "Kazakh"]
            }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        scrollToTop();
    }, [location.search]);

    return (
        <div className="about-page">
            <SEO
                title="О компании RentalSite | Аренда сайтов в Казахстане"
                description="RentalSite - инновационный сервис аренды готовых сайтов для бизнеса в Казахстане. Наша миссия, ценности и преимущества."
                keywords="о компании RentalSite, аренда сайтов Казахстан, наша миссия, история компании, преимущества аренды сайтов"
                canonical="https://rentalsite.kz/about"
                structuredData={structuredData}
            />

            {/* Hero секция */}
            <section className="about-hero">
                <Container className="container-custom">
                    <Row>
                        <Col lg={8} className="mx-auto text-center">
                            <h1 className="page-title">О компании RentalSite</h1>
                            <p className="page-subtitle">
                                Бизнес онлайн — шаг к успеху с нашей инновационной моделью аренды сайтов
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Основной контент */}
            <Container className="about-content container-custom">
                {/* Миссия и Предложения */}
                <section className="mission-section mb-5">
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <div className="content-card" data-aos="fade-right">
                                <h2 className="section-title">Наша миссия</h2>
                                <p className="section-text">
                                    В RentalSite мы верим, что каждый бизнес заслуживает профессионального онлайн-присутствия
                                    без сложностей и излишних затрат традиционной веб-разработки. Наша миссия - сделать ваш бизнес заметным,
                                    а профессиональные сайты доступными для всех через
                                    <span className="highlight-text"> нашу инновационную модель аренды.</span>
                                </p>
                                <p className="section-text">
                                    Даже не разбираясь в создании сайтов, вы сможете запустить арендованный сайт с вашей информацией
                                    за считанные дни.
                                </p>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="content-card" data-aos="fade-left">
                                <h2 className="section-title">Что мы предлагаем</h2>
                                <p className="section-text">
                                    Мы предоставляем тщательно подобранную коллекцию высококачественных сайтов
                                    в различных отраслях и категориях. От потрясающих лендингов до комплексных
                                    интернет-магазинов, наши шаблоны разработаны, чтобы помочь вам быстро и
                                    эффективно запустить сайт с вашей информацией.
                                </p>
                                <p className="section-text">
                                    <span className="highlight-text">
                                        Мы также готовы обсудить индивидуальное создание сайта, идеально подходящего под ваш бизнес.
                                    </span>
                                </p>
                            </div>
                        </Col>
                    </Row>
                </section>

                {/* Статистика */}
                <section className="stats-section mb-5">
                    <Row className="text-center">
                        <Col md={4} className="mb-4">
                            <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
                                <div className="stat-number">100%</div>
                                <div className="stat-label">Полное сопровождение</div>
                                <p className="stat-description">От запуска до технической поддержки</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-4">
                            <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
                                <div className="stat-number">99.9%</div>
                                <div className="stat-label">Время работы</div>
                                <p className="stat-description">Гарантированная доступность сайта</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-4">
                            <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">Поддержка</div>
                                <p className="stat-description">Круглосуточная помощь и консультации</p>
                            </div>
                        </Col>
                    </Row>
                </section>

                {/* Особенности */}
                <section className="features-section">
                    <div className="section-header mb-5" data-aos="fade-up">
                        <h2 className="section-title text-center">
                            Наши преимущества
                        </h2>
                        <p className="section-subtitle text-center">
                            Почему бизнесы выбирают RentalSite для своего онлайн-присутствия
                        </p>
                    </div>
                    <Features />
                </section>
            </Container>
        </div>
    );
};

export default About;