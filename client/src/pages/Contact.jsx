import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import { contactAPI } from '../services/api';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-toastify';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const { loading, startLoading, stopLoading } = useLoading();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        startLoading();

        try {
            const response = await contactAPI.create(formData);

            if (response.data.success) {
                toast.success('📧 Message sent successfully! We will get back to you within 24 hours.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            stopLoading();
        }
    };

    return (
        <div className="contact-page">
            <div className="contact-hero">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto text-center">
                            <h1 className="page-title">Get In Touch</h1>
                            <p className="page-subtitle">
                                Have questions about our website rental service? We're here to help!
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="contact-content">
                <Row>
                    <Col lg={8} className="mx-auto">
                        <Card className="contact-form-card">
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Full Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Enter your full name"
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email Address *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Enter your email"
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Subject *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="What is this regarding?"
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Message *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            placeholder="Tell us more about your inquiry..."
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="btn-submit-message"
                                        size="lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="contact-info-section">
                    <Col md={4} className="text-center">
                        <div className="contact-info-item">
                            <div className="contact-icon">📧</div>
                            <h4>Email Us</h4>
                            <p>hello@rentalsite.com</p>
                        </div>
                    </Col>
                    <Col md={4} className="text-center">
                        <div className="contact-info-item">
                            <div className="contact-icon">📞</div>
                            <h4>Call Us</h4>
                            <p>+1 (555) 123-4567</p>
                        </div>
                    </Col>
                    <Col md={4} className="text-center">
                        <div className="contact-info-item">
                            <div className="contact-icon">📍</div>
                            <h4>Visit Us</h4>
                            <p>123 Business Ave, Suite 100</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;