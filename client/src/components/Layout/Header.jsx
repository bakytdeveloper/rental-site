import { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [expanded, setExpanded] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Слушаем событие скролла
    useState(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const closeNavbar = () => setExpanded(false);

    const handleAdminLogin = () => {
        closeNavbar();
        navigate('/admin/login');
    };

    return (
        <Navbar
            expand="lg"
            fixed="top"
            expanded={expanded}
            className={`header-custom-navbar ${scrolled ? 'header-scrolled' : ''}`}
        >
            <Container>
                <Navbar.Brand as={Link} to="/" className="header-brand-logo">
                    <span className="header-brand-accent">Rental</span>Site
                </Navbar.Brand>

                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    onClick={() => setExpanded(expanded ? false : "expanded")}
                    className="header-navbar-toggler"
                />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto header-navbar-nav">
                        <Nav.Link
                            as={Link}
                            to="/"
                            active={location.pathname === '/'}
                            onClick={closeNavbar}
                            className={`header-nav-link ${location.pathname === '/' ? 'header-active' : ''}`}
                        >
                            Главная
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/catalog"
                            active={location.pathname === '/catalog'}
                            onClick={closeNavbar}
                            className={`header-nav-link ${location.pathname === '/catalog' ? 'header-active' : ''}`}
                        >
                            Каталог
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/about"
                            active={location.pathname === '/about'}
                            onClick={closeNavbar}
                            className={`header-nav-link ${location.pathname === '/about' ? 'header-active' : ''}`}
                        >
                            О нас
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/contact"
                            active={location.pathname === '/contact'}
                            onClick={closeNavbar}
                            className={`header-nav-link ${location.pathname === '/contact' ? 'header-active' : ''}`}
                        >
                            Контакты
                        </Nav.Link>

                        {/* Кнопка входа в админ-панель */}
                        <div className="header-admin-login-btn">
                            <Button
                                variant="outline-light"
                                size="sm"
                                onClick={handleAdminLogin}
                                className="ms-2 header-btn"
                            >
                                Вход
                            </Button>
                        </div>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;