import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import { contactAPI } from '../services/api';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-toastify';
import SEO from '../components/SEO/SEO'; // Добавляем SEO компонент
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '', // Добавлено поле телефона
        subject: '',
        message: ''
    });

    const { loading, startLoading, stopLoading } = useLoading();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Контакты RentalSite",
        "description": "Свяжитесь с нами для аренды сайта или получения консультации",
        "url": "https://rentalsite.kz/contact",
        "mainEntity": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "telephone": "+7-778-008-33-14",
            "email": "v.a080584s@gmail.com",
            "availableLanguage": ["Russian", "Kazakh"],
            "hoursAvailable": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
            }
        }
    };


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
                setFormData({
                    name: '',
                    email: '',
                    phone: '', // Добавлено сброс поля телефона
                    subject: '',
                    message: ''
                });
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
            {/* SEO компонент для страницы контактов */}
            <SEO
                title="Контакты RentalSite | Свяжитесь с нами"
                description="Свяжитесь с RentalSite для аренды сайта или получения консультации. Телефон: +7 (778) 008-33-14, Email: v.a080584s@gmail.com"
                keywords="контакты RentalSite, связаться с нами, аренда сайтов контакты, телефон для аренды сайта, email поддержки"
                canonical="https://rentalsite.kz/contact"
                structuredData={structuredData}
            />

            <div className="contact-hero">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto text-center">
                            <h1 className="page-title">Свяжитесь с нами</h1>
                            <p className="page-subtitle">
                                Аренда сайтов: есть вопросы? Мы рядом!
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

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Номер телефона *</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="+7 (999) 123-45-67"
                                                    disabled={loading}
                                                    pattern="^[\+]?[1-9][\d\s\-\(\)\.]{7,}$"
                                                    title="Введите корректный номер телефона"
                                                />
                                                <Form.Text className="text-muted">
                                                    Например: +7 (999) 123-45-67 или 89991234567
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
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
                                        </Col>
                                    </Row>

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
                            <p>rentalsite@gmail.com</p>
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