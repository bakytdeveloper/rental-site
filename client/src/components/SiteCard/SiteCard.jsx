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
        >
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
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <button
                                        className="site-card__slider-btn site-card__slider-btn--next"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNextImage();
                                        }}
                                        aria-label="Next image"
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
                                                aria-label={`Go to image ${idx + 1}`}
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
                                Quick View
                            </Button>
                        </div>
                    </div>

                    {site.isFeatured && (
                        <div className="site-card__badge site-card__badge--featured">
                            Featured
                        </div>
                    )}
                </div>

                <div className="site-card__content">
                    <div className="site-card__header">
                        <h3 className="site-card__title">{site.title}</h3>
                        <div className="site-card__price">
                            ${site.price}<span>/month</span>
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
                            Rent Now
                        </Button>
                    </div>
                </div>

                <div className="site-card__glow"></div>
            </div>
        </div>
    );
};

export default SiteCard;