// components/WhatsAppButton/WhatsAppButton.js
import React, { useState, useEffect } from 'react';
import './WhatsAppButton.css';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

const WhatsAppButton = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showBubble, setShowBubble] = useState(false);

    const phoneNumber = '+77780083314';
    const message = encodeURIComponent('Здравствуйте! Я хочу сделать заказ. Подскажите, пожалуйста.');

    const handleClick = () => {
        if (isExpanded) {
            setIsExpanded(false);
        } else {
            window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
        }
    };

    const handleExpand = () => {
        setIsExpanded(!isExpanded);
        setShowBubble(false);
    };

    useEffect(() => {
        // Показываем подсказку при первом заходе на сайт
        const hasSeenBubble = localStorage.getItem('hasSeenWhatsAppBubble');
        if (!hasSeenBubble) {
            const timer = setTimeout(() => {
                setShowBubble(true);
                localStorage.setItem('hasSeenWhatsAppBubble', 'true');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, []);

    const quickMessages = [
        { text: 'Хочу заказать цветы', message: 'Здравствуйте! Хочу заказать цветы.' },
        { text: 'Уточнить наличие', message: 'Здравствуйте! Подскажите, пожалуйста, есть ли в наличии...' },
        { text: 'Консультация по букету', message: 'Здравствуйте! Нужна консультация по выбору букета.' },
        { text: 'Срочный заказ', message: 'Здравствуйте! Нужен срочный заказ цветов.' }
    ];

    const handleQuickMessage = (text) => {
        const encodedMessage = encodeURIComponent(text);
        window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
        setIsExpanded(false);
    };

    if (!isVisible) return null;

    return (
        <>
            <div className={`whatsapp-button-container ${isExpanded ? 'expanded' : ''}`}>
                {/* Основная кнопка */}
                <button
                    className="whatsapp-main-button"
                    onClick={handleClick}
                    onMouseEnter={() => !isExpanded && setShowBubble(true)}
                    onMouseLeave={() => !isExpanded && setShowBubble(false)}
                    aria-label="Написать в WhatsApp"
                >
                    <FaWhatsapp className="whatsapp-icon" />

                    {/* Анимация пульсации */}
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring delay-1"></div>
                    <div className="pulse-ring delay-2"></div>
                </button>

                {/* Подсказка */}
                {showBubble && !isExpanded && (
                    <div className="whatsapp-bubble">
                        <div className="bubble-content">
                            <p>Заказать через WhatsApp</p>
                            <button
                                className="bubble-close"
                                onClick={() => setShowBubble(false)}
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
                >
                    {isExpanded ? <FaTimes /> : '+'}
                </button>

                {/* Расширенное меню с быстрыми сообщениями */}
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

            {/* Кнопка скрытия (появляется при наведении) */}
            <button
                className="whatsapp-hide-button"
                onClick={() => setIsVisible(false)}
                onMouseEnter={() => setShowBubble(true)}
                aria-label="Скрыть кнопку WhatsApp"
            >
                ×
            </button>
        </>
    );
};

export default WhatsAppButton;