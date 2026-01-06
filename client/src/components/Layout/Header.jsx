// import { useState, useEffect } from 'react';
// import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { checkClientAuth, checkAdminAuth } from '../../services/api.js';
// import './Header.css';
//
// const Header = () => {
//     const [expanded, setExpanded] = useState(false);
//     const [scrolled, setScrolled] = useState(false);
//     const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
//     const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
//     const [clientName, setClientName] = useState('');
//     const location = useLocation();
//     const navigate = useNavigate();
//
//     useEffect(() => {
//         // Check auth status on mount and location change
//         setIsClientLoggedIn(checkClientAuth());
//         setIsAdminLoggedIn(checkAdminAuth());
//
//         // Get client name if logged in
//         const clientData = localStorage.getItem('clientData');
//         if (clientData) {
//             const { profile } = JSON.parse(clientData);
//             setClientName(profile?.firstName || 'Клиент');
//         }
//
//         // Handle scroll
//         const handleScroll = () => {
//             setScrolled(window.scrollY > 20);
//         };
//
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, [location]);
//
//     const closeNavbar = () => setExpanded(false);
//
//     const handleClientLogin = () => {
//         closeNavbar();
//         navigate('/client/login');
//     };
//
//     const handleClientRegister = () => {
//         closeNavbar();
//         navigate('/client/register');
//     };
//
//     const handleClientDashboard = () => {
//         closeNavbar();
//         navigate('/client/dashboard');
//     };
//
//     const handleClientLogout = () => {
//         localStorage.removeItem('clientToken');
//         localStorage.removeItem('clientData');
//         setIsClientLoggedIn(false);
//         setClientName('');
//         navigate('/');
//         window.location.reload(); // Refresh to update UI
//     };
//
//     const handleAdminLogin = () => {
//         closeNavbar();
//         navigate('/admin/login');
//     };
//
//     const handleAdminDashboard = () => {
//         closeNavbar();
//         navigate('/admin');
//     };
//
//     const handleAdminLogout = () => {
//         localStorage.removeItem('adminToken');
//         localStorage.removeItem('adminUser');
//         setIsAdminLoggedIn(false);
//         navigate('/');
//     };
//
//     const getNavLinkClass = (path) => {
//         return `header-nav-link ${location.pathname === path ? 'header-active' : ''}`;
//     };
//
//     return (
//         <Navbar
//             expand="lg"
//             fixed="top"
//             expanded={expanded}
//             className={`header-custom-navbar ${scrolled ? 'header-scrolled' : ''}`}
//         >
//             <Container className="header-container">
//                 <Navbar.Brand as={Link} to="/" className="header-brand-logo" onClick={closeNavbar}>
//                     <span className="header-brand-accent">Rental</span>Site
//                 </Navbar.Brand>
//
//                 <Navbar.Toggle
//                     aria-controls="basic-navbar-nav"
//                     onClick={() => setExpanded(!expanded)}
//                     className="header-navbar-toggler"
//                 />
//
//                 <Navbar.Collapse id="basic-navbar-nav">
//                     <Nav className="header-navbar-nav">
//                         <Nav.Link
//                             as={Link}
//                             to="/"
//                             className={getNavLinkClass('/')}
//                             onClick={closeNavbar}
//                         >
//                             Главная
//                         </Nav.Link>
//                         <Nav.Link
//                             as={Link}
//                             to="/catalog"
//                             className={getNavLinkClass('/catalog')}
//                             onClick={closeNavbar}
//                         >
//                             Каталог
//                         </Nav.Link>
//                         <Nav.Link
//                             as={Link}
//                             to="/about"
//                             className={getNavLinkClass('/about')}
//                             onClick={closeNavbar}
//                         >
//                             О нас
//                         </Nav.Link>
//                         <Nav.Link
//                             as={Link}
//                             to="/contact"
//                             className={getNavLinkClass('/contact')}
//                             onClick={closeNavbar}
//                         >
//                             Контакты
//                         </Nav.Link>
//
//                         {/* Client Authentication Section */}
//                         <div className="header-auth-section">
//                             {isClientLoggedIn ? (
//                                 <Dropdown className="header-dropdown">
//                                     <Dropdown.Toggle variant="outline-light" className="header-user-toggle">
//                                         <span className="header-user-name">👤 {clientName}</span>
//                                     </Dropdown.Toggle>
//                                     <Dropdown.Menu className="header-dropdown-menu">
//                                         <Dropdown.Item onClick={handleClientDashboard} className="header-dropdown-item">
//                                             📊 Личный кабинет
//                                         </Dropdown.Item>
//                                         <Dropdown.Item onClick={handleClientLogout} className="header-dropdown-item">
//                                             🚪 Выйти
//                                         </Dropdown.Item>
//                                     </Dropdown.Menu>
//                                 </Dropdown>
//                             ) : (
//                                 <div className="header-client-auth">
//                                     <Button
//                                         variant="outline-light"
//                                         size="sm"
//                                         onClick={handleClientLogin}
//                                         className="header-auth-btn me-2"
//                                     >
//                                         Вход
//                                     </Button>
//                                     <Button
//                                         variant="primary"
//                                         size="sm"
//                                         onClick={handleClientRegister}
//                                         className="header-register-btn"
//                                     >
//                                         Регистрация
//                                     </Button>
//                                 </div>
//                             )}
//
//                             {/* Admin Access (only show if admin is not logged in) */}
//                             {!isAdminLoggedIn && (
//                                 <div className="header-admin-access ms-3">
//                                     <Button
//                                         variant="outline-light"
//                                         size="sm"
//                                         onClick={handleAdminLogin}
//                                         className="header-admin-btn"
//                                     >
//                                         Админ
//                                     </Button>
//                                 </div>
//                             )}
//                         </div>
//                     </Nav>
//                 </Navbar.Collapse>
//
//                 {/* Mobile auth section */}
//                 <div className="header-mobile-auth d-lg-none">
//                     {isClientLoggedIn ? (
//                         <Badge bg="info" className="header-mobile-badge">
//                             👤 {clientName}
//                         </Badge>
//                     ) : (
//                         <Button
//                             variant="outline-light"
//                             size="sm"
//                             onClick={handleClientLogin}
//                             className="header-mobile-login"
//                         >
//                             Вход
//                         </Button>
//                     )}
//                 </div>
//             </Container>
//         </Navbar>
//     );
// };
//
// export default Header;






import { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { checkClientAuth, checkAdminAuth } from '../../services/api.js';
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
            const { profile } = JSON.parse(clientData);
            setClientName(profile?.firstName || 'Клиент');
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
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientData');
        setIsClientLoggedIn(false);
        setClientName('');
        navigate('/');
        window.location.reload(); // Refresh to update UI
    };

    const handleAdminDashboard = () => {
        closeNavbar();
        navigate('/admin');
    };

    const handleAdminLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAdminLoggedIn(false);
        navigate('/');
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

                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    onClick={() => setExpanded(!expanded)}
                    className="header-navbar-toggler"
                />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="header-navbar-nav">
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

                        {/* Authentication Section */}
                        <div className="header-auth-section">
                            {isClientLoggedIn ? (
                                <Dropdown className="header-dropdown">
                                    <Dropdown.Toggle variant="outline-light" className="header-user-toggle">
                                        <span className="header-user-name">👤 {clientName}</span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="header-dropdown-menu">
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
                                    <Dropdown.Menu className="header-dropdown-menu">
                                        <Dropdown.Item onClick={handleAdminDashboard} className="header-dropdown-item">
                                            📊 Панель управления
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={handleAdminLogout} className="header-dropdown-item">
                                            🚪 Выйти
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            ) : (
                                <div className="header-auth-buttons">
                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        onClick={handleLogin}
                                        className="header-auth-btn me-2"
                                    >
                                        Вход
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleClientRegister}
                                        className="header-register-btn"
                                    >
                                        Регистрация
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Nav>
                </Navbar.Collapse>

                {/* Mobile auth section */}
                <div className="header-mobile-auth d-lg-none">
                    {isClientLoggedIn ? (
                        <Badge bg="info" className="header-mobile-badge">
                            👤 {clientName}
                        </Badge>
                    ) : isAdminLoggedIn ? (
                        <Badge bg="warning" className="header-mobile-badge">
                            🛠 Админ
                        </Badge>
                    ) : (
                        <Button
                            variant="outline-light"
                            size="sm"
                            onClick={handleLogin}
                            className="header-mobile-login"
                        >
                            Вход
                        </Button>
                    )}
                </div>
            </Container>
        </Navbar>
    );
};

export default Header;