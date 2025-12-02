import { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './SiteCard.css';

const SiteCard = ({ site, index }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div
            className="site-card"
            data-aos="fade-up"
            data-aos-delay={index * 100}
        >
            <div className="site-card__inner">
                <div className="site-card__image">
                    {site.images && site.images.length > 0 ? (
                        <>
                            <img
                                src={`http://localhost:5000${site.images[0]}`}
                                alt={site.title}
                                onLoad={() => setImageLoaded(true)}
                                style={{ opacity: imageLoaded ? 1 : 0 }}
                            />
                            {!imageLoaded && <div className="site-card__image-placeholder"></div>}
                        </>
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