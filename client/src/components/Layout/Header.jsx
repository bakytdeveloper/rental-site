import { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { checkClientAuth, checkAdminAuth, logout } from '../../services/api.js';
import './Header.css';

const Header = () => {
    const [expanded, setExpanded] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [clientName, setClientName] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check auth status on mount and location change
        setIsClientLoggedIn(checkClientAuth());
        setIsAdminLoggedIn(checkAdminAuth());

        // Get client name if logged in
        const clientData = localStorage.getItem('clientData');
        if (clientData) {
            const userData = JSON.parse(clientData);
            setClientName(userData.profile?.firstName || userData.username || 'Клиент');
        }

        // Handle scroll
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]);

    const closeNavbar = () => setExpanded(false);

    // Универсальная функция входа
    const handleLogin = () => {
        closeNavbar();
        navigate('/auth/login');
    };

    const handleClientRegister = () => {
        closeNavbar();
        navigate('/client/register');
    };

    const handleClientDashboard = () => {
        closeNavbar();
        navigate('/client/dashboard');
    };

    const handleClientLogout = () => {
        logout('client');
    };

    const handleAdminDashboard = () => {
        closeNavbar();
        navigate('/admin');
    };

    const handleAdminLogout = () => {
        logout('admin');
    };

    const getNavLinkClass = (path) => {
        return `header-nav-link ${location.pathname === path ? 'header-active' : ''}`;
    };

    return (
        <Navbar
            expand="lg"
            fixed="top"
            expanded={expanded}
            className={`header-custom-navbar ${scrolled ? 'header-scrolled' : ''}`}
        >
            <Container className="header-container">
                <Navbar.Brand as={Link} to="/" className="header-brand-logo" onClick={closeNavbar}>
                    <span className="header-brand-accent">Rental</span>Site
                </Navbar.Brand>

                {/* Мобильная авторизация (видна только на маленьких экранах) */}
                <div className="d-lg-none ms-auto me-2">
                    {isClientLoggedIn ? (
                        <Badge bg="info" className="header-mobile-badge">
                            👤 {clientName}
                        </Badge>
                    ) : isAdminLoggedIn ? (
                        <Badge bg="warning" className="header-mobile-badge">
                            🛠 Админ
                        </Badge>
                    ) : null}
                </div>

                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    onClick={() => setExpanded(!expanded)}
                    className="header-navbar-toggler"
                />

                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Основная навигация - слева */}
                    <Nav className="me-auto">
                        <Nav.Link
                            as={Link}
                            to="/"
                            className={getNavLinkClass('/')}
                            onClick={closeNavbar}
                        >
                            Главная
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/catalog"
                            className={getNavLinkClass('/catalog')}
                            onClick={closeNavbar}
                        >
                            Каталог
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/about"
                            className={getNavLinkClass('/about')}
                            onClick={closeNavbar}
                        >
                            О нас
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/contact"
                            className={getNavLinkClass('/contact')}
                            onClick={closeNavbar}
                        >
                            Контакты
                        </Nav.Link>
                    </Nav>

                    {/* Блок авторизации - справа (виден только на больших экранах) */}
                    <Nav className="d-none d-lg-flex align-items-center">
                        {isClientLoggedIn ? (
                            <Dropdown className="header-dropdown">
                                <Dropdown.Toggle variant="outline-light" className="header-user-toggle">
                                    <span className="header-user-name">👤 {clientName}</span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="header-dropdown-menu" align="end">
                                    <Dropdown.Item onClick={handleClientDashboard} className="header-dropdown-item">
                                        📊 Личный кабинет
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={handleClientLogout} className="header-dropdown-item">
                                        🚪 Выйти
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : isAdminLoggedIn ? (
                            <Dropdown className="header-dropdown">
                                <Dropdown.Toggle variant="outline-light" className="header-user-toggle">
                                    <span className="header-user-name">🛠 Админ</span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="header-dropdown-menu" align="end">
                                    <Dropdown.Item onClick={handleAdminDashboard} className="header-dropdown-item">
                                        📊 Панель управления
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={handleAdminLogout} className="header-dropdown-item">
                                        🚪 Выйти
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <div className="header-auth-buttons d-flex align-items-center">
                                <Button
                                    variant="outline-light"
                                    onClick={handleLogin}
                                    className="header-auth-btn me-2"
                                >
                                    Вход
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleClientRegister}
                                    className="header-register-btn"
                                >
                                    Регистрация
                                </Button>
                            </div>
                        )}
                    </Nav>

                    {/* Мобильная версия авторизации (внутри collapse) */}
                    <div className="d-lg-none mt-3 pt-3 border-top">
                        {isClientLoggedIn ? (
                            <div className="d-flex flex-column">
                                <div className="mb-3">
                                    <span className="text-light fw-bold">👤 {clientName}</span>
                                </div>
                                <Button
                                    variant="outline-light"
                                    onClick={handleClientDashboard}
                                    className="mb-2"
                                >
                                    📊 Личный кабинет
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    onClick={handleClientLogout}
                                >
                                    🚪 Выйти
                                </Button>
                            </div>
                        ) : isAdminLoggedIn ? (
                            <div className="d-flex flex-column">
                                <div className="mb-3">
                                    <span className="text-light fw-bold">🛠 Админ</span>
                                </div>
                                <Button
                                    variant="outline-light"
                                    onClick={handleAdminDashboard}
                                    className="mb-2"
                                >
                                    📊 Панель управления
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    onClick={handleAdminLogout}
                                >
                                    🚪 Выйти
                                </Button>
                            </div>
                        ) : (
                            <div className="d-flex flex-column">
                                <Button
                                    variant="outline-light"
                                    onClick={handleLogin}
                                    className="mb-2"
                                >
                                    Вход
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleClientRegister}
                                >
                                    Регистрация
                                </Button>
                            </div>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;