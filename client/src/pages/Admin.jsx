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
        toast.success('Вы успешно вышли из системы');
        navigate('/admin/login');
    };

    return (
        <div className="admin-page">
            <Container fluid className="p-0">
                <Row className="g-0">
                    {/* Боковая панель */}
                    <Col lg={2} className="admin-sidebar">
                        <div className="sidebar-header">
                            <h3 className="text-gradient mb-3">RentalSite Админ</h3>
                            {user && (
                                <div className="user-info text-muted small">
                                    Добро пожаловать, {user.username}
                                </div>
                            )}
                        </div>
                        <Nav className="flex-column">
                            <Nav.Link
                                as={Link}
                                to="/admin"
                                className={`admin-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                            >
                                📊 Панель управления
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/admin/sites"
                                className={`admin-nav-link ${location.pathname === '/admin/sites' ? 'active' : ''}`}
                            >
                                🌐 Сайты
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/admin/contacts"
                                className={`admin-nav-link ${location.pathname === '/admin/contacts' ? 'active' : ''}`}
                            >
                                📧 Контакты
                            </Nav.Link>
                        </Nav>

                        {user && (
                            <div className="sidebar-footer mt-auto">
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline" className="user-dropdown btn-outline-custom w-100">
                                        👤 {user.username}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="admin-dropdown-menu">
                                        <Dropdown.Item as={Button} onClick={handleLogout} className="admin-dropdown-item">
                                            🚪 Выйти
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        )}
                    </Col>

                    {/* Основной контент */}
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
            {/* Публичный маршрут - страница входа */}
            <Route path="/login" element={<AdminLogin />} />

            {/* Защищенные маршруты - требуют аутентификации */}
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