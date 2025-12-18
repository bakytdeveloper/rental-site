import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { siteAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import SiteCard from '../SiteCard/SiteCard'; // Импортируем общий компонент
import './FeaturedSites.css';

const FeaturedSites = () => {
    const [featuredSites, setFeaturedSites] = useState([]);
    const { loading, startLoading, stopLoading } = useLoading();

    useEffect(() => {
        fetchFeaturedSites();
        // eslint-disable-next-line
    }, []);

    const fetchFeaturedSites = async () => {
        startLoading();
        try {
            const response = await siteAPI.getFeatured();
            setFeaturedSites(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке рекомендуемых сайтов:', error);
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
                            Рекомендуемые <span className="text-gradient">сайты</span>
                        </h2>
                        <p className="section-subtitle">
                            Изучите нашу тщательно подобранную подборку премиальных сайтов, доступных для аренды
                        </p>
                    </Col>
                </Row>

                <Row>
                    {loading ? (
                        renderSkeleton()
                    ) : (
                        featuredSites.map((site, index) => (
                            <Col lg={4} md={6} key={site._id} className="mb-4">
                                <SiteCard
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
                                Посмотреть все сайты
                                <span className="btn-arrow">→</span>
                            </Button>
                        </Col>
                    </Row>
                )}
            </Container>
        </section>
    );
};

export default FeaturedSites;