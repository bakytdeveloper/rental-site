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
            <div className="card-inner">
                <div className="card-image">
                    {site.images && site.images.length > 0 ? (
                        <>
                            <img
                                src={`http://localhost:5000${site.images[0]}`}
                                alt={site.title}
                                onLoad={() => setImageLoaded(true)}
                                style={{ opacity: imageLoaded ? 1 : 0 }}
                            />
                            {!imageLoaded && <div className="image-placeholder"></div>}
                        </>
                    ) : (
                        <div className="image-placeholder">
                            <span>🌐</span>
                        </div>
                    )}
                    <div className="card-overlay">
                        <div className="overlay-content">
                            <Button
                                as={Link}
                                to={`/catalog/${site._id}`}
                                className="btn-quick-view"
                                size="sm"
                            >
                                Quick View
                            </Button>
                        </div>
                    </div>
                    {site.isFeatured && (
                        <div className="card-badge featured">
                            Featured
                        </div>
                    )}
                </div>

                <div className="card-content">
                    <div className="card-header">
                        <h3 className="site-title">{site.title}</h3>
                        <div className="site-price">
                            ${site.price}<span>/month</span>
                        </div>
                    </div>

                    <p className="site-description">
                        {site.shortDescription}
                    </p>

                    <div className="site-features">
                        {site.technologies && site.technologies.slice(0, 3).map((tech, techIndex) => (
                            <span key={techIndex} className="tech-tag">
                {tech}
              </span>
                        ))}
                        {site.technologies && site.technologies.length > 3 && (
                            <span className="tech-tag more">
                +{site.technologies.length - 3}
              </span>
                        )}
                    </div>

                    <div className="card-footer">
                        <div className="site-meta">
                            <span className="site-category">{site.category}</span>
                        </div>
                        <Button
                            as={Link}
                            to={`/catalog/${site._id}`}
                            className="btn-rent-now"
                            size="sm"
                        >
                            Rent Now
                        </Button>
                    </div>
                </div>

                <div className="card-glow"></div>
            </div>
        </div>
    );
};

export default SiteCard;