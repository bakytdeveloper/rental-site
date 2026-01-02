import { useState } from 'react';
import './Tariffs.css';

const Tariffs = () => {
    const [activeTariff, setActiveTariff] = useState('Базовый');

    const tariffs = [
        {
            id: 'Базовый',
            title: 'Базовый',
            subtitle: 'Тест ниши, продажи без рисков',
            priceMonthly: '498 000T',
            priceYearly: '688 000T мес.',
            description: 'Идеально для начала бизнеса и тестирования ниши',
            features: [
                'Лэндинг',
                'Многостраничный',
                'Перелинковка',
                'План бизнеса',
                'Логотип',
                'Дизайн (Шаблон, персональный)',
                'Готовая JS-платформа Backend + Frontend',
                'Внешние и внутренние страницы',
                'Каталог до 300+ товаров',
                'Подключение платежных систем',
                'Адаптивная верстка под мобильные устройства',
                'SEO-оптимизация контента',
                'Домен/хостинг',
                'Техническая поддержка',
                'VPS сервер'
            ]
        },
        {
            id: 'Стандарт',
            title: 'Стандарт',
            subtitle: 'Расширенные возможности для роста',
            priceMonthly: '780 000T',
            priceYearly: '938 000T мес.',
            description: 'Для растущего бизнеса с расширенными функциями',
            includes: 'Тариф "Базовый"',
            features: [
                'Наполнение каталога товарами до 800+',
                'Личный кабинет (корзина, история заказов)',
                'Базовое SEO-продвижение',
                'Интеграция Google Search Console, Yandex Вебмастер',
                'Ежемесячная отчетность',
                'Аналитика данных',
                'Акции и баннеры ведение',
                'Значительная поддержка'
            ]
        },
        {
            id: 'Pro',
            title: 'Pro',
            subtitle: 'Максимальный контроль, для масштабирования',
            priceMonthly: '1 280 000T',
            priceYearly: '1 680 000T мес.',
            description: 'Полный пакет для масштабирования бизнеса',
            includes: 'Из плана "Стандарт"',
            features: [
                'Оформление каталога до 1 200+ карточек',
                'Возможность оформления без авторизации',
                'SEO-оптимизация Vip',
                'Стратегии маркетинга, ведение 8 раз в месяц',
                'Частичная реклама',
                'Полный анализ текущего состояния магазина',
                'Сбор статистики, анализ эффективности',
                'Корректировка стратегии маркетинга',
                'Аналитика, отчетность 2 раза в месяц',
                'Поддержка 24/7',
                'Полный функционал',
                'Возможность масштабирования'
            ]
        },
        {
            id: 'Готовый магазин',
            title: 'Купить готовый интернет-магазин',
            subtitle: 'Подготовленный бизнес, под ключ',
            priceMonthly: '1 880 000T',
            priceYearly: '118 888 000T',
            description: 'Готовый бизнес с полной настройкой',
            features: [
                'Лэндинг',
                'Перелинковка страниц',
                'Готовые дизайны, шаблон или индивидуальный',
                'Наполнение каталога товарами до 5 800+',
                'Настройка Seo',
                'Авторская стратегия маркетинга'
            ]
        },
        {
            id: 'Аренда с покупкой',
            title: 'Аренда с покупкой',
            subtitle: 'Отсутствие риска, с переходом в собственность',
            priceMonthly: '588 000T мес.',
            priceYearly: null,
            description: 'Часть платежей принимается в стоимость',
            features: [
                'Лэндинг',
                'Готовый дизайн сайта',
                'Подключение онлайн-оплат',
                'VPS-сервер',
                'Авторская стратегия маркетинга',
                'Внутренние страницы, внешние',
                'Seo продвинутое',
                'Наполнение 2 800+ товаров',
                'Хостинг и домен',
                'Тех. поддержка',
                'Обновления и доработки',
                'Переход в полное владение сайтом',
                'Условия фиксируются в договоре'
            ]
        }
    ];

    const getIcon = (tariffId) => {
        switch(tariffId) {
            case 'Базовый':
                return '🚀';
            case 'Стандарт':
                return '📈';
            case 'Pro':
                return '🏆';
            case 'Готовый магазин':
                return '🏪';
            case 'Аренда с покупкой':
                return '🔄';
            default:
                return '📋';
        }
    };

    const activeTariffData = tariffs.find(tariff => tariff.id === activeTariff);

    return (
        <section className="tariffs-section section-padding" id="tariffs">
            <div className="container-custom">
                {/* Заголовок секции */}
                <div className="text-center mb-5" data-aos="fade-up">
                    <h2 className="section-title">Тарифы для любого бизнеса</h2>
                    <p className="section-subtitle">
                        RentalSite может предоставить несколько тарифных планов. Варианты, соответствующие потребностям и бюджету.
                        От базовой аренды, до покупки с функционалом, уникальным дизайном или пользованием с дальнейшим владением.
                    </p>
                </div>

                {/* Кликабельные карточки тарифов */}
                <div className="tariffs-grid mb-5" data-aos="fade-up" data-aos-delay="100">
                    {tariffs.map((tariff) => (
                        <div
                            key={tariff.id}
                            className={`tariff-card-select ${activeTariff === tariff.id ? 'active' : ''}`}
                            onClick={() => setActiveTariff(tariff.id)}
                        >
                            <div className="tariff-icon">{getIcon(tariff.id)}</div>
                            <h3 className="tariff-title">{tariff.title}</h3>
                            <p className="tariff-subtitle">{tariff.subtitle}</p>

                            {/* Отображение цены в зависимости от типа тарифа */}
                            <div className="tariff-price">
                                <span className="price-main">
                                    {tariff.priceYearly ? tariff.priceMonthly : tariff.priceMonthly}
                                </span>
                                {tariff.priceYearly && (
                                    <span className="price-yearly">
                                        / {tariff.priceYearly.includes('мес.') ? tariff.priceYearly : `${tariff.priceYearly} мес.`}
                                    </span>
                                )}
                            </div>

                            <div className="tariff-indicator">
                                <div className="indicator-dot"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Детальная информация о выбранном тарифе */}
                <div className="tariff-details-container" data-aos="fade-up" data-aos-delay="200">
                    <div className="tariff-details-card">
                        {/* Заголовок детальной информации */}
                        {/* Заголовок детальной информации */}
                        <div className="tariff-details-header">
                            <div className="tariff-details-icon">{getIcon(activeTariff)}</div>
                            <div className="tariff-details-header-content">
                                <h3 className="tariff-details-title">{activeTariffData.title}</h3>
                                <p className="tariff-details-subtitle">{activeTariffData.subtitle}</p>
                                <div className="tariff-details-price">
                                    <span className="details-price-main">{activeTariffData.priceMonthly}</span>
                                    {activeTariffData.priceYearly && (
                                        <span className="details-price-yearly">
                                            / {activeTariffData.priceYearly.includes('мес.') ? activeTariffData.priceYearly : `${activeTariffData.priceYearly} мес.`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Описание тарифа */}
                        <div className="tariff-description">
                            <p>{activeTariffData.description}</p>
                            {activeTariffData.includes && (
                                <p className="includes-note">
                                    <strong>Включает:</strong> {activeTariffData.includes}
                                </p>
                            )}
                        </div>

                        {/* Список функций - разделяем на 3 колонки */}
                        <div className="tariff-features">
                            <h4 className="features-title">Что входит в тариф:</h4>
                            <div className="features-grid">
                                {activeTariffData.features.map((feature, index) => (
                                    <div key={index} className="feature-item">
                                        <span className="feature-check">✓</span>
                                        <span className="feature-item-span">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Кнопка выбора тарифа */}
                        <div className="tariff-cta">
                            {/*<button className="btn-primary-custom w-100">*/}
                            {/*    Выбрать тариф "{activeTariff}"*/}
                            {/*</button>*/}
                            <p className="tariff-note">
                                Все цены указаны в тенге. Возможна оплата в рассрочку.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Tariffs;