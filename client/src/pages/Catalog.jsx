import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Container, Row, Col, Form, Button, Navbar, Nav } from 'react-bootstrap';
import { siteAPI } from '../services/api';
import { useLoading } from '../context/LoadingContext';
import SiteCard from '../components/SiteCard/SiteCard';
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


    // Функция для прокрутки наверх
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, [location.search]);

    useEffect(() => {
        fetchSites();
        fetchCategories();
        // eslint-disable-next-line
    }, [pagination.page]);

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
                limit: 12,
                ...(filters.category !== 'all' && { category: filters.category })
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
            console.error('Ошибка при загрузке сайтов:', error);
        } finally {
            stopLoading();
        }
    };

    const fetchCategories = async () => {
        try {
            const categoriesList = [
                'Все',
                'Лендинг',
                'Корпоративный сайт',
                'Интернет-магазин',
                'Портфолио',
                'Веб-приложение'
            ];
            setCategories(categoriesList);
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (filterSettings) => {
        let filtered = [...sites];

        if (filterSettings.search) {
            filtered = filtered.filter(site =>
                site.title.toLowerCase().includes(filterSettings.search.toLowerCase()) ||
                site.description.toLowerCase().includes(filterSettings.search.toLowerCase())
            );
        }

        if (filterSettings.category !== 'all') {
            filtered = filtered.filter(site => site.category === filterSettings.category);
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
        setFilteredSites(sites);
    };

    return (
        <div className="catalog-page">
            <div className="catalog-hero">
                <Container>
                    <Row>
                        <Col>
                            <h1 className="page-title">Каталог сайтов</h1>
                            <p className="page-subtitle">
                                Откройте для себя нашу коллекцию премиальных сайтов, доступных для мгновенной аренды
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Фильтры в навбаре */}
            <Navbar expand="lg" className="catalog-navbar-filters">
                <Container>
                    {/* Поле поиска всегда видимое */}
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
                            {/* Это поле поиска скрывается в мобильном меню */}
                            <div className="catalog-navbar-filters__search--hidden-mobile">
                                <Form.Control
                                    type="text"
                                    placeholder="Поиск сайтов..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="catalog-navbar-filters__search-input"
                                />
                            </div>

                            {/* Категории */}
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

                            {/* Сортировка */}
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

                            {/* Кнопка сброса */}
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

            {/* Основной контент */}
            <Container className="catalog-container">
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