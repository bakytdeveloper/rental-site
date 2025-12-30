import { Container, Row, Col } from 'react-bootstrap';
import './Features.css';

const Features = () => {
    const features = [
        {
            icon: '⚡',
            title: 'Быстрое развертывание',
            description: 'Запускаем сайт в кратчайшие дни. Наши сайты будут доступны по всему миру ',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: '🛡️',
            title: 'Полная поддержка',
            description: 'Круглосуточная техническая поддержка и обслуживание включены в каждую аренду.',
            gradient: 'from-green-400 to-blue-500'
        },
        {
            icon: '🎨',
            title: 'Настраиваемость',
            description: 'Мы всё настроим сами, применив вашу информацию в нашем сайте, там где вы захотите сделать.',
            gradient: 'from-orange-400 to-red-500'
        }
    ];

    return (
        <section className="features-section">
            <Container>
                <Row className="text-center mb-5">
                    <Col>
                        <h2 className="section-title">
                            Почему выбирают <span className="text-gradient">RentalSite</span>?
                        </h2>
                        <p className="section-subtitle">
                            Оцените будущее веб-присутствия с нашей инновационной моделью аренды
                        </p>
                    </Col>
                </Row>

                <Row>
                    {features.map((feature, index) => (
                        <Col
                            lg={4}    // Изменено с 3 на 4 для 3 колонок на больших экранах
                            md={6}    // Остается 2 колонки на средних экранах
                            sm={12}   // 1 колонка на маленьких экранах
                            key={index}
                            className="mb-4"
                        >
                            <div
                                className="feature-card"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                <div className="feature-icon">
                                    <span>{feature.icon}</span>
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-glow"></div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default Features;