import { Container, Row, Col } from 'react-bootstrap';
import './Features.css';

const Features = () => {
    const features = [
        {
            icon: '⚡',
            title: 'Instant Deployment',
            description: 'Go live in minutes, not weeks. Our pre-built sites are ready for immediate use.',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: '🛡️',
            title: 'Full Support',
            description: '24/7 technical support and maintenance included with every rental.',
            gradient: 'from-green-400 to-blue-500'
        },
        {
            icon: '🎨',
            title: 'Customizable',
            description: 'Easily customize colors, content, and branding to match your business.',
            gradient: 'from-orange-400 to-red-500'
        },
        {
            icon: '📈',
            title: 'SEO Optimized',
            description: 'All sites come with built-in SEO best practices for better visibility.',
            gradient: 'from-blue-400 to-purple-600'
        }
    ];

    return (
        <section className="features-section">
            <Container>
                <Row className="text-center mb-5">
                    <Col>
                        <h2 className="section-title">
                            Why Choose <span className="text-gradient">RentalSite</span>?
                        </h2>
                        <p className="section-subtitle">
                            Experience the future of web presence with our innovative rental model
                        </p>
                    </Col>
                </Row>

                <Row>
                    {features.map((feature, index) => (
                        <Col lg={3} md={6} key={index} className="mb-4">
                            <div
                                className="feature-card"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                <div className="feature-icon">
                                    <span>{feature.icon}</span>
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-glow"></div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default Features;