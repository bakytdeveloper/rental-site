import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { siteAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import './FeaturedSites.css';

const FeaturedSites = () => {
    const [featuredSites, setFeaturedSites] = useState([]);
    const { loading, startLoading, stopLoading } = useLoading();

    useEffect(() => {
        fetchFeaturedSites();
    }, []);

    const fetchFeaturedSites = async () => {
        startLoading();
        try {
            const response = await siteAPI.getFeatured();
            setFeaturedSites(response.data);
        } catch (error) {
            console.error('Error fetching featured sites:', error);
        } finally {
            stopLoading();
        }
    };

    const renderSkeleton = () => {
        return Array.from({ length: 3 }).map((_, index) => (
            <Col lg={4} md={6} key={index} className="mb-4">
                <div className="site-card-skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                        <div className="skeleton-button"></div>
                    </div>
                </div>
            </Col>
        ));
    };

    return (
        <section className="featured-sites-section">
            <Container>
                <Row className="text-center mb-5">
                    <Col>
                        <h2 className="section-title">
                            Featured <span className="text-gradient">Websites</span>
                        </h2>
                        <p className="section-subtitle">
                            Explore our handpicked selection of premium websites available for rent
                        </p>
                    </Col>
                </Row>

                <Row>
                    {loading ? (
                        renderSkeleton()
                    ) : (
                        featuredSites.map((site, index) => (
                            <Col lg={4} md={6} key={site._id} className="mb-4">
                                <FeaturedSiteCard
                                    site={site}
                                    index={index}
                                />
                            </Col>
                        ))
                    )}
                </Row>

                {!loading && featuredSites.length > 0 && (
                    <Row className="text-center mt-4">
                        <Col>
                            <Button
                                as={Link}
                                to="/catalog"
                                className="btn-view-all"
                                size="lg"
                            >
                                View All Websites
                                <span className="btn-arrow">→</span>
                            </Button>
                        </Col>
                    </Row>
                )}
            </Container>
        </section>
    );
};

const FeaturedSiteCard = ({ site, index }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div
            className="featured-site-card"
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
                            <span>🚀</span>
                        </div>
                    )}
                    <div className="card-overlay">
                        <div className="overlay-content">
                            <Button
                                as={Link}
                                to={`/catalog/${site._id}`}
                                className="btn-details"
                                size="sm"
                            >
                                View Details
                            </Button>
                        </div>
                    </div>
                    <div className="card-badge">
                        Featured
                    </div>
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
                    </div>

                    <div className="card-footer">
                        <div className="site-category">
                            {site.category}
                        </div>
                        <Button
                            as={Link}
                            to={`/catalog/${site._id}`}
                            className="btn-rent"
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

export default FeaturedSites;