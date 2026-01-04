import { useRef } from 'react';
import './Reviews.css';

const Reviews = () => {
    const scrollContainerRef = useRef(null);

    const reviews = [
        {
            id: 1,
            name: "Анна",
            business: "Владелец магазина одежды",
            text: "«Благодаря сайту заказы выросли на 30%! Очень довольна скоростью и качеством работы.»",
            avatar: "👩‍💼",
            type: "Лендинг сайт",
            rating: 5
        },
        {
            id: 2,
            name: "Максим",
            business: "Цветочный салон",
            text: "«Сайт выглядит прекрасно и очень удобен для клиентов. Техподдержка всегда на связи.»",
            avatar: "👨‍🔬",
            type: "Лендинг сайт",
            rating: 4
        },
        {
            id: 3,
            name: "Елена",
            business: "Детские товары",
            text: "«Отличное решение для нашего бизнеса. Продажи в первый же месяц превзошли ожидания.»",
            avatar: "👩‍👦",
            type: "Лендинг сайт",
            rating: 5
        },
        {
            id: 4,
            name: "Дмитрий",
            business: "Сантехнические услуги",
            text: "«Благодаря сайту клиентов стало в 3 раза больше! Получаем заявки каждый день, сайт окупился за месяц.»",
            avatar: "👨‍🔧",
            type: "Лендинг для сантехники",
            rating: 5
        },
        {
            id: 5,
            name: "Сергей",
            business: "Магазин сантехники",
            text: "«Профессиональный сайт с онлайн-заказом помог увеличить продажи на 40%. Очень удобный личный кабинет для клиентов.»",
            avatar: "👨‍💼",
            type: "Интернет-магазин сантехники",
            rating: 4
        },
        {
            id: 6,
            name: "Ольга",
            business: "Салон красоты 'Элегант'",
            text: "«Красивый и функциональный сайт привлекает новых клиентов. Онлайн-запись экономит время персонала и удобна для клиентов.»",
            avatar: "💇‍♀️",
            type: "Лендинг салона красоты",
            rating: 5
        }
    ];

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    // Функция для рендеринга SVG-звезд рейтинга
    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <svg
                key={index}
                className={`star-svg ${index < rating ? 'filled' : 'empty'}`}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
        ));
    };

    return (
        <section className="reviews-section section-padding" id="reviews">
            <div className="container-custom">
                {/* Заголовок секции */}
                <div className="text-center mb-5" data-aos="fade-up">
                    <h2 className="section-title">Отзывы клиентов</h2>
                    <p className="section-subtitle">
                        Доверие клиентов — главная ценность. Прочитайте, как наши решения помогли увеличить продажи и улучшить поток новых клиентов.
                    </p>
                </div>

                {/* Кнопки навигации для десктопа */}
                <div className="reviews-navigation desktop-only" data-aos="fade-up" data-aos-delay="100">
                    <button className="nav-btn nav-prev" onClick={scrollLeft} aria-label="Предыдущие отзывы">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button className="nav-btn nav-next" onClick={scrollRight} aria-label="Следующие отзывы">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                {/* Контейнер с отзывами и скроллом */}
                <div className="reviews-container-wrapper" data-aos="fade-up" data-aos-delay="200">
                    <div className="reviews-scroll-container" ref={scrollContainerRef}>
                        {reviews.map((review) => (
                            <div key={review.id} className="review-card">
                                {/* Тип сайта */}
                                <div className="review-type">
                                    <span className="type-badge">{review.type}</span>
                                </div>

                                {/* Текст отзыва */}
                                <div className="review-text">
                                    <p>{review.text}</p>
                                </div>

                                {/* Разделитель */}
                                <div className="review-divider"></div>

                                {/* Информация о клиенте */}
                                <div className="review-client">
                                    <div className="client-avatar">
                                        {review.avatar}
                                    </div>
                                    <div className="client-info">
                                        <h4 className="client-name">{review.name}</h4>
                                        <p className="client-business">{review.business}</p>
                                    </div>
                                </div>

                                {/* Рейтинг - теперь из данных */}
                                <div className="review-rating">
                                    <div className="stars-container">
                                        {renderStars(review.rating)}
                                    </div>
                                    <span className="rating-text">{review.rating}/5</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Индикаторы прокрутки для мобильных */}
                <div className="scroll-indicators mobile-only">
                    <div className="indicator active"></div>
                    <div className="indicator"></div>
                    <div className="indicator"></div>
                </div>

                {/* Кнопки навигации для мобильных */}
                <div className="reviews-navigation mobile-only" data-aos="fade-up" data-aos-delay="300">
                    <button className="nav-btn nav-prev" onClick={scrollLeft} aria-label="Предыдущие отзывы">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button className="nav-btn nav-next" onClick={scrollRight} aria-label="Следующие отзывы">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Reviews;