import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

// Русские email шаблоны
const emailTemplates = {
    newRentalInquiry: (contactData, siteData) => ({
        subject: `🎯 Новый запрос на аренду: ${siteData.title}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .badge { background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Новый запрос на аренду сайта</h1>
            <p>Потенциальный клиент заинтересован в аренде вашего сайта</p>
          </div>
          
          <div class="content">
            <div class="info-card">
              <h3>📋 Информация о запросе</h3>
              <p><strong>Сайт:</strong> ${siteData.title}</p>
              <p><strong>Категория:</strong> <span class="badge">${siteData.category}</span></p>
              <p><strong>Месячная цена:</strong> ₸${siteData.price}</p>
              <p><strong>Дата запроса:</strong> ${new Date().toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</p>
            </div>

            <div class="info-card">
              <h3>👤 Информация о клиенте</h3>
              <p><strong>Имя:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Телефон:</strong> ${contactData.phone || 'Не указан'}</p>
              ${contactData.company ? `<p><strong>Компания:</strong> ${contactData.company}</p>` : ''}
            </div>

            <div class="info-card">
              <h3>💬 Сообщение клиента</h3>
              <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 3px solid #667eea;">
                ${contactData.message}
              </p>
            </div>

            <div class="info-card">
              <h3>⚡ Быстрые действия</h3>
              <p>
                <a href="mailto:${contactData.email}" class="button">📧 Ответить клиенту</a>
                <a href="tel:${contactData.phone || ''}" class="button" style="background: #28a745;">📞 Позвонить клиенту</a>
              </p>
              <p><small>Часовой пояс клиента: ${Intl.DateTimeFormat().resolvedOptions().timeZone}</small></p>
            </div>

            <div class="info-card">
              <h3>📊 Детали сайта</h3>
              <p><strong>Особенности:</strong> ${siteData.features?.join(', ') || 'Особенности не указаны'}</p>
              <p><strong>Технологии:</strong> ${siteData.technologies?.join(', ') || 'Не указаны'}</p>
              ${siteData.demoUrl ? `<p><strong>Демо:</strong> <a href="${siteData.demoUrl}">Посмотреть живое демо</a></p>` : ''}
            </div>
          </div>

          <div class="footer">
            <p>Это письмо было автоматически сгенерировано системой RentalSite</p>
            <p>💼 <strong>RentalSite Business</strong> | Профессиональная аренда сайтов</p>
            <p>📍 ${new Date().getFullYear()} RentalSite. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `
    }),

    newContactMessage: (contactData) => ({
        subject: `📧 Новое сообщение с контактной формы: ${contactData.subject || 'Общий запрос'}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ff6b6b; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
          .button { background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 Новое контактное сообщение</h1>
            <p>Кто-то связался через контактную форму вашего сайта</p>
          </div>
          
          <div class="content">
            <div class="info-card">
              <h3>👤 Информация об отправителе</h3>
              <p><strong>Имя:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Тема:</strong> ${contactData.subject || 'Не указана'}</p>
              <p><strong>Получено:</strong> ${new Date().toLocaleString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
            </div>

            <div class="info-card">
              <h3>💬 Содержание сообщения</h3>
              <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 3px solid #ff6b6b; white-space: pre-line;">
                ${contactData.message}
              </p>
            </div>

            <div class="info-card">
              <h3>⚡ Быстрый ответ</h3>
              <p>
                <a href="mailto:${contactData.email}?subject=Re: ${contactData.subject || 'Ваш запрос'}" class="button">
                  📧 Ответить на сообщение
                </a>
              </p>
              <p><small>Рекомендуется ответить в течение 24 часов</small></p>
            </div>
          </div>

          <div class="footer">
            <p>Это письмо было автоматически сгенерировано системой RentalSite</p>
            <p>💼 <strong>RentalSite Business</strong> | Профессиональная аренда сайтов</p>
            <p>📍 ${new Date().getFullYear()} RentalSite. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `
    }),

    highPriorityAlert: (contactData, siteData) => ({
        subject: `🚨 СРОЧНО: Запрос на аренду - ${siteData.title}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff5f5; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ff4757; border: 2px solid #ff4757; }
          .urgent-badge { background: #ff4757; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
          .button { background: #ff4757; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 СРОЧНЫЙ запрос на аренду</h1>
            <p>Требуется немедленное внимание к этому запросу на аренду</p>
          </div>
          
          <div class="content">
            <div class="info-card">
              <div class="urgent-badge">⚠️ СРОЧНО</div>
              <h3>📋 Срочный запрос на аренду</h3>
              <p><strong>Сайт:</strong> ${siteData.title} (₸${siteData.price}/месяц)</p>
              <p><strong>Клиент:</strong> ${contactData.name} - ${contactData.email}</p>
              <p><strong>Телефон:</strong> ${contactData.phone || 'Не указан'}</p>
              <p><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</p>
            </div>

            <div class="info-card">
              <h3>🎯 Необходимые немедленные действия</h3>
              <p>
                <a href="mailto:${contactData.email}" class="button">📧 Написать клиенту</a>
                ${contactData.phone ? `<a href="tel:${contactData.phone}" class="button" style="background: #2ed573;">📞 Позвонить сейчас</a>` : ''}
              </p>
              <p><strong>Время ответа:</strong> Рекомендуется в течение 1-2 часов</p>
            </div>

            <div class="info-card">
              <h3>💬 Сообщение клиента</h3>
              <p style="background: #fff1f1; padding: 15px; border-radius: 5px; border-left: 3px solid #ff4757;">
                ${contactData.message}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    }),

    rentalExpiringSoon: (contactData, siteData) => ({
        subject: `⏰ Аренда скоро закончится: ${siteData.title}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff9f43 0%, #ff9f43 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fffaf0; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ff9f43; }
          .button { background: #ff9f43; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Аренда скоро закончится</h1>
            <p>Период аренды вашего сайта скоро истекает</p>
          </div>
          
          <div class="content">
            <div class="info-card">
              <h3>📋 Детали аренды</h3>
              <p><strong>Сайт:</strong> ${siteData.title}</p>
              <p><strong>Месячная цена:</strong> ₸${siteData.price}</p>
              <p><strong>Дата окончания:</strong> ${new Date(contactData.rentalEndDate).toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</p>
              <p><strong>Осталось дней:</strong> ${contactData.daysRemaining}</p>
            </div>

            <div class="info-card">
              <h3>💳 Продлите вашу аренду</h3>
              <p>Чтобы продолжить использование ${siteData.title}, пожалуйста, произведите оплату для продления периода аренды.</p>
              <p><strong>Сумма следующего платежа:</strong> ₸${siteData.price}</p>
              <a href="mailto:support@rentalsite.com?subject=Продление: ${siteData.title}" class="button">
                📧 Связаться с поддержкой для продления
              </a>
            </div>

            <div class="info-card">
              <h3>📞 Нужна помощь?</h3>
              <p>Если у вас есть вопросы по аренде или оплате, пожалуйста, свяжитесь с нашей службой поддержки.</p>
              <p><strong>Email:</strong> support@rentalsite.com</p>
              <p><strong>Телефон:</strong> +7 (XXX) XXX-XXXX</p>
            </div>
          </div>

          <div class="footer" style="text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px;">
            <p>Это автоматическое напоминание от RentalSite</p>
          </div>
        </div>
      </body>
      </html>
    `
    }),

    // Обновленный шаблон adminRentalExpiring
    adminRentalExpiring: (contactData, siteData) => ({
        subject: `⚠️ Аренда скоро закончится: ${contactData.name} - ${siteData.title}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container { 
            max-width: 700px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(135deg, #ff9f43 0%, #ff7b00 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content { 
            padding: 30px; 
            border-radius: 0 0 10px 10px;
            border: 1px solid #e9ecef;
            border-top: none;
          }
          .alert-box {
            background: #fff9e6;
            border: 2px solid #ffc107;
            border-left: 5px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
          }
          .alert-title {
            color: #856404;
            font-weight: 600;
            font-size: 18px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .info-card { 
            background: #f8f9fa; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px; 
            border-left: 4px solid #007bff;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
          }
          .info-item {
            margin-bottom: 12px;
          }
          .info-label {
            color: #6c757d;
            font-weight: 500;
            font-size: 14px;
            margin-bottom: 5px;
            display: block;
          }
          .info-value {
            color: #212529;
            font-weight: 600;
            font-size: 16px;
          }
          .days-badge {
            display: inline-block;
            background: ${contactData.daysRemaining <= 1 ? '#dc3545' : contactData.daysRemaining <= 3 ? '#fd7e14' : '#ffc107'};
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-left: 10px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0 20px;
          }
          .button { 
            background: #007bff; 
            color: white; 
            padding: 14px 32px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
            margin: 0 10px;
            transition: background-color 0.3s;
          }
          .button:hover {
            background: #0056b3;
            color: white;
            text-decoration: none;
          }
          .button-contact {
            background: #28a745;
          }
          .button-contact:hover {
            background: #1e7e34;
          }
          .footer {
            text-align: center; 
            margin-top: 30px; 
            padding: 20px; 
            color: #6c757d; 
            font-size: 14px;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 5px 0;
          }
          .highlight {
            color: #dc3545;
            font-weight: 600;
          }
          .date-detail {
            font-size: 15px;
            color: #495057;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Аренда скоро закончится</h1>
            <p>Период аренды клиента скоро истекает - требуется немедленное действие</p>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <div class="alert-title">
                ⏰ Срочное уведомление
                <span class="days-badge">
                  ${contactData.daysRemaining === 1 ? '1 ДЕНЬ ОСТАЛСЯ' :
                 contactData.daysRemaining === 0 ? 'ЗАКОНЧИТСЯ СЕГОДНЯ' :
                `${contactData.daysRemaining} ДНЯ ОСТАЛОСЬ`}
                </span>
              </div>
              <p style="color: #856404; margin: 0;">
                Период аренды для <strong>${siteData.title}</strong> скоро закончится. 
                Пожалуйста, свяжитесь с клиентом для продления оплаты.
              </p>
            </div>

            <div class="info-card">
              <h3 style="color: #007bff; margin-top: 0; margin-bottom: 20px; font-size: 20px;">📋 Сводка по аренде</h3>
              
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Имя клиента:</span>
                  <div class="info-value">${contactData.name}</div>
                </div>
                
                <div class="info-item">
                  <span class="info-label">Сайт:</span>
                  <div class="info-value">${siteData.title}</div>
                </div>
                
                <div class="info-item">
                  <span class="info-label">Месячная цена:</span>
                  <div class="info-value">₸${siteData.price}/месяц</div>
                </div>
                
                <div class="info-item">
                  <span class="info-label">Email клиента:</span>
                  <div class="info-value">${contactData.email}</div>
                </div>
              </div>
              
              ${contactData.phone ? `
              <div class="info-item">
                <span class="info-label">Телефон клиента:</span>
                <div class="info-value">${contactData.phone}</div>
              </div>
              ` : ''}
            </div>

            <div class="info-card">
              <h3 style="color: #007bff; margin-top: 0; margin-bottom: 20px; font-size: 20px;">📅 Детали окончания</h3>
              
              <div class="info-item">
                <span class="info-label">Дата окончания:</span>
                <div class="info-value">
                  ${new Date(contactData.rentalEndDate).toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
                <div class="date-detail">
                  (${new Date(contactData.rentalEndDate).toLocaleDateString('ru-RU', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })})
                </div>
              </div>
              
              <div class="info-item">
                <span class="info-label">Осталось времени:</span>
                <div class="info-value">
                  ${contactData.daysRemaining} ${contactData.daysRemaining === 1 ? 'день' : contactData.daysRemaining < 5 ? 'дня' : 'дней'}
                  ${contactData.daysRemaining === 0 ?
            ' - <span class="highlight">Истекает сегодня!</span>' :
            contactData.daysRemaining <= 3 ?
                ' - <span class="highlight">Требуется срочное внимание</span>' :
                ''}
                </div>
              </div>
              
              <div class="info-item">
                <span class="info-label">Точное время окончания:</span>
                <div class="info-value">
                  ${new Date(contactData.rentalEndDate).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        })}
                </div>
              </div>
            </div>

            <div class="info-card">
              <h3 style="color: #007bff; margin-top: 0; margin-bottom: 20px; font-size: 20px;">⚡ Быстрые действия</h3>
              
              <div class="button-container">
                <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin'}/contacts/${contactData._id}" 
                   class="button">
                   👁️ Посмотреть в админ-панели
                </a>
                
                <a href="mailto:${contactData.email}?subject=Продление: ${siteData.title}&body=Уважаемый(ая) ${contactData.name},%0D%0A%0D%0AВаша аренда ${siteData.title} истекает ${new Date(contactData.rentalEndDate).toLocaleDateString('ru-RU')}.%0D%0A%0D%0AПожалуйста, сообщите нам, хотите ли вы продлить период аренды.%0D%0A%0D%0АС уважением,%0D%0AКоманда RentalSite" 
                   class="button button-contact">
                   📧 Написать клиенту
                </a>
              </div>
              
              ${contactData.phone ? `
              <div style="text-align: center; margin-top: 15px;">
                <span style="color: #6c757d; font-size: 14px;">📞 Быстрый звонок:</span>
                <a href="tel:${contactData.phone}" style="color: #28a745; font-weight: 600; margin-left: 10px;">
                  ${contactData.phone}
                </a>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #6c757d;">
                <p style="margin: 5px 0;">
                  <strong>Рекомендуемое действие:</strong> Связаться с клиентом в течение 24 часов
                </p>
                <p style="margin: 5px 0;">
                  <strong>Напоминание:</strong> Клиент уже получил уведомление об окончании
                </p>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Это автоматическое уведомление от системы управления RentalSite</p>
            <p>
              <strong>ID уведомления:</strong> EXP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}
            </p>
            <p>📍 ${new Date().getFullYear()} RentalSite. Все права защищены.</p>
            <p>⏰ Создано: ${new Date().toLocaleString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
          </div>
        </div>
      </body>
      </html>
    `
    }),

    rentalExpired: (contactData, siteData) => ({
        subject: `🔴 Аренда закончилась: ${siteData.title}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #dc3545; }
                .button { background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
                .alert-box { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔴 Период аренды закончился</h1>
                    <p>Аренда вашего сайта истекла</p>
                </div>
                
                <div class="content">
                    <div class="alert-box">
                        <h3 style="color: #856404; margin-top: 0;">⚠️ Важное уведомление</h3>
                        <p style="color: #856404;">
                            Ваш период аренды для <strong>${siteData.title}</strong> закончился 
                            ${new Date(contactData.rentalEndDate).toLocaleDateString('ru-RU', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}.
                        </p>
                    </div>
        
                    <div class="info-card">
                        <h3>📋 Детали аренды</h3>
                        <p><strong>Сайт:</strong> ${siteData.title}</p>
                        <p><strong>Месячная цена:</strong> ₸${siteData.price}</p>
                        <p><strong>Дата окончания:</strong> ${new Date(contactData.rentalEndDate).toLocaleDateString('ru-RU')}</p>
                    </div>
        
                    <div class="info-card">
                        <h3>💳 Продлите вашу аренду</h3>
                        <p>Чтобы продолжить использование ${siteData.title}, пожалуйста, произведите оплату для продления периода аренды.</p>
                        <p><strong>Сумма следующего платежа:</strong> ₸${siteData.price}</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="mailto:${process.env.SMTP_FROM}?subject=Запрос на продление: ${siteData.title}&body=Здравствуйте,%0D%0A%0D%0AЯ хотел(а) бы продлить аренду для ${siteData.title}.%0D%0A%0D%0AИмя: ${contactData.name}%0D%0AEmail: ${contactData.email}%0D%0A%0D%0АПожалуйста, сообщите детали оплаты." 
                               class="button">
                               📧 Запросить продление
                            </a>
                        </div>
                    </div>
        
                    <div class="info-card">
                        <h3>⚠️ Важная информация</h3>
                        <p>Пожалуйста, обратите внимание, что доступ к сайту будет приостановлен, если оплата не будет получена в течение 7 дней.</p>
                        <p>Для немедленной помощи свяжитесь с нашей службой поддержки.</p>
                    </div>
                </div>
        
                <div class="footer" style="text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px;">
                    <p>Это автоматическое уведомление от RentalSite</p>
                </div>
            </div>
        </body>
        </html>
        `
    }),

    adminRentalExpired: (contactData, siteData) => ({
        subject: `🚨 АРЕНДА ЗАКОНЧИЛАСЬ: ${contactData.name} - ${siteData.title}`,
        html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #bd2130 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; border-top: none; }
            .alert-box { background: #f8d7da; border: 2px solid #f5c6cb; border-left: 5px solid #dc3545; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
            .info-card { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #6c757d; }
            .button { background: #dc3545; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; margin: 0 10px; }
            .button-renew { background: #28a745; }
            .button-renew:hover { background: #218838; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 АРЕНДА ЗАКОНЧИЛАСЬ</h1>
                <p>Аренда клиента завершена - требуется немедленное действие</p>
            </div>
            
            <div class="content">
                <div class="alert-box">
                    <h3 style="color: #721c24; margin-top: 0;">⚠️ СРОЧНО: Аренда закончилась</h3>
                    <p style="color: #721c24;">
                        Аренда для <strong>${siteData.title}</strong> закончилась. 
                        Статус клиента изменен на <strong>ожидает оплаты</strong>.
                    </p>
                </div>
    
                <div class="info-card">
                    <h3 style="color: #343a40;">📋 Информация о клиенте</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                        <div>
                            <strong>Клиент:</strong> ${contactData.name}<br>
                            <strong>Email:</strong> ${contactData.email}<br>
                            ${contactData.phone ? `<strong>Телефон:</strong> ${contactData.phone}<br>` : ''}
                        </div>
                        <div>
                            <strong>Сайт:</strong> ${siteData.title}<br>
                            <strong>Месячная цена:</strong> ₸${siteData.price}<br>
                            <strong>Всего оплачено:</strong> ₸${contactData.totalPaid || 0}
                        </div>
                    </div>
                </div>
    
                <div class="info-card">
                    <h3 style="color: #343a40;">📅 Детали окончания</h3>
                    <p><strong>Дата окончания:</strong> ${new Date(contactData.rentalEndDate).toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</p>
                    <p><strong>Время окончания:</strong> ${new Date(contactData.rentalEndDate).toLocaleTimeString('ru-RU')}</p>
                    <p><strong>Дней просрочки:</strong> <span style="color: #dc3545; font-weight: bold;">
                        ${Math.floor((new Date() - new Date(contactData.rentalEndDate)) / (1000 * 60 * 60 * 24))}
                    </span></p>
                </div>
    
                <div class="info-card">
                    <h3 style="color: #343a40;">⚡ Требуемые действия</h3>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin'}/contacts/${contactData._id}" 
                           class="button">
                           👁️ Посмотреть в админке
                        </a>
                        
                        <a href="mailto:${contactData.email}?subject=СРОЧНО: Аренда закончилась - ${siteData.title}&body=Уважаемый(ая) ${contactData.name},%0D%0A%0D%0AВаша аренда ${siteData.title} закончилась.%0D%0A%0D%0AПожалуйста, свяжитесь с нами немедленно для продления и избежания прерывания службы.%0D%0A%0D%0АС уважением,%0D%0AКоманда RentalSite" 
                           class="button button-renew">
                           📧 Связаться с клиентом
                        </a>
                    </div>
                </div>
            </div>
    
            <div class="footer" style="text-align: center; margin-top: 30px; padding: 20px; color: #6c757d; font-size: 14px;">
                <p>Это автоматическое уведомление от системы управления RentalSite</p>
            </div>
        </div>
    </body>
    </html>
    `
    }),

    paymentReceived: (contactData, siteData) => ({
        subject: `✅ Платеж получен - ${siteData.title}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #28a745; }
                    .success-icon { color: #28a745; font-size: 40px; text-align: center; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Платеж получен</h1>
                        <p>Спасибо за ваш платеж</p>
                    </div>
                    
                    <div class="content">
                        <div class="success-icon">
                            ✓
                        </div>
                        
                        <div class="info-card">
                            <h3>📋 Детали платежа</h3>
                            <p><strong>Сумма:</strong> ₸${contactData.amount}</p>
                            <p><strong>За сайт:</strong> ${siteData.title}</p>
                            <p><strong>Месяцев продлено:</strong> ${contactData.months || 1}</p>
                            <p><strong>Дата платежа:</strong> ${new Date().toLocaleDateString('ru-RU', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
            
                        <div class="info-card">
                            <h3>📅 Новый период аренды</h3>
                            <p>Ваша аренда продлена до:</p>
                            <p style="font-size: 18px; font-weight: bold; color: #28a745;">
                                ${new Date(contactData.rentalEndDate).toLocaleDateString('ru-RU', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <p><strong>Следующий платеж:</strong> Приблизительно ${new Date(contactData.rentalEndDate).toLocaleDateString('ru-RU', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}</p>
                        </div>
            
                        <div class="info-card">
                            <h3>📞 Информация о поддержке</h3>
                            <p>Если у вас есть вопросы по аренде или оплате, пожалуйста, свяжитесь с нашей службой поддержки.</p>
                            <p><strong>Email:</strong> support@rentalsite.com</p>
                            <p><strong>Телефон:</strong> +7 (XXX) XXX-XXXX</p>
                        </div>
                    </div>
            
                    <div class="footer">
                        <p>Это автоматическое подтверждение платежа от RentalSite</p>
                        <p>📍 ${new Date().getFullYear()} RentalSite. Все права защищены.</p>
                    </div>
                </div>
            </body>
            </html>
            `
    }),

    adminPaymentReceived: (contactData, siteData) => ({
        subject: `💰 Платеж получен от ${contactData.name} - ${siteData.title}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 700px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .content { padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; border-top: none; }
                    .info-card { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #28a745; }
                    .button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💰 Платеж получен</h1>
                        <p>Клиент произвел оплату за аренду сайта</p>
                    </div>
                    
                    <div class="content">
                        <div class="info-card">
                            <h3 style="color: #28a745; margin-top: 0;">📋 Сводка по платежу</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                                <div>
                                    <strong>Клиент:</strong> ${contactData.name}<br>
                                    <strong>Email:</strong> ${contactData.email}<br>
                                    ${contactData.phone ? `<strong>Телефон:</strong> ${contactData.phone}<br>` : ''}
                                </div>
                                <div>
                                    <strong>Сайт:</strong> ${siteData.title}<br>
                                    <strong>Сумма:</strong> ₸${contactData.amount}<br>
                                    <strong>Месяцев:</strong> ${contactData.months || 1}
                                </div>
                            </div>
                        </div>
            
                        <div class="info-card">
                            <h3 style="color: #28a745;">📅 Продление аренды</h3>
                            <p><strong>Старая дата окончания:</strong> До оплаты</p>
                            <p><strong>Новая дата окончания:</strong> ${new Date(contactData.rentalEndDate).toLocaleDateString('ru-RU', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                            <p><strong>Продлено на:</strong> ${contactData.months || 1} ${contactData.months === 1 ? 'месяц' : contactData.months < 5 ? 'месяца' : 'месяцев'}</p>
                        </div>
            
                        <div class="info-card">
                            <h3 style="color: #28a745;">⚡ Быстрые действия</h3>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin'}/contacts/${contactData._id}" 
                                   class="button">
                                   👁️ Посмотреть в админ-панели
                                </a>
                            </div>
                        </div>
                    </div>
            
                    <div class="footer" style="text-align: center; margin-top: 30px; padding: 20px; color: #6c757d; font-size: 14px;">
                        <p>Это автоматическое уведомление о платеже от системы управления RentalSite</p>
                    </div>
                </div>
            </body>
            </html>
            `
    })
};

// Main email sending function
export const sendEmailNotification = async (type, contactData, siteData = null, additionalData = {}) => {
    try {
        // Проверяем, существует ли такой шаблон
        if (!emailTemplates[type]) {
            console.error(`❌ Email template "${type}" not found`);
            return {
                success: false,
                error: `Email template "${type}" not found`,
                availableTemplates: Object.keys(emailTemplates)
            };
        }

        const transporter = createTransporter();

        // Добавляем дополнительные данные
        const dataWithExtras = {
            ...contactData,
            ...additionalData
        };

        const template = emailTemplates[type](dataWithExtras, siteData);

        // Определяем получателя в зависимости от типа письма
        let toEmail;

        switch(type) {
            case 'adminRentalExpiring':
            case 'adminRentalExpired':
            case 'adminPaymentReceived':
                toEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_FROM;
                break;
            case 'rentalExpiringSoon':
            case 'rentalExpired':
            case 'paymentReceived':
                toEmail = contactData.email;
                break;
            case 'newRentalInquiry':
            case 'newContactMessage':
            case 'highPriorityAlert':
                toEmail = process.env.SMTP_FROM; // Отправляем админу
                break;
            default:
                toEmail = process.env.SMTP_FROM;
        }

        const mailOptions = {
            from: {
                name: 'RentalSite Notification System',
                address: process.env.SMTP_FROM
            },
            to: toEmail,
            subject: template.subject,
            html: template.html
        };

        console.log(`📤 Отправка ${type} письма на ${toEmail}...`);
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ ${type} письмо успешно отправлено:`, result.messageId);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error(`❌ Ошибка отправки ${type} письма:`, error);
        return { success: false, error: error.message };
    }
};