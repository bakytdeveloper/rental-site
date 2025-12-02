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
    }, []);

    const fetchDashboardData = async () => {
        startLoading();
        try {
            // Fetch sites data
            const sitesResponse = await siteAPI.getAll({ limit: 100 });
            const sites = sitesResponse.data.sites || [];

            // Fetch contacts data
            const contactsResponse = await contactAPI.getStats();
            const contactsData = contactsResponse.data.stats;

            // Fetch recent contacts
            const recentContactsResponse = await contactAPI.getAll({
                limit: 5,
                page: 1
            });

            // Calculate stats
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
            console.error('Error fetching dashboard data:', error);
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
        return <Badge bg={variants[status]}>{status}</Badge>;
    };

    if (loading) {
        return <div className="admin-dashboard-loading">Loading dashboard...</div>;
    }

    return (
        <div className="admin-dashboard">
            <h1 className="admin-dashboard-title">Dashboard Overview</h1>

            {/* Stats Cards */}
            <Row className="admin-dashboard-stats-row">
                <Col lg={3} md={6} className="mb-4">
                    <Card className="admin-dashboard-stats-card">
                        <Card.Body>
                            <div className="admin-dashboard-stats-icon sites">🌐</div>
                            <div className="admin-dashboard-stats-content">
                                <h3>{stats.totalSites}</h3>
                                <p>Total Websites</p>
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
                                <p>Active Websites</p>
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
                                <p>Featured Websites</p>
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
                                <p>Total Contacts</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Recent Contacts */}
                {/* Recent Contacts */}
                <Col lg={6} className="mb-4">
                    <Card className="admin-dashboard-recent-card">
                        <Card.Header>
                            <h5>Recent Contact Requests</h5>
                        </Card.Header>
                        <Card.Body>
                            {recentContacts.length > 0 ? (
                                <div className="table-responsive">
                                    <Table responsive>
                                        <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Date</th>
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
                                                    {new Date(contact.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="admin-dashboard-text-muted text-center">No recent contacts</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Recent Sites */}
                <Col lg={6} className="mb-4">
                    <Card className="admin-dashboard-recent-card">
                        <Card.Header>
                            <h5>Recently Added Websites</h5>
                        </Card.Header>
                        <Card.Body>
                            {recentSites.length > 0 ? (
                                <div className="table-responsive">
                                    <Table responsive>
                                        <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {recentSites.map(site => (
                                            <tr key={site._id}>
                                                <td>
                                                    <div className="admin-dashboard-site-title">{site.title}</div>
                                                    <small className="admin-dashboard-text-muted">
                                                        {site.shortDescription.substring(0, 50)}...
                                                    </small>
                                                </td>
                                                <td>{site.category}</td>
                                                <td>${site.price}/mo</td>
                                                <td>
                                                    <Badge bg={site.isActive ? 'success' : 'secondary'}>
                                                        {site.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="admin-dashboard-text-muted text-center">No websites added yet</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;