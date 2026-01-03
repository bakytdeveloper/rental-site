import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './WhatsAppButton.css';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

const WhatsAppButton = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showBubble, setShowBubble] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const phoneNumber = '+77780083314';

    // Мемоизация быстрых сообщений
    const quickMessages = useMemo(() => [
        { text: 'Хочу узнать побольше', message: 'Здравствуйте! Хочу узнать подробнее ...' },
        { text: 'Уточнить наличие', message: 'Здравствуйте! Подскажите, пожалуйста, есть ли в наличии сайт...' },
        { text: 'Можно ли купить сайт', message: 'Здравствуйте! Хотел бы узнать, можно ли заказать сайт и купить его...' },
        { text: 'Создать сайт для аренды', message: 'Здравствуйте! Я хотел бы узнать, сможете ли вы создать отдельный файл и затем его сдать в аренду...' }
    ], []);

    // Оптимизированная обработка клика с useCallback
    const handleClick = useCallback(() => {
        if (isExpanded) {
            setIsExpanded(false);
        } else {
            const encodedMessage = encodeURIComponent('Здравствуйте! Я хочу сделать заказ. Подскажите, пожалуйста.');
            window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
        }
    }, [isExpanded, phoneNumber]);

    const handleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
        setShowBubble(false);
        setHasInteracted(true);
    }, []);

    // Оптимизированный useEffect для подсказки
    useEffect(() => {
        // Используем Intersection Observer для отложенной загрузки
        const hasSeenBubble = localStorage.getItem('hasSeenWhatsAppBubble');

        if (!hasSeenBubble && !hasInteracted) {
            // Используем requestAnimationFrame для оптимизации
            let animationFrameId;
            const showBubbleDelayed = () => {
                animationFrameId = requestAnimationFrame(() => {
                    setShowBubble(true);
                    localStorage.setItem('hasSeenWhatsAppBubble', 'true');
                });
            };

            const timeoutId = setTimeout(showBubbleDelayed, 3000);

            return () => {
                clearTimeout(timeoutId);
                cancelAnimationFrame(animationFrameId);
            };
        }
    }, [hasInteracted]);

    const handleQuickMessage = useCallback((message) => {
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
        setIsExpanded(false);
        setHasInteracted(true);
    }, [phoneNumber]);

    const handleMouseEnter = useCallback(() => {
        if (!isExpanded && !hasInteracted) {
            setShowBubble(true);
        }
    }, [isExpanded, hasInteracted]);

    const handleMouseLeave = useCallback(() => {
        if (!isExpanded) {
            setShowBubble(false);
        }
    }, [isExpanded]);

    if (!isVisible) return null;

    return (
        <>
            <div className={`whatsapp-button-container ${isExpanded ? 'expanded' : ''}`}>
                {/* Основная кнопка */}
                <button
                    className="whatsapp-main-button"
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    aria-label="Написать в WhatsApp"
                    aria-expanded={isExpanded}
                >
                    <FaWhatsapp className="whatsapp-icon" />

                    {/* Упрощенная анимация пульсации */}
                    <div className="pulse-ring"></div>
                </button>

                {/* Подсказка - отображаем только при необходимости */}
                {showBubble && !isExpanded && (
                    <div className="whatsapp-bubble">
                        <div className="bubble-content">
                            <p>Написать в WhatsApp</p>
                            <button
                                className="bubble-close"
                                onClick={() => setShowBubble(false)}
                                aria-label="Закрыть подсказку"
                            >
                                ×
                            </button>
                        </div>
                        <div className="bubble-arrow"></div>
                    </div>
                )}

                {/* Кнопка разворачивания */}
                <button
                    className="whatsapp-expand-button"
                    onClick={handleExpand}
                    aria-label={isExpanded ? "Свернуть меню" : "Быстрые сообщения"}
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? <FaTimes /> : '+'}
                </button>

                {/* Расширенное меню - рендерим только при необходимости */}
                {isExpanded && (
                    <div className="whatsapp-expanded-menu">
                        <h4>Быстрые сообщения</h4>
                        <div className="quick-messages">
                            {quickMessages.map((item, index) => (
                                <button
                                    key={index}
                                    className="quick-message-btn"
                                    onClick={() => handleQuickMessage(item.message)}
                                >
                                    {item.text}
                                </button>
                            ))}
                        </div>
                        <div className="custom-message">
                            <button
                                className="custom-message-btn"
                                onClick={() => handleQuickMessage('')}
                            >
                                Написать своё сообщение
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Кнопка скрытия - рендерим только при наведении */}
            <button
                className="whatsapp-hide-button"
                onClick={() => setIsVisible(false)}
                onMouseEnter={() => !hasInteracted && setShowBubble(true)}
                aria-label="Скрыть кнопку WhatsApp"
            >
                ×
            </button>
        </>
    );
};

export default React.memo(WhatsAppButton);