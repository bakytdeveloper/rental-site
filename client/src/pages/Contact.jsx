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
                toast.success('📧 Сообщение успешно отправлено! Мы ответим вам в течение 24 часов.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            toast.error('Не удалось отправить сообщение. Пожалуйста, попробуйте еще раз.');
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
                            <h1 className="page-title">Свяжитесь с нами</h1>
                            <p className="page-subtitle">
                                Есть вопросы о нашей услуге аренды сайтов? Мы здесь, чтобы помочь!
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
                                                <Form.Label>Полное имя *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Введите ваше полное имя"
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email адрес *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Введите ваш email"
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Тема *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="По какому вопросу?"
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Сообщение *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            placeholder="Расскажите нам больше о вашем вопросе..."
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
                                                Отправка...
                                            </>
                                        ) : (
                                            'Отправить сообщение'
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
                            <h4>Напишите нам</h4>
                            <p>bakytdeveloper@gmail.com</p>
                        </div>
                    </Col>
                    <Col md={4} className="text-center">
                        <div className="contact-info-item">
                            <div className="contact-icon">📞</div>
                            <h4>Позвоните нам</h4>
                            <p>+7 (778) 008-33-14</p>
                        </div>
                    </Col>
                    <Col md={4} className="text-center">
                        <div className="contact-info-item">
                            <div className="contact-icon">📍</div>
                            <h4>Посетите нас</h4>
                            <p>Бизнес Авеню, Офис 100</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;