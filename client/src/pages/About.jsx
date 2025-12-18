import { Container, Row, Col } from 'react-bootstrap';
import './About.css';
import {useEffect} from "react";
import { useLocation } from 'react-router-dom';

const About = () => {
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


    return (
        <div className="about-page">
            <div className="about-hero">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto text-center">
                            <h1 className="page-title">RentalSite</h1>
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
                            без сложностей и излишних затрат традиционной веб-разработки. Наша миссия - сделать ваш бизнес заметным,
                            наши сайты доступными для всех через
                            <b style={{color:"white", marginLeft:"5px", marginRight: "5px"}}>
                                нашу инновационную модель аренды.
                            </b>
                            Даже не понимая принципа создания и запуска сайта, вы сможете запустить арендованный сайт, за считанные дни.
                        </p>
                    </Col>
                    <Col lg={6}>
                        <h2 className="section-title">Что мы предлагаем</h2>
                        <p className="section-text">
                            Мы предоставляем подобранную коллекцию высококачественных сайтов в различных
                            отраслях и категориях. От потрясающих лендингов до комплексных интернет-магазинов,
                            наши шаблоны разработаны, чтобы помочь вам быстро и эффективно запуститься сайт,
                            <b style={{color:"white", marginLeft:"5px", marginRight: "5px"}}>
                            с Вашей информацией на ней.
                            </b>
                            Мало того, мы готовы обсудить, индивидуально, об создании отдельного сайта, под ваш бизнес.
                        </p>
                    </Col>
                </Row>

                <Row className="stats-section">

                    <Col md={4} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">100%</div>
                            <div className="stat-label">Сопровождение</div>
                        </div>
                    </Col>
                    <Col md={4} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Время работы</div>
                        </div>
                    </Col>
                    <Col md={4} className="text-center">
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Поддержка</div>
                        </div>
                    </Col>
                    {/*<Col md={3} className="text-center">*/}
                    {/*    <div className="stat-item">*/}
                    {/*        <div className="stat-number">50+</div>*/}
                    {/*        <div className="stat-label">Шаблонов</div>*/}
                    {/*    </div>*/}
                    {/*</Col>*/}

                </Row>
            </Container>
        </div>
    );
};

export default About;