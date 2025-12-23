import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { siteAPI, contactAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalSites: 0,
        activeSites: 0,
        featuredSites: 0,
        totalContacts: 0,
        newContacts: 0,
        recentContacts: 0
    });
    const [recentContacts, setRecentContacts] = useState([]);
    const [recentSites, setRecentSites] = useState([]);
    const { loading, startLoading, stopLoading } = useLoading();

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line
    }, []);

    const fetchDashboardData = async () => {
        startLoading();
        try {
            // Получаем данные сайтов
            const sitesResponse = await siteAPI.getAll({ limit: 100 });
            const sites = sitesResponse.data.sites || [];

            // Получаем данные контактов
            const contactsResponse = await contactAPI.getStats();
            const contactsData = contactsResponse.data.stats;

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
                totalContacts: contactsData.total,
                newContacts: contactsData.new,
                recentContacts: contactsData.recent
            });

            setRecentContacts(recentContactsResponse.data.contacts.slice(0, 5));
            setRecentSites(sites.slice(0, 5));
        } catch (error) {
            console.error('Ошибка при загрузке данных панели управления:', error);
        } finally {
            stopLoading();
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            new: 'danger',
            contacted: 'warning',
            completed: 'success',
            spam: 'secondary'
        };
        const statusText = {
            new: 'Новый',
            contacted: 'На связи',
            completed: 'Завершен',
            spam: 'Спам'
        };
        return <Badge bg={variants[status]}>{statusText[status]}</Badge>;
    };

    if (loading) {
        return <div className="admin-dashboard-loading">Загрузка панели управления...</div>;
    }

    return (
        <div className="admin-dashboard">
            <h1 className="admin-dashboard-title">Обзор панели управления</h1>

            {/* Статистические карточки */}
            <Row className="admin-dashboard-stats-row">
                <Col lg={3} md={6} className="mb-4">
                    <Card className="admin-dashboard-stats-card">
                        <Card.Body>
                            <div className="admin-dashboard-stats-icon sites">🌐</div>
                            <div className="admin-dashboard-stats-content">
                                <h3>{stats.totalSites}</h3>
                                <p>Всего сайтов</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                    <Card className="admin-dashboard-stats-card">
                        <Card.Body>
                            <div className="admin-dashboard-stats-icon active">✅</div>
                            <div className="admin-dashboard-stats-content">
                                <h3>{stats.activeSites}</h3>
                                <p>Активных сайтов</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                    <Card className="admin-dashboard-stats-card">
                        <Card.Body>
                            <div className="admin-dashboard-stats-icon featured">⭐</div>
                            <div className="admin-dashboard-stats-content">
                                <h3>{stats.featuredSites}</h3>
                                <p>Рекомендуемых сайтов</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                    <Card className="admin-dashboard-stats-card">
                        <Card.Body>
                            <div className="admin-dashboard-stats-icon contacts">📧</div>
                            <div className="admin-dashboard-stats-content">
                                <h3>{stats.totalContacts}</h3>
                                <p>Всего контактов</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Последние контакты */}
                <Col lg={6} className="mb-4">
                    <Card className="admin-dashboard-recent-card">
                        <Card.Header>
                            <h5>Последние запросы на контакт</h5>
                        </Card.Header>
                        <Card.Body>
                            {recentContacts.length > 0 ? (
                                <div className="table-responsive">
                                    <Table responsive>
                                        <thead>
                                        <tr>
                                            <th>Имя</th>
                                            <th>Статус</th>
                                            <th>Дата</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {recentContacts.map(contact => (
                                            <tr key={contact._id}>
                                                <td>
                                                    <div className="admin-dashboard-contact-name">{contact.name}</div>
                                                    <small className="admin-dashboard-text-muted">{contact.email}</small>
                                                </td>
                                                <td>{getStatusBadge(contact.status)}</td>
                                                <td>
                                                    {new Date(contact.createdAt).toLocaleDateString('ru-RU')}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="admin-dashboard-text-muted text-center">Нет последних контактов</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Недавно добавленные сайты */}
                <Col lg={6} className="mb-4">
                    <Card className="admin-dashboard-recent-card">
                        <Card.Header>
                            <h5>Недавно добавленные сайты</h5>
                        </Card.Header>
                        <Card.Body>
                            {recentSites.length > 0 ? (
                                <div className="table-responsive">
                                    <Table responsive>
                                        <thead>
                                        <tr>
                                            <th>Название</th>
                                            <th>Категория</th>
                                            <th>Цена</th>
                                            <th>Статус</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {recentSites.map(site => (
                                            <tr key={site._id}>
                                                <td>
                                                    <div className="admin-dashboard-site-title">{site.title}</div>
                                                    <small className="admin-dashboard-text-muted">
                                                        {site.shortDescription.substring(0, 10)}...
                                                    </small>
                                                </td>
                                                <td>{site.category}</td>
                                                <td>${site.price}/мес</td>
                                                <td>
                                                    <Badge bg={site.isActive ? 'success' : 'secondary'}>
                                                        {site.isActive ? 'Активен' : 'Неактивен'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="admin-dashboard-text-muted text-center">Сайты еще не добавлены</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;