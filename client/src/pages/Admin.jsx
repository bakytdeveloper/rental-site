import { useState } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AdminSites from '../components/Admin/AdminSites';
import AdminContacts from '../components/Admin/AdminContacts';
import './Admin.css';

const Admin = () => {
    const location = useLocation();

    return (
        <div className="admin-page">
            <Container fluid>
                <Row>
                    {/* Sidebar */}
                    <Col lg={2} className="admin-sidebar">
                        <div className="sidebar-header">
                            <h3>RentalSite Admin</h3>
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
                    </Col>

                    {/* Main Content */}
                    <Col lg={10} className="admin-main">
                        <Routes>
                            <Route path="/" element={<AdminDashboard />} />
                            <Route path="/sites" element={<AdminSites />} />
                            <Route path="/contacts" element={<AdminContacts />} />
                        </Routes>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Admin;