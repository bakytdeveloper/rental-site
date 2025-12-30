import { Container, Row, Col } from 'react-bootstrap';
import './TargetAudience.css';

const TargetAudience = () => {
    const cards = [
        {
            id: 1,
            title: 'Магазин одежды',
            description: 'Женская, мужская, детская, все сезонные товары. Сделай первый шаг',
            icon: '👕'
        },
        {
            id: 2,
            title: 'Цветочный магазин',
            description: 'Быстрый способ заказать букет цветов. Дарите эмоции каждый день',
            icon: '🌸'
        },
        {
            id: 3,
            title: 'Товары для детей',
            description: 'Покупки с удобствами, без лишних забот для занятых родителей',
            icon: '🧸'
        },
        {
            id: 4,
            title: 'Товары для дома',
            description: 'Все, что необходимо для уюта. Заказать просто, быстро и без сложностей',
            icon: '🏠'
        },
        {
            id: 5,
            title: 'База поставщиков',
            description: 'Готовый список в Exel. Оптовые и розничные контакты. Расширьте дилерскую сеть',
            icon: '📊'
        },
        {
            id: 6,
            title: 'Услуги',
            description: 'Старт без риска, расширяйте функционал и продажи когда будите готовы',
            icon: '🛠️'
        },
        {
            id: 7,
            title: 'Парфюмерия и косметика',
            description: 'Самый легкий выбор и оформление заказа, удобная навигация',
            icon: '💄'
        }
    ];

    return (
        <section className="target-audience-section">
            <Container>
                <Row className="text-center mb-5">
                    <Col>
                        <h2 className="section-title">
                            Кому подходит наше решение?
                        </h2>
                        <p className="section-subtitle mb-5">
                            RentalSite поможет создать эффективный и мощный инструмент. Продвижение интернет-магазина,
                            скорость запуска, масштабирование продаж. Актуально для Казахстана, и соседних стран.
                        </p>
                    </Col>
                </Row>

                {/* Первая строка - 4 карточки */}
                <Row className="mb-4">
                    {cards.slice(0, 4).map((card) => (
                        <Col
                            xl={3}      // 4 карточки на больших экранах (12/3=4)
                            lg={6}      // 2 карточки на средних экранах
                            md={6}      // 2 карточки на средних экранах
                            sm={12}     // 1 карточка на маленьких экранах
                            key={card.id}
                            className="mb-4"
                        >
                            <div className="target-card" data-aos="fade-up">
                                <div className="target-card-content">
                                    <div className="target-card-icon">
                                        {card.icon}
                                    </div>
                                    <div className="target-card-text">
                                        <h3 className="target-card-title">{card.title}</h3>
                                        <p className="target-card-description">{card.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>

                {/* Вторая строка - 3 карточки */}
                <Row className="justify-content-center">
                    {cards.slice(4, 7).map((card) => (
                        <Col
                            xl={4}      // 3 карточки на больших экранах (12/4=3)
                            lg={4}      // 3 карточки на больших экранах
                            md={6}      // 2 карточки на средних экранах (3-я перейдет на новую строку)
                            sm={12}     // 1 карточка на маленьких экранах
                            key={card.id}
                            className="mb-4"
                        >
                            <div className="target-card" data-aos="fade-up" data-aos-delay="100">
                                <div className="target-card-content">
                                    <div className="target-card-icon">
                                        {card.icon}
                                    </div>
                                    <div className="target-card-text">
                                        <h3 className="target-card-title">{card.title}</h3>
                                        <p className="target-card-description">{card.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default TargetAudience;
