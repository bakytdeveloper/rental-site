import { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { siteAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import SiteCard from '../SiteCard/SiteCard';
import './FeaturedSites.css';

const FeaturedSites = () => {
    const [featuredSites, setFeaturedSites] = useState([]);
    const { loading, startLoading, stopLoading } = useLoading();
    const hasFetched = useRef(false); // Используем useRef вместо useState

    // Выносим функцию с useCallback, чтобы она не пересоздавалась
    const fetchFeaturedSites = useCallback(async () => {
        // Если уже загружали, не загружаем снова
        if (hasFetched.current) {
            console.log('Featured sites already fetched, skipping');
            return;
        }

        hasFetched.current = true;
        startLoading();

        try {
            console.log('Fetching featured sites...');
            const response = await siteAPI.getFeatured();

            const sites = response.data.data || response.data.sites || [];
            setFeaturedSites(sites);
            console.log(`Successfully loaded ${sites.length} featured sites`);
        } catch (error) {
            console.error('Ошибка при загрузке рекомендуемых сайтов:', error);
            setFeaturedSites([]);
            hasFetched.current = false; // Сбрасываем флаг при ошибке
        } finally {
            stopLoading();
        }
    }, [startLoading, stopLoading]); // Зависимости только от функций контекста

    useEffect(() => {
        fetchFeaturedSites();
    }, [fetchFeaturedSites]); // Теперь зависит от мемоизированной функции

    // Структурированные данные для коллекции
    const collectionStructuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Рекомендуемые сайты для аренды",
        "description": "Коллекция премиальных сайтов, доступных для аренды",
        "url": "https://rentalsite.kz/",
        "numberOfItems": featuredSites.length,
        "itemListElement": featuredSites.map((site, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Product",
                "name": site.title,
                "url": `https://rentalsite.kz/catalog/${site._id}`,
                "image": site.images && site.images.length > 0
                    ? `https://rentalsite.kz${site.images[0]}`
                    : undefined,
                "offers": {
                    "@type": "Offer",
                    "price": site.price,
                    "priceCurrency": "KZT"
                }
            }
        }))
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

    console.log('FeaturedSites rendering, sites count:', featuredSites.length); // Для отладки

    return (
        <section className="featured-sites-section" itemScope itemType="https://schema.org/ItemList">
            <script type="application/ld+json">
                {JSON.stringify(collectionStructuredData)}
            </script>

            <meta itemProp="name" content="Рекомендуемые сайты" />
            <meta itemProp="description" content="Коллекция премиальных сайтов, доступных для аренды" />
            <Container className="container-custom">
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