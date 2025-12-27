import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert, Modal, Form, Badge } from 'react-bootstrap';
import { siteAPI, contactAPI } from '../services/api';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-toastify';
import SEO from '../components/SEO/SEO';
import './SiteDetail.css';

const SiteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [site, setSite] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: `Я заинтересован в аренде этого сайта и хотел бы узнать больше о процессе аренды, ценах и требованиях к настройке.`
    });
    const { loading, startLoading, stopLoading } = useLoading();

    const location = useLocation();

    // Функция для прокрутки наверх
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        scrollToTop();
    }, [location.search]);

    // Генерация структурированных данных для сайта
    const generateStructuredData = (siteData) => {
        if (!siteData) return null;

        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": siteData.title,
            "description": siteData.description,
            "image": siteData.images && siteData.images.length > 0
                ? `https://rentalsite.kz${siteData.images[0]}`
                : "https://rentalsite.kz/images/default-site.jpg",
            "category": siteData.category,
            "sku": siteData._id,
            "offers": {
                "@type": "Offer",
                "price": siteData.price,
                "priceCurrency": "KZT",
                "availability": siteData.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "url": `https://rentalsite.kz/catalog/${siteData._id}`,
                "description": `Аренда сайта "${siteData.title}" за ${siteData.price} тг/месяц`
            },
            "brand": {
                "@type": "Brand",
                "name": "RentalSite"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "24"
            }
        };
    };

    // Эффекты для прокрутки...
    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 100);
        return () => clearTimeout(timer);
    }, [id]);

    useEffect(() => {
        const handleLoad = () => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };
        handleLoad();
        window.addEventListener('load', handleLoad);
        return () => {
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    // Эффект для загрузки данных сайта
    useEffect(() => {
        if (id) {
            fetchSiteDetail();
        }
        // eslint-disable-next-line
    }, [id]);

    const fetchSiteDetail = async () => {
        startLoading();
        try {
            const response = await siteAPI.getById(id);
            setSite(response.data);
            setContactForm(prev => ({
                ...prev,
                message: `Я заинтересован в аренде сайта "${response.data.title}" и хотел бы узнать больше о процессе аренды, ценах и требованиях к настройке.`
            }));
        } catch (error) {
            console.error('Ошибка при загрузке деталей сайта:', error);
            toast.error('Не удалось загрузить информацию о сайте');
            navigate('/catalog');
        } finally {
            stopLoading();
        }
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        startLoading();

        try {
            const contactData = {
                name: contactForm.name.trim(),
                email: contactForm.email.trim(),
                phone: contactForm.phone.trim() || 'Не указан',
                company: contactForm.company.trim() || '',
                message: contactForm.message.trim(),
                siteId: id,
                siteTitle: site.title,
                subject: `Запрос на аренду: ${site.title}`
            };

            console.log('📤 Отправка данных контакта:', contactData);

            const response = await contactAPI.create(contactData);

            if (response.data.success) {
                toast.success('🎉 Ваш запрос на аренду отправлен! Мы свяжемся с вами в течение 24 часов.');
                setShowContactModal(false);
                setContactForm({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    message: `Я заинтересован в аренде сайта "${site.title}" и хотел бы узнать больше о процессе аренды, ценах и требованиях к настройке.`
                });
            }
        } catch (error) {
            console.error('❌ Ошибка при отправке формы:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.join(', ') ||
                'Не удалось отправить запрос. Пожалуйста, попробуйте еще раз.';

            toast.error(errorMessage);
        } finally {
            stopLoading();
        }
    };

    const handleInputChange = (e) => {
        setContactForm({
            ...contactForm,
            [e.target.name]: e.target.value
        });
    };

    const scrollToRent = () => {
        const element = document.getElementById('rent-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading && !site) {
        return (
            <div className="site-detail-loading text-center mt-5">
                <Container>
                    <div className="d-flex flex-column align-items-center justify-content-center py-5">
                        <Spinner animation="border" variant="primary" className="mb-3" />
                        <p className="text-muted">Загружаем детали сайта...</p>
                    </div>
                </Container>
            </div>
        );
    }

    if (!site) {
        return (
            <Container className="mt-4">
                <Alert variant="danger" className="mt-4">
                    <h4>Сайт не найден</h4>
                    <p>Сайт, который вы ищете, не существует или был удален.</p>
                    <Button as={Link} to="/catalog" variant="primary" className="btn-primary-custom">
                        Вернуться в каталог
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <div className="site-detail-page">
            {/* SEO компонент для детальной страницы сайта */}
            <SEO
                title={`Аренда ${site.title} - ${site.category} за ${site.price} тг/месяц`}
                description={`Арендуйте ${site.title} - профессиональный ${site.category.toLowerCase()}. ${site.description.substring(0, 150)}... ${site.price} тг/месяц, техподдержка 24/7.`}
                keywords={`аренда ${site.category.toLowerCase()} ${site.title}, сайт ${site.category.toLowerCase()} аренда, ${site.technologies ? site.technologies.join(', ') : ''}, аренда сайта Казахстан`}
                canonical={`https://rentalsite.kz/catalog/${site._id}`}
                ogType="product"
                ogImage={site.images && site.images.length > 0 ? `https://rentalsite.kz${site.images[0]}` : undefined}
                structuredData={generateStructuredData(site)}
            />

            <Container className="container-custom">
                {/* Хлебные крошки */}
                <nav className="site-detail-breadcrumb-nav mb-4">
                    <Link to="/" className="site-detail-breadcrumb-link">Главная</Link>
                    <span className="site-detail-breadcrumb-separator mx-1">/</span>
                    <Link to="/catalog" className="site-detail-breadcrumb-link">Каталог</Link>
                    <span className="site-detail-breadcrumb-separator mx-1">/</span>
                    <span className="site-detail-breadcrumb-current">{site.title}</span>
                </nav>

                <Row className="site-detail-content g-4">
                    {/* Галерея */}
                    <Col lg={7}>
                        <div className="site-detail-gallery-section">
                            <div className="site-detail-main-gallery card-custom">
                                <div className="site-detail-main-image-container">
                                    {site.images && site.images.length > 0 ? (
                                        <img
                                            src={`http://localhost:5000${site.images[selectedImage]}`}
                                            alt={site.title}
                                            className="site-detail-gallery-main-img"
                                        />
                                    ) : (
                                        <div className="no-image-placeholder d-flex flex-column align-items-center justify-content-center h-100">
                                            <span className="display-4 mb-2">🌐</span>
                                            <p className="text-muted">Предпросмотр недоступен</p>
                                        </div>
                                    )}
                                    {site.isFeatured && (
                                        <Badge className="site-detail-featured-badge-large">⭐ Рекомендуемый сайт</Badge>
                                    )}
                                </div>

                                {/* Навигация по изображениям */}
                                {site.images && site.images.length > 1 && (
                                    <div className="site-detail-image-navigation">
                                        <Button
                                            variant="outline-light"
                                            className="site-detail-nav-btn prev-btn btn-outline-custom"
                                            onClick={() => setSelectedImage(prev =>
                                                prev === 0 ? site.images.length - 1 : prev - 1
                                            )}
                                        >
                                            ‹
                                        </Button>
                                        <span className="site-detail-image-counter">
                                            {selectedImage + 1} / {site.images.length}
                                        </span>
                                        <Button
                                            variant="outline-light"
                                            className="site-detail-nav-btn next-btn btn-outline-custom"
                                            onClick={() => setSelectedImage(prev =>
                                                prev === site.images.length - 1 ? 0 : prev + 1
                                            )}
                                        >
                                            ›
                                        </Button>
                                    </div>
                                )}

                                {/* Галерея миниатюр */}
                                {site.images && site.images.length > 1 && (
                                    <div className="site-detail-thumbnail-gallery">
                                        {site.images.map((image, index) => (
                                            <button
                                                key={index}
                                                className={`site-detail-thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
                                                onClick={() => setSelectedImage(index)}
                                            >
                                                <img
                                                    src={`http://localhost:5000${image}`}
                                                    alt={`${site.title} вид ${index + 1}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>

                    {/* Информация о сайте */}
                    <Col lg={5}>
                        <div className="site-detail-info-section card-custom card-custom-padding">
                            <div className="site-header">
                                <div className="site-detail-meta-badges mb-3">
                                    <Badge bg="primary" className="site-detail-category-badge">
                                        {site.category}
                                    </Badge>
                                    {site.isActive && (
                                        <Badge bg="success" className="site-detail-status-badge">
                                            ✅ Доступен
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="site-detail-title text-gradient mb-3">{site.title}</h1>

                                <div className="site-detail-price-section mb-4">
                                    <div className="site-detail-price-amount">₸{site.price}</div>
                                    <div className="site-detail-price-period">/ месяц</div>
                                </div>

                                <p className="site-detail-description text-dark mb-4">{site.description}</p>
                            </div>

                            {/* Быстрые действия */}
                            <div className="site-detail-quick-actions mb-4">
                                <Button
                                    className="site-detail-btn-rent-now-main btn-primary-custom mb-2 mb-md-0"
                                    size="lg"
                                    onClick={scrollToRent}
                                >
                                    💳 Арендовать этот сайт
                                </Button>
                                <Button
                                    variant="outline-light"
                                    className="btn-rent-now btn-outline-custom"
                                    size="lg"
                                    onClick={() => setShowContactModal(true)}
                                >
                                    💬 Быстрый запрос
                                </Button>
                            </div>

                            {/* Ключевые особенности */}
                            {site.features && site.features.length > 0 && (
                                <div className="site-detail-key-features mb-4">
                                    <h4 className="highlight-text mb-3">🚀 Ключевые особенности</h4>
                                    <div className="site-detail-features-grid">
                                        {site.features.map((feature, index) => (
                                            <div key={index} className="site-detail-feature-item">
                                                <span className="site-detail-feature-icon text-primary">✓</span>
                                                <span className="site-detail-feature-text">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Технологии */}
                            {site.technologies && site.technologies.length > 0 && (
                                <div className="site-detail-technologies-section mb-4">
                                    <h4 className="highlight-text mb-3">🛠️ Создано с использованием</h4>
                                    <div className="site-detail-tech-tags">
                                        {site.technologies.map((tech, index) => (
                                            <Badge key={index} bg="outline-info" className="site-detail-tech-tag me-2 mb-2">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Демо ссылка */}
                            {site.demoUrl && (
                                <div className="site-detail-demo-section">
                                    <h4 className="highlight-text mb-3">🌐 Живая демо-версия</h4>
                                    <a
                                        href={site.demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="site-detail-demo-link-btn btn-primary-custom d-inline-block"
                                    >
                                        Посетить сайт ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>

                {/* Раздел аренды */}
                <section id="rent-section" className="site-detail-rent-section section-padding">
                    <Row>
                        <Col lg={12} className="mx-auto">
                            <div className="site-detail-rent-card card-custom">
                                <h2 className="section-title mb-3">Готовы арендовать этот сайт?</h2>
                                <p className="site-detail-rent-description section-subtitle mb-4">
                                    Начните использовать этот премиальный сайт уже сегодня. Заполните форму ниже,
                                    и наша команда свяжется с вами для обсуждения процесса аренды.
                                </p>

                                <div className="site-detail-rent-benefits mb-5">
                                    <div className="site-detail-benefit-item">
                                        <span className="site-detail-benefit-icon">⚡</span>
                                        <div>
                                            <h5>Мгновенная настройка</h5>
                                            <p className="text-muted">Ваш сайт будет запущен в течение 24 часов</p>
                                        </div>
                                    </div>
                                    <div className="site-detail-benefit-item">
                                        <span className="site-detail-benefit-icon">🔧</span>
                                        <div>
                                            <h5>Полная поддержка</h5>
                                            <p className="text-muted">Техническая поддержка и обслуживание включены</p>
                                        </div>
                                    </div>
                                    <div className="site-detail-benefit-item">
                                        <span className="site-detail-benefit-icon">🔄</span>
                                        <div>
                                            <h5>Гибкие условия</h5>
                                            <p className="text-muted">Месячная аренда с возможностью отмены в любое время</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="site-detail-btn-rent-now-large btn-primary-custom"
                                    size="lg"
                                    onClick={() => setShowContactModal(true)}
                                >
                                    Начать аренду - ₸{site.price}/месяц
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </section>

                {/* Похожие сайты */}
                <RelatedSites currentSiteId={site._id} category={site.category} />
            </Container>

            {/* Модальное окно контакта */}
            <Modal
                show={showContactModal}
                onHide={() => setShowContactModal(false)}
                centered
                size="lg"
                className="site-detail-contact-modal"
            >
                <Modal.Header closeButton className="border-bottom">
                    <div>
                        <Modal.Title className="text-light">Арендовать {site.title}</Modal.Title>
                        <div className="site-detail-modal-subtitle text-muted">
                            ₸{site.price}/месяц • {site.category}
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="site-detail-rental-summary mb-4">
                        <div className="site-detail-summary-item">
                            <span className="text-muted">Сайт:</span>
                            <strong className="text-primary">{site.title}</strong>
                        </div>
                        <div className="site-detail-summary-item">
                            <span className="text-muted">Месячная цена:</span>
                            <strong className="text-primary">₸{site.price}</strong>
                        </div>
                        <div className="site-detail-summary-item">
                            <span className="text-muted">Категория:</span>
                            <strong className="text-primary">{site.category}</strong>
                        </div>
                    </div>

                    <Form onSubmit={handleContactSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Полное имя *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={contactForm.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Введите ваше полное имя"
                                        disabled={loading}
                                        className="bg-secondary-bg text-light border-secondary"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Email адрес *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={contactForm.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Введите ваш email"
                                        disabled={loading}
                                        className="bg-secondary-bg text-light border-secondary"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Номер телефона *</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={contactForm.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Введите ваш номер телефона"
                                        disabled={loading}
                                        className="bg-secondary-bg text-light border-secondary"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Компания</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="company"
                                        value={contactForm.company}
                                        onChange={handleInputChange}
                                        placeholder="Ваша компания (необязательно)"
                                        disabled={loading}
                                        className="bg-secondary-bg text-light border-secondary"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label className="text-light">Ваше сообщение *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                name="message"
                                value={contactForm.message}
                                onChange={handleInputChange}
                                required
                                placeholder="Расскажите нам о ваших потребностях в аренде..."
                                disabled={loading}
                                className="bg-secondary-bg text-light border-secondary"
                            />
                        </Form.Group>

                        <div className="site-detail-modal-actions">
                            <Button
                                variant="outline-light"
                                onClick={() => setShowContactModal(false)}
                                className="me-2 btn-outline-custom"
                                disabled={loading}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                className="site-detail-btn-submit-request btn-primary-custom"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Отправка...
                                    </>
                                ) : (
                                    '📧 Отправить запрос на аренду'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

// Компонент похожих сайтов
const RelatedSites = ({ currentSiteId, category }) => {
    const [relatedSites, setRelatedSites] = useState([]);
    // eslint-disable-next-line
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRelatedSites();
        // eslint-disable-next-line
    }, [category, currentSiteId]);

    const fetchRelatedSites = async () => {
        try {
            const response = await siteAPI.getAll({
                category: category,
                limit: 4
            });
            const filtered = response.data.sites.filter(site => site._id !== currentSiteId);
            setRelatedSites(filtered.slice(0, 3));
        } catch (error) {
            console.error('Ошибка при загрузке похожих сайтов:', error);
        } finally {
            setLoading(false);
        }
    };

    if (relatedSites.length === 0) return null;

    return (
        <section className="site-detail-related-sites-section mt-5">
            <h2 className="site-detail-section-title section-title text-center mb-4">Похожие сайты, которые могут вам понравиться</h2>
            <Row className="g-4">
                {relatedSites.map((site) => (
                    <Col lg={4} key={site._id}>
                        <div className="site-detail-related-site-card card-custom h-100">
                            <div className="site-detail-related-site-image">
                                {site.images && site.images.length > 0 ? (
                                    <img
                                        src={`http://localhost:5000${site.images[0]}`}
                                        alt={site.title}
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                ) : (
                                    <div className="no-image d-flex align-items-center justify-content-center h-100 bg-accent-bg">
                                        <span className="display-4">🌐</span>
                                    </div>
                                )}
                                {site.isFeatured && (
                                    <Badge className="site-detail-related-featured-badge">Рекомендуемый</Badge>
                                )}
                            </div>
                            <div className="site-detail-related-site-info p-3">
                                <h4 className="text-light mb-2">{site.title}</h4>
                                <p className="site-detail-related-site-description text-muted mb-2">{site.shortDescription}</p>
                                <div className="site-detail-related-site-price text-primary mb-3">₸{site.price}/месяц</div>
                                <Button
                                    as={Link}
                                    to={`/catalog/${site._id}`}
                                    size="sm"
                                    variant="outline"
                                    className="site-detail-btn-view-related btn-outline-custom w-100"
                                >
                                    Подробнее
                                </Button>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </section>
    );
};

export default SiteDetail;