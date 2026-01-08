import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { siteAPI, contactAPI, rentalAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import './AdminDashboard.css';
import {useLocation} from "react-router-dom";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalSites: 0,
        activeSites: 0,
        featuredSites: 0,
        totalContacts: 0,
        newContacts: 0,
        recentContacts: 0,
        rentalStats: {
            total: 0,
            pending: 0,
            active: 0,
            paymentDue: 0,
            expiringSoon: 0,
            totalRevenue: 0
        }
    });
    const [recentContacts, setRecentContacts] = useState([]);
    const [recentSites, setRecentSites] = useState([]);
    const { loading, startLoading, stopLoading } = useLoading();

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line
    }, []);

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

    const fetchDashboardData = async () => {
        startLoading();
        try {
            // Получаем данные сайтов
            const sitesResponse = await siteAPI.getAll({ limit: 100 });
            const sites = sitesResponse.data.sites || [];

            // Получаем данные контактов
            const contactsResponse = await contactAPI.getStats();
            const contactsData = contactsResponse.data.stats;

            // Получаем статистику аренд
            const rentalsResponse = await rentalAPI.getStats();
            const rentalStats = rentalsResponse.data.stats || {
                total: 0,
                pending: 0,
                active: 0,
                paymentDue: 0,
                expiringSoon: 0,
                totalRevenue: 0
            };

            // Получаем последние контакты
            const recentContactsResponse = await contactAPI.getAll({
                limit: 5,
                page: 1
            });

            // Вычисляем статистику
            const totalSites = sites.length;
            const activeSites = sites.filter(site => site.isActive).length;
            const featuredSites = sites.filter(site => site.isFeatured).length;

            setStats({
                totalSites,
                activeSites,
                featuredSites,
                totalContacts: contactsData.total || 0,
                newContacts: contactsData.new || 0,
                recentContacts: contactsData.recent || 0,
                rentalStats: rentalStats
            });

            setRecentContacts(recentContactsResponse.data.contacts?.slice(0, 5) || []);
            setRecentSites(sites.slice(0, 5));
        } catch (error) {
            console.error('Ошибка при загрузке данных панели управления:', error);
            // Устанавливаем значения по умолчанию в случае ошибки
            setStats(prev => ({
                ...prev,
                rentalStats: {
                    total: 0,
                    pending: 0,
                    active: 0,
                    paymentDue: 0,
                    expiringSoon: 0,
                    totalRevenue: 0
                }
            }));
        } finally {
            stopLoading();
        }
    };

    // Форматирование валюты
    const formatCurrency = (amount) => {
        if (!amount) return '₸0';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'KZT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('KZT', '₸');
    };

    if (loading) {
        return (
            <div className="admin-dashboard-loading text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="text-muted mt-3">Загрузка панели управления...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard container-custom py-4">
            <h1 className="admin-dashboard-title section-title mb-4">Обзор панели управления</h1>

            {/* Статистические карточки */}
            <Row className="admin-dashboard-stats-row g-4 mb-5">
                <Col lg={3} md={6}>
                    <Card className="admin-dashboard-stats-card card-custom">
                        <Card.Body className="p-4">
                            <div className="admin-dashboard-stats-icon sites d-flex align-items-center justify-content-center mb-3">
                                <span className="display-5">🌐</span>
                            </div>
                            <div className="admin-dashboard-stats-content text-center">
                                <h3 className="text-muted mb-2">{stats.totalSites}</h3>
                                <p className="text-muted mb-0">Всего сайтов</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="admin-dashboard-stats-card card-custom">
                        <Card.Body className="p-4">
                            <div className="admin-dashboard-stats-icon active d-flex align-items-center justify-content-center mb-3">
                                <span className="display-5">✅</span>
                            </div>
                            <div className="admin-dashboard-stats-content text-center">
                                <h3 className="text-muted mb-2">{stats.activeSites}</h3>
                                <p className="text-muted mb-0">Активных сайтов</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="admin-dashboard-stats-card card-custom">
                        <Card.Body className="p-4">
                            <div className="admin-dashboard-stats-icon featured d-flex align-items-center justify-content-center mb-3">
                                <span className="display-5">⭐</span>
                            </div>
                            <div className="admin-dashboard-stats-content text-center">
                                <h3 className="text-muted mb-2">{stats.featuredSites}</h3>
                                <p className="text-muted mb-0">Рекомендуемых сайтов</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="admin-dashboard-stats-card card-custom">
                        <Card.Body className="p-4">
                            <div className="admin-dashboard-stats-icon contacts d-flex align-items-center justify-content-center mb-3">
                                <span className="display-5">📧</span>
                            </div>
                            <div className="admin-dashboard-stats-content text-center">
                                <h3 className="text-muted mb-2">{stats.totalContacts}</h3>
                                <p className="text-muted mb-0">Всего контактов</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Карточка аренд */}
                <Col lg={3} md={6}>
                    <Card className="admin-dashboard-stats-card card-custom">
                        <Card.Body className="p-4">
                            <div className="admin-dashboard-stats-icon rentals d-flex align-items-center justify-content-center mb-3">
                                <span className="display-5">🏠</span>
                            </div>
                            <div className="admin-dashboard-stats-content text-center">
                                <h3 className="text-muted mb-2">{stats.rentalStats?.total || 0}</h3>
                                <p className="text-muted mb-0">Всего аренд</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Активные аренды */}
                <Col lg={3} md={6}>
                    <Card className="admin-dashboard-stats-card card-custom">
                        <Card.Body className="p-4">
                            <div className="admin-dashboard-stats-icon active-rentals d-flex align-items-center justify-content-center mb-3">
                                <span className="display-5">📈</span>
                            </div>
                            <div className="admin-dashboard-stats-content text-center">
                                <h3 className="text-muted mb-2">{stats.rentalStats?.active || 0}</h3>
                                <p className="text-muted mb-0">Активных аренд</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Ожидающие аренды */}
                <Col lg={3} md={6}>
                    <Card className="admin-dashboard-stats-card card-custom">
                        <Card.Body className="p-4">
                            <div className="admin-dashboard-stats-icon pending-rentals d-flex align-items-center justify-content-center mb-3">
                                <span className="display-5">⏳</span>
                            </div>
                            <div className="admin-dashboard-stats-content text-center">
                                <h3 className="text-muted mb-2">{stats.rentalStats?.pending || 0}</h3>
                                <p className="text-muted mb-0">В ожидании</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Выручка */}
                <Col lg={3} md={6}>
                    <Card className="admin-dashboard-stats-card card-custom">
                        <Card.Body className="p-4">
                            <div className="admin-dashboard-stats-icon revenue d-flex align-items-center justify-content-center mb-3">
                                <span className="display-5">💰</span>
                            </div>
                            <div className="admin-dashboard-stats-content text-center">
                                <h3 className="text-muted mb-2">{formatCurrency(stats.rentalStats?.totalRevenue || 0)}</h3>
                                <p className="text-muted mb-0">Общая выручка</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Последние контакты */}
                <Col lg={6}>
                    <Card className="admin-dashboard-recent-card card-custom h-100">
                        <Card.Header className="border-bottom p-4">
                            <h5 className="admin-dashboard-card-title text-gradient mb-0">Последние запросы на контакт</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {recentContacts.length > 0 ? (
                                <div className="table-responsive">
                                    <Table responsive className="admin-dashboard-table mb-0">
                                        <thead>
                                        <tr>
                                            <th className="admin-dashboard-table-header text-light">Имя</th>
                                            <th className="admin-dashboard-table-header text-light">Статус</th>
                                            <th className="admin-dashboard-table-header text-light">Дата</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {recentContacts.map(contact => (
                                            <tr key={contact._id} className="admin-dashboard-table-row">
                                                <td className="admin-dashboard-table-cell">
                                                    <div className="admin-dashboard-contact-name">{contact.name}</div>
                                                    <small className="admin-dashboard-text-muted">{contact.email}</small>
                                                </td>
                                                <td className="admin-dashboard-table-cell">
                                                    <Badge bg={contact.status ? 'success' : 'secondary'} className="admin-dashboard-site-badge">
                                                        {contact.status ? 'Активен' : 'Неактивен'}
                                                    </Badge>
                                                </td>
                                                <td className="admin-dashboard-table-cell">
                                                    {new Date(contact.createdAt).toLocaleDateString('ru-RU')}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="admin-dashboard-text-muted text-center mb-0">Нет последних контактов</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Недавно добавленные сайты */}
                <Col lg={6}>
                    <Card className="admin-dashboard-recent-card card-custom h-100">
                        <Card.Header className="border-bottom p-4">
                            <h5 className="admin-dashboard-card-title text-gradient mb-0">Недавно добавленные сайты</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {recentSites.length > 0 ? (
                                <div className="table-responsive">
                                    <Table responsive className="admin-dashboard-table mb-0">
                                        <thead>
                                        <tr className="header-text-light" >
                                            <th className="admin-dashboard-table-header text-light">Название</th>
                                            <th className="admin-dashboard-table-header text-light">Категория</th>
                                            <th className="admin-dashboard-table-header text-light">Цена</th>
                                            <th className="admin-dashboard-table-header text-light">Статус</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {recentSites.map(site => (
                                            <tr key={site._id} className="admin-dashboard-table-row">
                                                <td className="admin-dashboard-table-cell">
                                                    <div className="admin-dashboard-site-title">{site.title}</div>
                                                    <small className="admin-dashboard-text-muted">
                                                        {site.shortDescription.substring(0, 50)}...
                                                    </small>
                                                </td>
                                                <td className="admin-dashboard-table-cell">{site.category}</td>
                                                <td className="admin-dashboard-table-cell text-primary">₸{site.price}/мес</td>
                                                <td className="admin-dashboard-table-cell">
                                                    <Badge bg={site.isActive ? 'success' : 'secondary'} className="admin-dashboard-site-badge">
                                                        {site.isActive ? 'Активен' : 'Неактивен'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="admin-dashboard-text-muted text-center mb-0">Сайты еще не добавлены</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Дополнительная статистика по арендам */}
            <Row className="mt-4">
                <Col lg={12}>
                    <Card className="admin-dashboard-recent-card card-custom">
                        <Card.Header className="border-bottom p-4">
                            <h5 className="admin-dashboard-card-title text-gradient mb-0">Статистика по арендам</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Row className="g-3">
                                <Col lg={2} md={4} sm={6}>
                                    <div className="text-center">
                                        <div className="admin-dashboard-stat-number text-primary">{stats.rentalStats?.total || 0}</div>
                                        <div className="admin-dashboard-stat-label text-muted">Всего аренд</div>
                                    </div>
                                </Col>
                                <Col lg={2} md={4} sm={6}>
                                    <div className="text-center">
                                        <div className="admin-dashboard-stat-number text-success">{stats.rentalStats?.active || 0}</div>
                                        <div className="admin-dashboard-stat-label text-muted">Активных</div>
                                    </div>
                                </Col>
                                <Col lg={2} md={4} sm={6}>
                                    <div className="text-center">
                                        <div className="admin-dashboard-stat-number text-warning">{stats.rentalStats?.pending || 0}</div>
                                        <div className="admin-dashboard-stat-label text-muted">В ожидании</div>
                                    </div>
                                </Col>
                                <Col lg={2} md={4} sm={6}>
                                    <div className="text-center">
                                        <div className="admin-dashboard-stat-number text-danger">{stats.rentalStats?.paymentDue || 0}</div>
                                        <div className="admin-dashboard-stat-label text-muted">Просроченных</div>
                                    </div>
                                </Col>
                                <Col lg={2} md={4} sm={6}>
                                    <div className="text-center">
                                        <div className="admin-dashboard-stat-number text-info">{stats.rentalStats?.expiringSoon || 0}</div>
                                        <div className="admin-dashboard-stat-label text-muted">Истекает скоро</div>
                                    </div>
                                </Col>
                                <Col lg={2} md={4} sm={6}>
                                    <div className="text-center">
                                        <div className="admin-dashboard-stat-number text-success">{formatCurrency(stats.rentalStats?.totalRevenue || 0)}</div>
                                        <div className="admin-dashboard-stat-label text-muted">Общая выручка</div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;