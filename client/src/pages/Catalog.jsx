import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
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

    useEffect(() => {
        fetchSites();
        fetchCategories();
    }, [pagination.page]);

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
            console.error('Error fetching sites:', error);
        } finally {
            stopLoading();
        }
    };

    const fetchCategories = async () => {
        try {
            // This would typically come from an API endpoint
            const categoriesList = [
                'All',
                'Landing Page',
                'Corporate Website',
                'E-commerce',
                'Portfolio',
                'Web Application'
            ];
            setCategories(categoriesList);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (filterSettings) => {
        let filtered = [...sites];

        // Search filter
        if (filterSettings.search) {
            filtered = filtered.filter(site =>
                site.title.toLowerCase().includes(filterSettings.search.toLowerCase()) ||
                site.description.toLowerCase().includes(filterSettings.search.toLowerCase())
            );
        }

        // Category filter
        if (filterSettings.category !== 'all') {
            filtered = filtered.filter(site => site.category === filterSettings.category);
        }

        // Sort
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
            default: // newest
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
                            <h1 className="page-title">Website Catalog</h1>
                            <p className="page-subtitle">
                                Discover our collection of premium websites available for instant rental
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="catalog-container">
                <Row>
                    {/* Filters Sidebar */}
                    <Col lg={3} className="filters-sidebar">
                        <div className="filters-card">
                            <h3 className="filters-title">Filters</h3>

                            {/* Search */}
                            <Form.Group className="mb-3">
                                <Form.Label>Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search websites..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </Form.Group>

                            {/* Category */}
                            <Form.Group className="mb-3">
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category === 'All' ? 'all' : category}>
                                            {category}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {/* Sort */}
                            <Form.Group className="mb-4">
                                <Form.Label>Sort By</Form.Label>
                                <Form.Select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name A-Z</option>
                                </Form.Select>
                            </Form.Group>

                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="btn-reset"
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </Col>

                    {/* Sites Grid */}
                    <Col lg={9}>
                        <div className="results-header">
                            <p className="results-count">
                                Showing {filteredSites.length} of {pagination.total} websites
                            </p>
                        </div>

                        {loading ? (
                            <div className="loading-grid">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="site-card-skeleton">
                                        <div className="skeleton-image"></div>
                                        <div className="skeleton-content">
                                            <div className="skeleton-title"></div>
                                            <div className="skeleton-text"></div>
                                            <div className="skeleton-text short"></div>
                                            <div className="skeleton-button"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredSites.length > 0 ? (
                            <Row>
                                {filteredSites.map((site, index) => (
                                    <Col lg={6} xl={4} key={site._id} className="mb-4">
                                        <SiteCard site={site} index={index} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div className="no-results">
                                <div className="no-results-icon">🔍</div>
                                <h3>No websites found</h3>
                                <p>Try adjusting your search criteria or browse all categories</p>
                                <Button onClick={resetFilters} className="btn-primary-custom">
                                    Show All Websites
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