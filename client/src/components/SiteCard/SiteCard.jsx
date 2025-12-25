import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import './SiteCard.css';

const SiteCard = ({ site, index }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const images = site.images || [];
    const hasMultipleImages = images.length > 1;

    // Генерация структурированных данных для карточки
    const generateProductData = () => {
        return {
            "@type": "Product",
            "name": site.title,
            "description": site.shortDescription,
            "image": images.length > 0 ? `https://rentalsite.kz${images[0]}` : undefined,
            "offers": {
                "@type": "Offer",
                "price": site.price,
                "priceCurrency": "KZT",
                "availability": site.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            },
            "url": `https://rentalsite.kz/catalog/${site._id}`
        };
    };


    const handleNextImage = () => {
        if (hasMultipleImages) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    const handlePrevImage = () => {
        if (hasMultipleImages) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? images.length - 1 : prevIndex - 1
            );
        }
    };

    const handleTouchStart = (e) => {
        if (!hasMultipleImages) return;
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        if (!hasMultipleImages) return;
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd || !hasMultipleImages) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            handleNextImage();
        } else if (isRightSwipe) {
            handlePrevImage();
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    return (
        <div
            className="site-card"
            data-aos="fade-up"
            data-aos-delay={index * 100}
            itemScope
            itemType="https://schema.org/Product"
            itemID={`https://rentalsite.kz/catalog/${site._id}`}
        >

            <meta itemProp="name" content={site.title} />
            <meta itemProp="description" content={site.shortDescription} />
            <meta itemProp="category" content={site.category} />
            {images.length > 0 && (
                <meta itemProp="image" content={`https://rentalsite.kz${images[0]}`} />
            )}
            <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <meta itemProp="price" content={site.price} />
                <meta itemProp="priceCurrency" content="KZT" />
                <meta itemProp="availability" content={site.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                <meta itemProp="url" content={`https://rentalsite.kz/catalog/${site._id}`} />
            </div>

            <div className="site-card__inner">
                <div className="site-card__image-container">
                    {images.length > 0 ? (
                        <div
                            className="site-card__image-slider"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <img
                                src={`http://localhost:5000${images[currentImageIndex]}`}
                                alt={`${site.title} - ${currentImageIndex + 1}`}
                                onLoad={() => setImageLoaded(true)}
                                className="site-card__slider-image"
                                style={{ opacity: imageLoaded ? 1 : 0 }}
                            />

                            {!imageLoaded && (
                                <div className="site-card__image-placeholder"></div>
                            )}

                            {hasMultipleImages && (
                                <>
                                    <button
                                        className="site-card__slider-btn site-card__slider-btn--prev"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrevImage();
                                        }}
                                        aria-label="Предыдущее изображение"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <button
                                        className="site-card__slider-btn site-card__slider-btn--next"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNextImage();
                                        }}
                                        aria-label="Следующее изображение"
                                    >
                                        <ChevronRight size={20} />
                                    </button>

                                    <div className="site-card__slider-dots">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                className={`site-card__slider-dot ${idx === currentImageIndex ? 'site-card__slider-dot--active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(idx);
                                                }}
                                                aria-label={`Перейти к изображению ${idx + 1}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="site-card__slider-counter">
                                        {currentImageIndex + 1} / {images.length}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="site-card__image-placeholder">
                            <span>🌐</span>
                        </div>
                    )}

                    <div className="site-card__overlay">
                        <div className="site-card__overlay-content">
                            <Button
                                as={Link}
                                to={`/catalog/${site._id}`}
                                className="site-card__btn-quick-view"
                                size="sm"
                            >
                                Быстрый просмотр
                            </Button>
                        </div>
                    </div>

                    {site.isFeatured && (
                        <div className="site-card__badge site-card__badge--featured">
                            Рекомендуемый
                        </div>
                    )}
                </div>

                <div className="site-card__content">
                    <div className="site-card__header">
                        <h3 className="site-card__title">{site.title}</h3>
                        <div className="site-card__price">
                            ₸{site.price}<span>/месяц</span>
                        </div>
                    </div>

                    <p className="site-card__description">
                        {site.shortDescription}
                    </p>

                    <div className="site-card__features">
                        {site.technologies && site.technologies.slice(0, 3).map((tech, techIndex) => (
                            <span key={techIndex} className="site-card__tech-tag">
                                {tech}
                            </span>
                        ))}
                        {site.technologies && site.technologies.length > 3 && (
                            <span className="site-card__tech-tag site-card__tech-tag--more">
                                +{site.technologies.length - 3}
                            </span>
                        )}
                    </div>

                    <div className="site-card__footer">
                        <div className="site-card__meta">
                            <span className="site-card__category">{site.category}</span>
                        </div>
                        <Button
                            as={Link}
                            to={`/catalog/${site._id}`}
                            className="site-card__btn-rent-now"
                            size="sm"
                        >
                            Арендовать
                        </Button>
                    </div>
                </div>

                <div className="site-card__glow"></div>
            </div>
        </div>
    );
};

export default SiteCard;