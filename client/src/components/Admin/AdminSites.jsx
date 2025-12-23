import { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal, Spinner } from 'react-bootstrap';
import { siteAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import { toast } from 'react-toastify';
import './AdminSites.css';

const AdminSites = () => {
    const [sites, setSites] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingSite, setEditingSite] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        shortDescription: '',
        price: '',
        category: 'Лендинг',
        technologies: [],
        features: [],
        isFeatured: false,
        isActive: true
    });
    const [techInput, setTechInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');
    const { loading, startLoading, stopLoading } = useLoading();

    // Категории на русском языке (совпадают с enum в модели Site.js)
    const categoryOptions = [
        'Лендинг',
        'Корпоративный сайт',
        'Интернет-магазин',
        'Портфолио',
        'Веб-приложение'
    ];

    useEffect(() => {
        fetchSites();
        // eslint-disable-next-line
    }, []);

    const fetchSites = async () => {
        startLoading();
        try {
            const response = await siteAPI.getAllAdmin();
            setSites(response.data.sites || []);
        } catch (error) {
            toast.error('Не удалось загрузить сайты');
            console.error('Ошибка при загрузке сайтов:', error);
        } finally {
            stopLoading();
        }
    };

    const handleShowModal = (site = null) => {
        if (site) {
            console.log('Редактирование сайта:', site);
            console.log('Изображения сайта:', site.images);
            setEditingSite(site);

            // Используем категорию напрямую (она уже на русском)
            setFormData({
                title: site.title,
                description: site.description,
                shortDescription: site.shortDescription,
                price: site.price,
                category: site.category, // Без перевода
                technologies: site.technologies || [],
                features: site.features || [],
                isFeatured: site.isFeatured,
                isActive: site.isActive
            });

            if (site.images && site.images.length > 0) {
                const previews = site.images.map(img => `http://localhost:5000${img}`);
                console.log('Установка превью изображений:', previews);
                setImagePreviews(previews);
            } else {
                console.log('Нет изображений для сайта');
                setImagePreviews([]);
            }
        } else {
            console.log('Создание нового сайта');
            setEditingSite(null);
            setFormData({
                title: '',
                description: '',
                shortDescription: '',
                price: '',
                category: 'Лендинг',
                technologies: [],
                features: [],
                isFeatured: false,
                isActive: true
            });
            setImagePreviews([]);
        }
        setSelectedImages([]);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        imagePreviews.forEach(preview => {
            if (!preview.startsWith('http://localhost:5000/uploads/')) {
                URL.revokeObjectURL(preview);
            }
        });

        setShowModal(false);
        setEditingSite(null);
        setTechInput('');
        setFeatureInput('');
        setSelectedImages([]);
        setImagePreviews([]);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = imagePreviews.length + files.length;

        if (totalImages > 7) {
            toast.error(`Максимум 7 изображений разрешено. У вас ${imagePreviews.length} изображений и вы пытаетесь добавить ${files.length} еще.`);
            return;
        }

        setSelectedImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        e.target.value = '';
    };

    const removeImage = async (index) => {
        console.log('Удаление изображения по индексу:', index);
        console.log('Текущие превью изображений:', imagePreviews);

        const imageToRemove = imagePreviews[index];
        const isServerImage = imageToRemove.startsWith('http://localhost:5000/uploads/');

        if (isServerImage && editingSite) {
            if (window.confirm('Вы уверены, что хотите удалить это изображение?')) {
                const newPreviews = imagePreviews.filter((_, i) => i !== index);
                setImagePreviews(newPreviews);
                console.log('Удалено серверное изображение из превью');
            }
            return;
        }

        const newPreviews = [...imagePreviews];
        const newSelectedImages = [...selectedImages];
        const selectedImagesIndex = index - (imagePreviews.length - selectedImages.length);

        newPreviews.splice(index, 1);

        if (selectedImagesIndex >= 0 && selectedImagesIndex < selectedImages.length) {
            URL.revokeObjectURL(imageToRemove);
            newSelectedImages.splice(selectedImagesIndex, 1);
            setSelectedImages(newSelectedImages);
        }

        setImagePreviews(newPreviews);
    };

    const addTechnology = () => {
        if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
            setFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, techInput.trim()]
            }));
            setTechInput('');
        }
    };

    const removeTechnology = (tech) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter(t => t !== tech)
        }));
    };

    const addFeature = () => {
        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }));
            setFeatureInput('');
        }
    };

    const removeFeature = (feature) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter(f => f !== feature)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        startLoading();

        try {
            const submitData = new FormData();

            // Копируем formData для отправки
            const dataToSend = { ...formData };

            Object.keys(dataToSend).forEach(key => {
                if (key === 'technologies' || key === 'features') {
                    submitData.append(key, JSON.stringify(dataToSend[key]));
                } else {
                    submitData.append(key, dataToSend[key]);
                }
            });

            if (editingSite) {
                const remainingServerImages = imagePreviews
                    .filter(preview => preview.startsWith('http://localhost:5000/uploads/'))
                    .map(preview => preview.replace('http://localhost:5000', ''));

                console.log('Оставшиеся серверные изображения:', remainingServerImages);
                submitData.append('existingImages', JSON.stringify(remainingServerImages));
            }

            selectedImages.forEach((image, index) => {
                submitData.append('images', image);
            });

            console.log('Отправка данных:');
            console.log('Категория для отправки:', dataToSend.category); // Теперь на русском
            console.log('Количество выбранных изображений:', selectedImages.length);
            console.log('Редактируемый сайт:', editingSite);

            if (editingSite) {
                console.log('Обновление сайта с ID:', editingSite._id);
                const response = await siteAPI.update(editingSite._id, submitData);
                console.log('Ответ на обновление:', response.data);
                toast.success('Сайт успешно обновлен');
            } else {
                console.log('Создание нового сайта');
                const response = await siteAPI.create(submitData);
                console.log('Ответ на создание:', response.data);
                toast.success('Сайт успешно создан');
            }

            handleCloseModal();
            fetchSites();
        } catch (error) {
            console.error('Полная информация об ошибке:', error);
            console.error('Ответ об ошибке:', error.response?.data);
            toast.error(`Не удалось ${editingSite ? 'обновить' : 'создать'} сайт: ${error.response?.data?.message || error.message}`);
        } finally {
            stopLoading();
        }
    };

    const handleDelete = async (siteId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот сайт?')) {
            startLoading();
            try {
                await siteAPI.delete(siteId);
                toast.success('Сайт успешно удален');
                fetchSites();
            } catch (error) {
                toast.error('Не удалось удалить сайт');
                console.error('Ошибка при удалении сайта:', error);
            } finally {
                stopLoading();
            }
        }
    };

    const toggleSiteStatus = async (siteId, currentStatus) => {
        try {
            // Нужно отправить данные сайта, включая категорию на русском
            const site = sites.find(s => s._id === siteId);
            if (!site) return;

            const submitData = new FormData();
            submitData.append('isActive', !currentStatus);

            // Отправляем категорию на русском
            submitData.append('category', site.category);
            submitData.append('title', site.title);
            submitData.append('description', site.description);
            submitData.append('shortDescription', site.shortDescription);
            submitData.append('price', site.price.toString());
            submitData.append('technologies', JSON.stringify(site.technologies || []));
            submitData.append('features', JSON.stringify(site.features || []));

            // Важно: передаем все существующие изображения
            if (site.images && site.images.length > 0) {
                submitData.append('existingImages', JSON.stringify(site.images));
            }

            await siteAPI.update(siteId, submitData);
            toast.success(`Сайт ${!currentStatus ? 'активирован' : 'деактивирован'}`);
            fetchSites();
        } catch (error) {
            toast.error('Не удалось обновить статус сайта');
            console.error('Ошибка обновления статуса сайта:', error);
        }
    };

    const toggleFeatured = async (siteId, currentFeatured) => {
        try {
            await siteAPI.toggleFeatured(siteId);
            toast.success(`Сайт ${!currentFeatured ? 'добавлен в' : 'удален из'} рекомендуемых`);
            fetchSites();
        } catch (error) {
            toast.error('Не удалось обновить статус рекомендации');
            console.error('Ошибка обновления статуса рекомендации:', error);
        }
    };

    const getSiteImage = (site) => {
        if (site.images && site.images.length > 0) {
            return `http://localhost:5000${site.images[0]}`;
        }
        return '/placeholder-image.jpg';
    };

    if (loading && sites.length === 0) {
        return (
            <div className="admin-sites-loading">
                <Spinner animation="border" variant="primary" />
                <p>Загрузка сайтов...</p>
            </div>
        );
    }

    return (
        <div className="admin-sites">
            <div className="admin-sites-page-header">
                <h1>Управление сайтами</h1>
                <Button onClick={() => handleShowModal()} className="admin-sites-btn-add-site">
                    + Добавить новый сайт
                </Button>
            </div>

            <Card className="admin-sites-table-card">
                <Card.Body className="p-0">
                    {sites.length > 0 ? (
                        <div className="admin-sites-table-container">
                            <div className="table-responsive">
                                <Table className="admin-sites-table">
                                    <thead>
                                    <tr>
                                        <th className="admin-sites-image-cell">Изображение</th>
                                        <th className="admin-sites-title-cell">Сайт</th>
                                        <th className="admin-sites-category-cell">Категория</th>
                                        <th className="admin-sites-price-cell">Цена</th>
                                        <th className="admin-sites-status-cell">Статус</th>
                                        <th className="admin-sites-featured-cell">Рекомендуемый</th>
                                        <th className="admin-sites-technologies-cell">Технологии</th>
                                        <th className="admin-sites-actions-cell">Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sites.map(site => (
                                        <tr key={site._id} className="admin-sites-site-row">
                                            <td className="admin-sites-image-cell">
                                                <div className="admin-sites-image-container">
                                                    <img
                                                        src={getSiteImage(site)}
                                                        alt={site.title}
                                                        className="admin-sites-thumbnail"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                    {site.isFeatured && (
                                                        <div className="admin-sites-featured-indicator" title="Рекомендуемый">
                                                            ⭐
                                                        </div>
                                                    )}
                                                    {site.images && site.images.length > 1 && (
                                                        <div className="admin-sites-image-count-badge" title={`${site.images.length} изображений`}>
                                                            +{site.images.length - 1}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="admin-sites-title-cell">
                                                <div className="admin-sites-info">
                                                    <div className="admin-sites-title">{site.title}</div>
                                                    <div className="admin-sites-short-description">
                                                        {site.shortDescription}
                                                    </div>
                                                    <div className="admin-sites-meta">
                                                    <span className="admin-sites-created-date">
                                                        Создан: {new Date(site.createdAt).toLocaleDateString('ru-RU')}
                                                    </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-sites-category-cell">
                                                {/* Исправлено: используем site.category напрямую */}
                                                <Badge bg="outline-primary" className="admin-sites-category-badge">
                                                    {site.category}
                                                </Badge>
                                            </td>
                                            <td className="admin-sites-price-cell">
                                                <div className="admin-sites-price-amount">₸{site.price}</div>
                                                <div className="admin-sites-price-period">/месяц</div>
                                            </td>
                                            <td className="admin-sites-status-cell">
                                                <Badge
                                                    bg={site.isActive ? 'success' : 'secondary'}
                                                    className="admin-sites-status-badge"
                                                    role="button"
                                                    onClick={() => toggleSiteStatus(site._id, site.isActive)}
                                                >
                                                    {site.isActive ? 'Активен' : 'Неактивен'}
                                                </Badge>
                                            </td>
                                            <td className="admin-sites-featured-cell">
                                                <Badge
                                                    bg={site.isFeatured ? 'warning' : 'outline-warning'}
                                                    className="admin-sites-featured-badge"
                                                    role="button"
                                                    onClick={() => toggleFeatured(site._id, site.isFeatured)}
                                                >
                                                    {site.isFeatured ? 'Рекомендуемый' : 'Стандартный'}
                                                </Badge>
                                            </td>
                                            <td className="admin-sites-technologies-cell">
                                                <div className="admin-sites-tech-tags">
                                                    {site.technologies?.slice(0, 3).map((tech, index) => (
                                                        <Badge key={index} bg="outline-info" className="admin-sites-tech-tag">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                    {site.technologies?.length > 3 && (
                                                        <Badge bg="outline-secondary" className="admin-sites-tech-tag-more">
                                                            +{site.technologies.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="admin-sites-actions-cell">
                                                <div className="admin-sites-action-buttons">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        onClick={() => handleShowModal(site)}
                                                        className="admin-sites-btn-edit"
                                                        title="Редактировать сайт"
                                                    >
                                                        ✏️
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={() => handleDelete(site._id)}
                                                        className="admin-sites-btn-delete"
                                                        title="Удалить сайт"
                                                    >
                                                        🗑️
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="admin-sites-no-data">
                            <div className="admin-sites-no-data-icon">🌐</div>
                            <p>Сайты не найдены. Создайте первый сайт, чтобы начать.</p>
                            <Button onClick={() => handleShowModal()} className="admin-sites-btn-add-first">
                                Добавить первый сайт
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Модальное окно добавления/редактирования */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" className="admin-sites-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingSite ? 'Редактировать сайт' : 'Добавить новый сайт'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Название *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Введите название сайта"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Категория *</Form.Label>
                                    <Form.Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {categoryOptions.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Краткое описание *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleInputChange}
                                required
                                placeholder="Краткое описание (максимум 200 символов)"
                                maxLength={200}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Полное описание *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                placeholder="Подробное описание сайта"
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Месячная цена (₸) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Раздел загрузки изображений */}
                        <Form.Group className="mb-4">
                            <Form.Label>Изображения сайта *</Form.Label>
                            <Form.Text className="text-muted d-block mb-2">
                                <span style={{color:"white"}}>
                                    Загрузите скриншоты вашего сайта. Первое изображение будет использоваться как основное превью. Максимум 7 изображений.
                                </span>
                            </Form.Text>

                            {editingSite && (
                                <div className="admin-sites-debug-info mb-2">
                                    <small className="text-info">
                                        Отладка: {imagePreviews.length} всего превью ({imagePreviews.filter(p => p.startsWith('http://localhost:5000/uploads/')).length} серверных, {selectedImages.length} новых)
                                    </small>
                                </div>
                            )}

                            {imagePreviews.length > 0 && (
                                <div className="admin-sites-image-previews mb-3">
                                    <Row>
                                        {imagePreviews.map((preview, index) => {
                                            const isServerImage = preview.startsWith('http://localhost:5000/uploads/');
                                            return (
                                                <Col key={index} xs={6} md={4} className="mb-3">
                                                    <div className="admin-sites-image-preview-container">
                                                        <img
                                                            src={preview}
                                                            alt={`Превью ${index + 1}`}
                                                            className="admin-sites-image-preview"
                                                        />
                                                        <div className="admin-sites-image-info">
                                                            <small className={isServerImage ? 'text-success' : 'text-warning'}>
                                                                {isServerImage ? 'Серверное' : 'Новое'}
                                                            </small>
                                                        </div>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="admin-sites-remove-image-btn"
                                                            onClick={() => removeImage(index)}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                </div>
                            )}

                            <div className="admin-sites-image-upload-area">
                                <Form.Control
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    ref={fileInputRef}
                                    className="d-none"
                                />
                                <Button
                                    variant="outline-primary"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-100"
                                    disabled={imagePreviews.length >= 7}
                                >
                                    📷 Выбрать изображения ({imagePreviews.length}/7)
                                    {imagePreviews.length >= 7 && (
                                        <span className="ms-1 text-warning">• Лимит достигнут</span>
                                    )}
                                </Button>
                                <Form.Text className="text-muted">
                                    <span style={{color:"white"}}>
                                    Поддерживаемые форматы: JPG, PNG, WebP. Макс. 5MB на изображение. Максимум 7 изображений всего.
                                    </span>
                                </Form.Text>
                            </div>

                            {selectedImages.length === 0 && !editingSite && (
                                <Form.Text className="text-danger">
                                    Требуется хотя бы одно изображение
                                </Form.Text>
                            )}
                        </Form.Group>

                        {/* Технологии */}
                        <Form.Group className="mb-3">
                            <Form.Label>Технологии</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type="text"
                                    value={techInput}
                                    onChange={(e) => setTechInput(e.target.value)}
                                    placeholder="Добавить технологию (например, React, Node.js)"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                                />
                                <Button variant="outline-primary" onClick={addTechnology}>
                                    Добавить
                                </Button>
                            </div>
                            <div className="admin-sites-tags-container">
                                {formData.technologies.map((tech, index) => (
                                    <Badge key={index} bg="primary" className="admin-sites-tag">
                                        {tech}
                                        <span className="admin-sites-tag-remove" onClick={() => removeTechnology(tech)}>
                                            ×
                                        </span>
                                    </Badge>
                                ))}
                            </div>
                        </Form.Group>

                        {/* Особенности */}
                        <Form.Group className="mb-3">
                            <Form.Label>Особенности</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type="text"
                                    value={featureInput}
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    placeholder="Добавить особенность (например, Адаптивный дизайн, SEO оптимизация)"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <Button variant="outline-primary" onClick={addFeature}>
                                    Добавить
                                </Button>
                            </div>
                            <div className="admin-sites-tags-container">
                                {formData.features.map((feature, index) => (
                                    <Badge key={index} bg="success" className="admin-sites-tag">
                                        {feature}
                                        <span className="admin-sites-tag-remove" onClick={() => removeFeature(feature)}>
                                            ×
                                        </span>
                                    </Badge>
                                ))}
                            </div>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Check
                                    type="checkbox"
                                    name="isFeatured"
                                    label="Рекомендуемый сайт"
                                    checked={formData.isFeatured}
                                    onChange={handleInputChange}
                                    className="mb-3"
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Check
                                    type="checkbox"
                                    name="isActive"
                                    label="Активен"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="mb-3"
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleCloseModal}>
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading || (imagePreviews.length === 0 && !editingSite) || imagePreviews.length > 7}
                        >
                            {loading ? 'Сохранение...' : (editingSite ? 'Обновить' : 'Создать')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminSites;