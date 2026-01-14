import { Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react'; // Добавляем импорт useState
import './ComparisonTable.css';

const ComparisonTable = () => {
    // Состояние для отслеживания открытых карточек в мобильной версии
    const [openMobileCard, setOpenMobileCard] = useState(null);

    const competitors = [
        {
            name: 'RentalSite',
            advantages: [
                'IT-продукт + бизнес-модель',
                '3–8 дней',
                '100% (под ключ)',
                '✅',
                '✅ включён',
                '✅ включено',
                '✅ включено',
                '✅',
                '✅',
                '✅ (уникально)',
                '✅ по договору',
                '✅',
                '✅ заложено',
                'Включено',
                'Ниже рынка на 40–60%',
                'Минимальный'
            ],
            isPrimary: true
        },
        {
            name: 'Веб-студии (KZ)',
            advantages: [
                'Услуга',
                '30–90 дней',
                'Частично',
                '✅',
                '✅',
                'Частично',
                '✅',
                'Иногда',
                '✅',
                '✅',
                '✅',
                'Частично',
                '✅',
                'Платно',
                'Высокая',
                'Высокий'
            ],
            isPrimary: false
        },
        {
            name: 'SaaS-платформы',
            advantages: [
                'SaaS-сервис',
                '1–3 дня',
                'Частично',
                '✅',
                '✅',
                '✅',
                'Ограничено',
                '✅',
                '✅',
                '✅',
                '✅',
                '✅',
                'Ограничено',
                'Ограничено',
                'Средняя',
                'Средний'
            ],
            isPrimary: false
        },
        {
            name: 'Маркетинг-агентства',
            advantages: [
                'Услуга',
                '14–30 дней',
                '✅',
                '✅',
                '✅',
                'Частично',
                '✅',
                '✅',
                '✅',
                '✅',
                '✅',
                'Частично',
                '✅',
                'Платно',
                'Высокая',
                'Высокий'
            ],
            isPrimary: false
        }
    ];

    const criteria = [
        'Формат продукта',
        'Запуск проекта',
        'Готовность к продажам',
        'Интернет-магазин',
        'Бизнес-план',
        'SEO под ключ',
        'Аналитика и отчётность',
        'Личный кабинет',
        'Аренда сайта',
        'Аренда с выкупом',
        'Переход в собственность',
        'Юридическая фиксация условий',
        'Масштабирование бизнеса',
        'Поддержка и развитие',
        'Совокупная стоимость владения (12 мес.)',
        'Риск для МСБ'
    ];

    const getAdvantageClass = (advantage) => {
        if (advantage === '✅') return 'advantage-check';
        if (advantage.includes('✅')) return 'advantage-included';
        if (advantage.includes('Включено')) return 'advantage-included';
        if (advantage.includes('Ниже рынка')) return 'advantage-best';
        if (advantage.includes('Минимальный')) return 'advantage-best';
        if (advantage.includes('Высокий') || advantage.includes('Средний')) return 'advantage-neutral';
        if (advantage.includes('Платно')) return 'advantage-neutral';
        if (advantage.includes('Частично') || advantage.includes('Ограничено')) return 'advantage-partial';
        if (advantage.includes('Иногда')) return 'advantage-partial';
        return '';
    };

    // Функция для переключения карточки
    const toggleMobileCard = (index) => {
        if (openMobileCard === index) {
            setOpenMobileCard(null); // Закрыть если уже открыта
        } else {
            setOpenMobileCard(index); // Открыть новую
        }
    };

    return (
        <section className="comparison-table-section">
            <Container className="container-custom">
                <Row className="mb-5">
                    <Col lg={10} className="mx-auto text-center">
                        <h2 className="section-title">
                            RentalSite — лучшее решение
                        </h2>
                        <p className="section-subtitle mb-4">
                            Сравните нас с конкурентами и убедитесь в наших преимуществах
                        </p>
                        <div className="badge-primary mb-4">
                            💎 Лучшее предложение на рынке
                        </div>
                    </Col>
                </Row>

                {/* Десктопная версия таблицы */}
                <div className="comparison-table-desktop d-none d-lg-block">
                    <div className="table-responsive">
                        <table className="comparison-table">
                            <thead>
                            <tr>
                                <th className="criteria-col">Критерий сравнения</th>
                                {competitors.map((competitor, index) => (
                                    <th
                                        key={index}
                                        className={`competitor-col ${competitor.isPrimary ? 'primary' : ''}`}
                                    >
                                        <div className="competitor-header">
                                            <span className="competitor-name">{competitor.name}</span>
                                            {competitor.isPrimary && (
                                                <span className="best-badge">ЛУЧШИЙ ВЫБОР</span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {criteria.map((criterion, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="criterion-cell">
                                        <span className="criterion-text">{criterion}</span>
                                    </td>
                                    {competitors.map((competitor, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`advantage-cell ${competitor.isPrimary ? 'primary' : ''}`}
                                        >
                                                <span className={`advantage-text ${getAdvantageClass(competitor.advantages[rowIndex])}`}>
                                                    {competitor.advantages[rowIndex]}
                                                </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Мобильная версия таблицы - АККОРДЕОН */}
                <div className="comparison-table-mobile d-lg-none">
                    {competitors.map((competitor, index) => (
                        <div
                            key={index}
                            className={`competitor-card-mobile ${competitor.isPrimary ? 'primary' : ''} ${openMobileCard === index ? 'open' : ''}`}
                        >
                            {/* Кликабельный заголовок */}
                            <div
                                className="competitor-header-mobile clickable"
                                onClick={() => toggleMobileCard(index)}
                            >
                                <div className="header-content">
                                    <h3 className="competitor-name-mobile">{competitor.name}</h3>
                                    {competitor.isPrimary && (
                                        <span className="best-badge-mobile">🏆 Лучший выбор</span>
                                    )}
                                </div>
                                <div className="mobile-arrow">
                                    {openMobileCard === index ? '▲' : '▼'}
                                </div>
                            </div>

                            {/* Контент, который открывается/закрывается */}
                            <div className={`advantages-container ${openMobileCard === index ? 'open' : ''}`}>
                                <div className="advantages-list">
                                    {criteria.map((criterion, idx) => (
                                        <div key={idx} className="advantage-item-mobile">
                                            <div className="criterion-mobile">{criterion}</div>
                                            <div className={`advantage-mobile ${getAdvantageClass(competitor.advantages[idx])}`}>
                                                {competitor.advantages[idx]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </Container>
        </section>
    );
};

export default ComparisonTable;