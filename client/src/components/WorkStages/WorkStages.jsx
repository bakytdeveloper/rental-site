import { Container, Row, Col } from 'react-bootstrap';
import './WorkStages.css';

const WorkStages = () => {
    const stages = [
        {
            id: 1,
            number: '01',
            title: 'Заявка',
            subtitle: 'День 1',
            description: 'Формирование заявки. Предоставление исходного материала (при наличии). Уточнение и согласование деталей, тонкостей и следующие шаги',
            result: 'Отмечены и зафиксированы задачи, формат и размер сайта',
            side: 'left'
        },
        {
            id: 2,
            number: '02',
            title: 'Создание сайта',
            subtitle: 'День 1 - 3 (зависит от проекта)',
            description: 'Обработка макета, структуры и модулей под бизнес и цели',
            result: 'Готовый интернет магазин с базовым функционалом и дизайном',
            side: 'right'
        },
        {
            id: 3,
            number: '03',
            title: 'Планирование',
            subtitle: 'День 1-3',
            description: 'Анализ конкурентов и рынка, сбор информации. Разработка индивидуального Бизнес плана',
            result: '',
            side: 'left'
        },
        {
            id: 4,
            number: '04',
            title: 'Наполнение товарами',
            subtitle: 'День 1 - 8 (от количества товара)',
            description: 'Размещение и наполнение: изображением, описанием, ценами и категориями.',
            result: 'В полном объеме наполнен контентом',
            side: 'right'
        },
        {
            id: 5,
            number: '05',
            title: 'Подключение оплат',
            subtitle: 'День 1 - 3',
            description: 'Интеграция платежных систем, настройка корректной работы приема расчета',
            result: 'Интернет - магазин принимает онлайн платеж',
            side: 'left'
        },
        {
            id: 6,
            number: '06',
            title: 'Выдача доступов',
            subtitle: 'День завершения работ',
            description: 'В случае аренды, доступ выдается только к административным. Приобретение в собственность, доступы передаются после подписания договора',
            result: 'Управление полностью переходит под контроль владельца',
            side: 'right'
        },
        {
            id: 7,
            number: '07',
            title: 'Поддержка и развитие',
            subtitle: 'На постоянной основе',
            description: 'Своевременное сопровождение на весь срок: обновления, улучшения. Бесплатная консультация.',
            result: 'Стабильная работа и развитие',
            side: 'left'
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

                {/* Вертикальная временная линия */}
                <div className="timeline">
                    {stages.map((stage) => (
                        <div
                            key={stage.id}
                            className={`timeline-item ${stage.side}`}
                            data-aos="fade-up"
                            data-aos-delay={(stage.id - 1) * 100}
                        >
                            <div className="timeline-marker">
                                <div className="timeline-number">
                                    {stage.number}
                                </div>
                            </div>

                            <div className="timeline-content">
                                <div className="stage-card">
                                    <div className="stage-header">
                                        <h3 className="stage-title">{stage.title}</h3>
                                        <span className="stage-subtitle">{stage.subtitle}</span>
                                    </div>

                                    <div className="stage-body">
                                        <p className="stage-description">{stage.description}</p>
                                        {stage.result && (
                                            <div className="stage-result">
                                                <strong>Итог:</strong> {stage.result}
                                            </div>
                                        )}
                                    </div>

                                    <div className="stage-glow"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default WorkStages;