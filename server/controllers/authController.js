import jwt from 'jsonwebtoken';

// Генерация JWT токена для админа
const generateAdminToken = () => {
    return jwt.sign({
        id: process.env.ADMIN_USERNAME,
        role: 'admin'
    }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Вход администратора
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Проверяем email и пароль
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, введите email и пароль'
            });
        }

        // Проверяем административные данные из .env
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminUsername = process.env.ADMIN_USERNAME;

        if (email === adminEmail && password === adminPassword) {
            // Генерируем токен
            const token = generateAdminToken();

            res.json({
                success: true,
                token: token,
                user: {
                    id: adminUsername,
                    username: adminUsername,
                    email: adminEmail,
                    role: 'admin',
                    lastLogin: new Date()
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные'
            });
        }
    } catch (error) {
        console.error('Ошибка входа админа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при входе'
        });
    }
};

// @desc    Получить текущего пользователя (админа)
// @route   GET /api/auth/admin/me
// @access  Private/Admin
export const getAdminProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: process.env.ADMIN_USERNAME,
                username: process.env.ADMIN_USERNAME,
                email: process.env.ADMIN_EMAIL,
                role: 'admin',
                lastLogin: new Date()
            }
        });
    } catch (error) {
        console.error('Ошибка получения профиля админа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};