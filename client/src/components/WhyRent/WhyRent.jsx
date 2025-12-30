
import { Container, Row, Col } from 'react-bootstrap';
import './WhyRent.css';
// Изображение можно добавить через импорт или использовать URL
// import programmerImage from '../../assets/images/programmer.svg';

const WhyRent = () => {
    const advantages = [
        {
            text: 'Скорость на максимум - риски на минимум',
            icon: '⚡'
        },
        {
            text: '100% Экономия бюджета',
            icon: '💰'
        },
        {
            text: 'Быстрый вход на рынок',
            icon: '🚀'
        },
        {
            text: 'Поддержка без боли и страха',
            icon: '🛡️'
        },
        {
            text: 'Наилучшим образом подойдёт для тестирования',
            icon: '🧪'
        }
    ];

    // URL изображения программиста (можно заменить на локальное)
    const programmerImage = "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    return (
        <section className="why-rent-section">
            <Container>
                <Row className="align-items-center">
                    {/* Левая сторона - текстовый контент */}
                    <Col
                        lg={6}
                        md={6}
                        className="mb-4 mb-md-0"
                        data-aos="fade-right"
                    >
                        <div className="why-rent-content">
                            <h2 className="section-title mb-4">
                                Почему аренда — лучший старт?
                            </h2>

                            <p className="why-rent-description mb-4">
                                Аренда сайта · идеальное решение и инвестирование без значительно крупных сумм.
                                Вы получаете полностью готовое решение всего от 8 дней, с подключенными
                                платежными системами и поддержкой.
                            </p>

                            <div className="advantages-list">
                                {advantages.map((advantage, index) => (
                                    <div className="advantage-item" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                                        <div className="advantage-icon">
                                            {advantage.icon}
                                        </div>
                                        <span className="advantage-text">
                                            {advantage.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>

                    {/* Правая сторона - изображение */}
                    <Col
                        lg={6}
                        md={6}
                        data-aos="fade-left"
                    >
                        <div className="why-rent-image-container">
                            <img
                                src={programmerImage}
                                alt="Программист работает над сайтом"
                                className="why-rent-image"
                            />
                            <div className="image-glow"></div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default WhyRent;
