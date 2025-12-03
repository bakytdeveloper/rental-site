import { Container, Row, Col } from 'react-bootstrap';
import './Features.css';

const Features = () => {
    const features = [
        {
            icon: '⚡',
            title: 'Мгновенное развертывание',
            description: 'Запускайтесь за минуты, а не недели. Наши готовые сайты доступны для немедленного использования.',
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
            description: 'Легко настраивайте цвета, контент и брендинг под ваш бизнес.',
            gradient: 'from-orange-400 to-red-500'
        },
        {
            icon: '📈',
            title: 'SEO оптимизация',
            description: 'Все сайты имеют встроенные лучшие практики SEO для лучшей видимости.',
            gradient: 'from-blue-400 to-purple-600'
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
                        <Col lg={3} md={6} key={index} className="mb-4">
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