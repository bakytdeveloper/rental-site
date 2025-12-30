import { Container, Row, Col } from 'react-bootstrap';
import './CooperationFormats.css';

const CooperationFormats = () => {
    const formats = [
        {
            id: 1,
            title: 'Аренда',
            description: 'Запуск в короткие сроки с минимальными вложениями, тестируйте идеи без риска.',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            features: [
                'Бизнес план',
                'Подключение оплат',
                'VPS Сервер',
                'Наполнение до 1200+ товаров',
                'Хостинг, домен',
                'Техподдержка 24/7'
            ]
        },
        {
            id: 2,
            title: 'Купить готовый сайт',
            description: 'Кто ищет долгосрочное решение с полным контролем и уникальным дизайном. Расширяйтесь без ограничений.',
            image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            features: [
                'Наполнения картинками/карточками',
                'Домен + хостинг на клиента',
                'Полное обучение',
                'Интеграции',
                'Перспектива расширения'
            ]
        },
        {
            id: 3,
            title: 'Аренда с выкупом',
            description: 'Для тех, кто ищет долгосрочное решение с полным контролем. Развивайтесь без ограничений.',
            image: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            features: [
                'Наполнения картинками/карточками',
                'Домен + хостинг на клиента',
                'Техническая поддержка',
                'Обучение, после выполненных обязательств по Договору'
            ]
        }
    ];

    return (
        <section className="cooperation-formats-section">
            <Container>
                <Row className="text-center mb-5">
                    <Col>
                        <h2 className="section-title">
                            Форматы сотрудничества:
                        </h2>
                        <p className="section-subtitle">
                            Гибкие условия, чтобы каждый Бизнес мог найти оптимально готовое решение.
                            Минимальный срок аренды 18 месяцев. Выберете между прокатом, арендой с
                            последующим владением, или полной покупкой.
                        </p>
                    </Col>
                </Row>

                <Row>
                    {formats.map((format) => (
                        <Col
                            lg={4}      // 3 карточки в строке на больших экранах
                            md={6}      // 2 карточки на средних (3-я перейдет на новую строку)
                            sm={12}     // 1 карточка на маленьких экранах
                            key={format.id}
                            className="mb-4"
                        >
                            <div
                                className="format-card"
                                data-aos="fade-up"
                                data-aos-delay={(format.id - 1) * 100}
                            >
                                <div className="format-image-container">
                                    <img
                                        src={format.image}
                                        alt={format.title}
                                        className="format-image"
                                    />
                                    <div className="format-overlay"></div>
                                    <h3 className="format-title">{format.title}</h3>
                                </div>

                                <div className="format-content">
                                    <p className="format-description">{format.description}</p>

                                    <ul className="format-features">
                                        {format.features.map((feature, index) => (
                                            <li key={index} className="feature-item">
                                                <span className="feature-dot">•</span>
                                                <span className="feature-text">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="format-glow"></div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default CooperationFormats;
