import { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [expanded, setExpanded] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const closeNavbar = () => setExpanded(false);

    const handleAdminLogin = () => {
        closeNavbar();
        navigate('/admin/login');
    };

    return (
        <Navbar expand="lg" fixed="top" expanded={expanded} className="custom-navbar">
            <Container>
                <Navbar.Brand as={Link} to="/" className="brand-logo">
                    <span className="brand-accent">Rental</span>Site
                </Navbar.Brand>

                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    onClick={() => setExpanded(expanded ? false : "expanded")}
                />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link
                            as={Link}
                            to="/"
                            active={location.pathname === '/'}
                            onClick={closeNavbar}
                        >
                            Home
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/catalog"
                            active={location.pathname === '/catalog'}
                            onClick={closeNavbar}
                        >
                            Catalog
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/about"
                            active={location.pathname === '/about'}
                            onClick={closeNavbar}
                        >
                            About
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/contact"
                            active={location.pathname === '/contact'}
                            onClick={closeNavbar}
                        >
                            Contact
                        </Nav.Link>

                        {/* Кнопка входа в админ-панель */}
                        <div className="admin-login-btn">
                            <Button
                                variant="outline-light"
                                size="sm"
                                onClick={handleAdminLogin}
                                className="ms-2"
                            >
                                Admin Login
                            </Button>
                        </div>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;