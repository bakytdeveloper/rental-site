import { Container, Row, Col } from 'react-bootstrap';
import './Benefits.css';

const Benefits = () => {
    const benefits = [
        {
            id: 1,
            title: 'Современный сайт интернет-магазин',
            description: 'Адаптивный и функциональный дизайн'
        },
        {
            id: 2,
            title: 'Удобная корзина и быстрая покупка',
            description: 'Продуманно простой процесс оформления заказа'
        },
        {
            id: 3,
            title: 'Подключение платежной системы',
            description: 'Платежи онлайн, для быстрого приема оплат'
        },
        {
            id: 4,
            title: 'Категории, товары, фильтры',
            description: 'Легкое правление ассортиментом, быстрый поиск'
        },
        {
            id: 5,
            title: 'Уведомление',
            description: 'Информация о новых заказах, расчете и статусах.'
        },
        {
            id: 6,
            title: 'ЅЕО-оптимизация',
            description: 'Полный анализ текущего состояния интернет- магазина.'
        },
        {
            id: 7,
            title: 'Админ-панель',
            description: 'Простое и удобное управление сайтом, не требующие технических знаний'
        },
        {
            id: 8,
            title: 'Бизнес план',
            description: 'Разработка индивидуального Бизнес плана.'
        }
    ];

    return (
        <section className="benefits-section">
            <Container>
                <Row className="text-center mb-5">
                    <Col>
                        <h2 className="section-title">
                            Что вы получите, выбрав RentalSite?
                        </h2>
                        <p className="section-subtitle">
                            Идеи включает все необходимые инструменты, от разработки Бизнес плана,
                            стратегии маркетинга для продвижения, до современного дизайна и удобной админ-панели.
                        </p>
                    </Col>
                </Row>

                <Row>
                    {benefits.map((benefit) => (
                        <Col
                            lg={3}      // 4 карточки в строке на больших экранах
                            md={6}      // 2 карточки в строке на средних экранах
                            sm={12}     // 1 карточка на маленьких экранах
                            key={benefit.id}
                            className="mb-4"
                        >
                            <div
                                className="benefit-card"
                                data-aos="fade-up"
                                data-aos-delay={(benefit.id - 1) * 100}
                            >
                                <div className="benefit-number">
                                    {benefit.id}
                                </div>
                                <div className="benefit-content">
                                    <h3 className="benefit-title">{benefit.title}</h3>
                                    <p className="benefit-description">{benefit.description}</p>
                                </div>
                                <div className="benefit-glow"></div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default Benefits;
