import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Container, Row, Col, Form, Button, Navbar, Nav } from 'react-bootstrap';
import { siteAPI } from '../services/api';
import { useLoading } from '../context/LoadingContext';
import SiteCard from '../components/SiteCard/SiteCard';
import SEO from '../components/SEO/SEO';
import { toast } from 'react-toastify';
import './Catalog.css';

const Catalog = () => {
    const [sites, setSites] = useState([]);
    const [filteredSites, setFilteredSites] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: 'all',
        search: '',
        sort: 'newest'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });
    const { loading, startLoading, stopLoading } = useLoading();
    const location = useLocation();

    // Получаем параметры категории из URL
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const pageParam = searchParams.get('page');

    // SEO: динамическое описание на основе категории
    const getCategoryDescription = (category) => {
        const descriptions = {
            'Лендинг': 'Арендуйте продающие лендинги для бизнеса. Высокая конверсия, адаптивный дизайн, быстрый запуск.',
            'Корпоративный сайт': 'Профессиональные корпоративные сайты в аренду. Представьте свою компанию онлайн.',
            'Интернет-магазин': 'Готовые интернет-магазины для e-commerce. Полный функционал, интеграция с платежными системами.',
            'Портфолио': 'Сайты-портфолио для творческих профессионалов. Современный дизайн, удобное управление.',
            'Веб-приложение': 'Современные веб-приложения в аренду. React, Vue, Node.js - передовые технологии.'
        };
        return descriptions[category] || 'Арендуйте профессиональные сайты для бизнеса. Большой выбор категорий, гибкие условия аренды.';
    };

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Каталог сайтов для аренды",
        "description": "Каталог готовых сайтов доступных для аренды",
        "url": "https://rentalsite.kz/catalog",
        "numberOfItems": pagination.total,
        "itemListElement": filteredSites.slice(0, 10).map((site, index) => ({
            "@type": "Product",
            "position": index + 1,
            "url": `https://rentalsite.kz/catalog/${site._id}`,
            "name": site.title,
            "description": site.shortDescription,
            "category": site.category,
            "offers": {
                "@type": "Offer",
                "price": site.price,
                "priceCurrency": "KZT",
                "availability": site.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        }))
    };

    // Функция для прокрутки наверх
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, [location.search]);

    // Загрузка данных при монтировании и изменении страницы
    useEffect(() => {
        fetchSites();
        fetchCategories();
        // eslint-disable-next-line
    }, [pagination.page, categoryParam]);

    // Обработка параметров URL для пагинации
    useEffect(() => {
        if (pageParam && pageParam !== pagination.page.toString()) {
            setPagination(prev => ({ ...prev, page: parseInt(pageParam) }));
        }
        // eslint-disable-next-line
    }, [pageParam]);

    // Обработка параметров URL для категории
    useEffect(() => {
        if (categoryParam && categoryParam !== filters.category) {
            setFilters(prev => ({ ...prev, category: categoryParam }));
            if (categoryParam !== 'all') {
                fetchSitesByCategory(categoryParam);
            } else {
                fetchSites();
            }
        }
        // eslint-disable-next-line
    }, [categoryParam]);

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
        AOS.refresh();
    }, []);

    useEffect(() => {
        if (filteredSites.length > 0) {
            setTimeout(() => {
                AOS.refresh();
            }, 100);
        }
    }, [filteredSites]);

    const fetchSites = async () => {
        startLoading();
        try {
            const params = {
                page: pagination.page,
                limit: 12
            };

            console.log('Fetching sites with params:', params);
            const response = await siteAPI.getAll(params);
            console.log('Sites response:', response.data);

            // ВАЖНО: Проверяем структуру ответа
            const sites = response.data.sites || [];
            setSites(sites);
            setFilteredSites(sites);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages || 1,
                total: response.data.total || 0
            }));
        } catch (error) {
            console.error('Ошибка при загрузке сайтов:', error);
            setSites([]);
            setFilteredSites([]);
            toast.error('Не удалось загрузить сайты. Пожалуйста, попробуйте позже.');
        } finally {
            stopLoading();
        }
    };

    const fetchSitesByCategory = async (category) => {
        startLoading();
        try {
            const params = {
                page: pagination.page,
                limit: 12,
                category: category
            };

            const response = await siteAPI.getAll(params);
            setSites(response.data.sites);
            setFilteredSites(response.data.sites);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages,
                total: response.data.total
            }));
        } catch (error) {
            console.error('Ошибка при загрузке сайтов по категории:', error);
        } finally {
            stopLoading();
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await siteAPI.getAll({ limit: 1000 });
            const uniqueCategories = [...new Set(response.data.sites.map(site => site.category))];

            const categoriesOrder = [
                'Лендинг',
                'Корпоративный сайт',
                'Интернет-магазин',
                'Портфолио',
                'Веб-приложение'
            ];

            const sortedCategories = uniqueCategories.sort((a, b) => {
                return categoriesOrder.indexOf(a) - categoriesOrder.indexOf(b);
            });

            const categoriesList = ['Все', ...sortedCategories];
            setCategories(categoriesList);
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
            const categoriesList = [
                'Все',
                'Лендинг',
                'Корпоративный сайт',
                'Интернет-магазин',
                'Портфолио',
                'Веб-приложение'
            ];
            setCategories(categoriesList);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        if (key === 'search' || key === 'sort') {
            applyFilters(newFilters);
        } else if (key === 'category') {
            if (value === 'all') {
                fetchSites();
            } else {
                fetchSitesByCategory(value);
            }
        }
    };

    const applyFilters = (filterSettings) => {
        let filtered = [...sites];

        if (filterSettings.search) {
            filtered = filtered.filter(site =>
                site.title.toLowerCase().includes(filterSettings.search.toLowerCase()) ||
                site.description.toLowerCase().includes(filterSettings.search.toLowerCase())
            );
        }

        switch (filterSettings.sort) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setFilteredSites(filtered);
    };

    const resetFilters = () => {
        setFilters({
            category: 'all',
            search: '',
            sort: 'newest'
        });
        fetchSites();
    };

    // SEO: Формируем заголовок страницы
    const pageTitle = filters.category !== 'all'
        ? `Аренда ${filters.category.toLowerCase()} в Казахстане`
        : 'Каталог сайтов для аренды';

    const pageDescription = filters.category !== 'all'
        ? getCategoryDescription(filters.category)
        : `Каталог готовых сайтов для аренды. ${pagination.total} профессиональных решений для бизнеса. Лендинги, интернет-магазины, корпоративные сайты.`;


    return (
        <div className="catalog-page">
            {/* SEO компонент для каталога */}
            <SEO
                title={pageTitle}
                description={pageDescription}
                keywords={`аренда ${filters.category !== 'all' ? filters.category.toLowerCase() : 'сайтов'}, каталог сайтов, ${filters.category !== 'all' ? filters.category : 'готовые сайты'} аренда Казахстан`}
                canonical={`https://rentalsite.kz/catalog${categoryParam ? `?category=${categoryParam}` : ''}`}
                structuredData={structuredData}
            />

            <div className="catalog-hero">
                <Container className="container-custom">
                    <Row>
                        <Col>
                            <h1 className="catalog-page-title">Каталог сайтов</h1>
                            <p className="catalog-page-subtitle">
                                Доступных для мгновенной аренды
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Navbar expand="lg" className="catalog-navbar-filters">
                <Container className="container-custom">
                    <div className="catalog-navbar-filters__search--always-visible">
                        <Form.Control
                            type="text"
                            placeholder="Поиск сайтов..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="catalog-navbar-filters__search-input catalog-navbar-filters__search-input--always-visible"
                        />
                    </div>

                    <Navbar.Toggle aria-controls="catalog-filters-nav" className="catalog-navbar-filters__toggle" />

                    <Navbar.Collapse id="catalog-filters-nav">
                        <Nav className="catalog-navbar-filters__nav">
                            <div className="catalog-navbar-filters__search--hidden-mobile">
                                <Form.Control
                                    type="text"
                                    placeholder="Поиск сайтов..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="catalog-navbar-filters__search-input"
                                />
                            </div>

                            <div className="catalog-navbar-filters__category">
                                <Form.Select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="catalog-navbar-filters__select"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category === 'Все' ? 'all' : category}>
                                            {category}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>

                            <div className="catalog-navbar-filters__sort">
                                <Form.Select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    className="catalog-navbar-filters__select"
                                >
                                    <option value="newest">Сначала новые</option>
                                    <option value="price-low">Цена: по возрастанию</option>
                                    <option value="price-high">Цена: по убыванию</option>
                                    <option value="name">Название А-Я</option>
                                </Form.Select>
                            </div>

                            <div className="catalog-navbar-filters__reset">
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="catalog-navbar-filters__reset-btn"
                                >
                                    Сбросить фильтры
                                </Button>
                            </div>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="catalog-container container-custom">
                <Row>
                    <Col>
                        <div className="catalog-results-header">
                            <p className="catalog-results-count">
                                Показано {filteredSites.length} из {pagination.total} сайтов
                            </p>
                        </div>

                        {loading ? (
                            <div className="catalog-loading-grid">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="catalog-site-card-skeleton">
                                        <div className="catalog-skeleton-image"></div>
                                        <div className="catalog-skeleton-content">
                                            <div className="catalog-skeleton-title"></div>
                                            <div className="catalog-skeleton-text"></div>
                                            <div className="catalog-skeleton-text catalog-skeleton-text--short"></div>
                                            <div className="catalog-skeleton-button"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredSites.length > 0 ? (
                            <div className="catalog-grid-container">
                                {filteredSites.map((site, index) => (
                                    <div key={site._id} className="catalog-grid-item">
                                        <SiteCard site={site} index={index} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="catalog-no-results">
                                <div className="catalog-no-results-icon">🔍</div>
                                <h3 className="catalog-no-results-title">Сайты не найдены</h3>
                                <p className="catalog-no-results-description">
                                    Попробуйте изменить критерии поиска или просмотрите все категории
                                </p>
                                <Button onClick={resetFilters} className="catalog-no-results-btn">
                                    Показать все сайты
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Catalog;