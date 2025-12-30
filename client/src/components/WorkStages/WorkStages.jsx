import { Container, Row, Col } from 'react-bootstrap';
import './WorkStages.css';

const WorkStages = () => {
    const stages = [
        {
            id: 1,
            title: 'Заявка',
            subtitle: 'День 1',
            description: 'Формирование заявки. Предоставляете исходный готовый материал (при наличии). Уточнение и согласование деталей, тонкостей и следующие шаги',
            result: 'Отмечены и зафиксированы задачи, формат и размер сайта'
        },
        {
            id: 2,
            title: 'Создание сайта',
            subtitle: 'День 1 - 3 (зависит от проекта)',
            description: 'Доработка макета, структуры и функционала под бизнес и цели',
            result: 'Готовый интернет магазин с базовым функционалом и дизайном'
        },
        {
            id: 3,
            title: 'Наполнение товарами',
            subtitle: 'День 1 - 8 (от количества товара)',
            description: 'Размещение и наполнение карточек: изображением, описанием, ценами и категориями.',
            result: 'В полном объеме наполнен контентом'
        },
        {
            id: 4,
            title: 'Подключение оплат',
            subtitle: 'День 1 - 3',
            description: 'Интеграция платежных систем, настройка корректной работы приема расчета',
            result: 'Интернет-магазин принимает онлайн платеж'
        },
        {
            id: 5,
            title: 'Выдача доступов',
            subtitle: 'День завершения работ',
            description: 'В случае аренды, доступ выдается только к админ панели. Если же купить готовый интернет-магазин, доступы передаются после подписания договора',
            result: 'Управление полностью переходит под контроль владельца'
        },
        {
            id: 6,
            title: 'Поддержка и развитие',
            subtitle: 'На постоянной основе',
            description: 'Своевременное техническое обслуживание на весь срок: обновления и улучшения.',
            result: 'Стабильная работа сайта и развитие'
        }
    ];

    return (
        <section className="work-stages-section">
            <Container>
                <Row className="text-center mb-5">
                    <Col>
                        <h2 className="section-title">
                            Этапы работы
                        </h2>
                        <p className="section-subtitle">
                            Процесс максимально прозрачен и прост.
                        </p>
                    </Col>
                </Row>

                <div className="work-stages-container">
                    {stages.map((stage) => (
                        <div
                            className="stage-card"
                            key={stage.id}
                            data-aos="fade-up"
                            data-aos-delay={(stage.id - 1) * 100}
                        >
                            <div className="stage-number">
                                {stage.id < 10 ? `0${stage.id}` : stage.id}
                            </div>

                            <div className="stage-content">
                                <div className="stage-header">
                                    <h3 className="stage-title">{stage.title}</h3>
                                    <div className="stage-subtitle">{stage.subtitle}</div>
                                </div>

                                <div className="stage-body">
                                    <p className="stage-description">{stage.description}</p>

                                    <div className="stage-result">
                                        <div className="result-label">Итог:</div>
                                        <div className="result-text">{stage.result}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="stage-glow"></div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default WorkStages;
