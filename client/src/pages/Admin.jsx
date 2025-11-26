import { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Button, Dropdown } from 'react-bootstrap';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from '../components/Admin/ProtectedRoute';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AdminSites from '../components/Admin/AdminSites';
import AdminContacts from '../components/Admin/AdminContacts';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminLayout = ({ children }) => {
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('adminUser');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setUser(null);
        toast.success('Logged out successfully');
        navigate('/admin/login');
    };

    return (
        <div className="admin-page">
            <Container fluid>
                <Row>
                    {/* Sidebar */}
                    <Col lg={2} className="admin-sidebar">
                        <div className="sidebar-header">
                            <h3>RentalSite Admin</h3>
                            {user && (
                                <div className="user-info">
                                    <small>Welcome, {user.username}</small>
                                </div>
                            )}
                        </div>
                        <Nav className="flex-column">
                            <Nav.Link
                                as={Link}
                                to="/admin"
                                className={location.pathname === '/admin' ? 'active' : ''}
                            >
                                📊 Dashboard
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/admin/sites"
                                className={location.pathname === '/admin/sites' ? 'active' : ''}
                            >
                                🌐 Websites
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/admin/contacts"
                                className={location.pathname === '/admin/contacts' ? 'active' : ''}
                            >
                                📧 Contacts
                            </Nav.Link>
                        </Nav>

                        {user && (
                            <div className="sidebar-footer">
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline" className="user-dropdown">
                                        👤 {user.username}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item as={Button} onClick={handleLogout}>
                                            🚪 Logout
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        )}
                    </Col>

                    {/* Main Content */}
                    <Col lg={10} className="admin-main">
                        {children}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

const Admin = () => {
    return (
        <Routes>
            {/* Public route - login page */}
            <Route path="/login" element={<AdminLogin />} />

            {/* Protected routes - require authentication */}
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <AdminLayout>
                            <Routes>
                                <Route path="/" element={<AdminDashboard />} />
                                <Route path="/sites" element={<AdminSites />} />
                                <Route path="/contacts" element={<AdminContacts />} />
                            </Routes>
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default Admin;