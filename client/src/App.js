import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import Contact from './pages/Contact';
import SiteDetail from './pages/SiteDetail';
import Admin from './pages/Admin';
import ClientDashboard from './pages/ClientDashboard';
// import ClientRegister from './pages/ClientAuth/ClientRegister'; // Обновлен импорт
import Auth from './components/Auth/Auth';
import { LoadingProvider } from './context/LoadingContext';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';
import './App.css';
import './global.css';
import ClientRegister from "./components/Client/ClientRegister";

function App() {
  return (
      <LoadingProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Публичные маршруты */}
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/:id" element={<SiteDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Универсальная авторизация */}
                <Route path="/auth/login" element={<Auth />} />

                {/* Редиректы со старых маршрутов */}
                <Route path="/admin/login" element={<Navigate to="/auth/login" replace />} />
                <Route path="/client/login" element={<Navigate to="/auth/login" replace />} />

                {/* Админ-маршруты */}
                <Route path="/admin/*" element={<Admin />} />

                {/* Клиентские маршруты */}
                <Route path="/client/register" element={<ClientRegister />} />
                <Route path="/client/dashboard" element={
                  <RequireAuth type="client">
                    <ClientDashboard />
                  </RequireAuth>
                } />
                <Route path="/client/forgot-password" element={
                  <div className="container-custom py-5 text-center">
                    <h2>Восстановление пароля</h2>
                    <p className="text-muted mb-4">Функция восстановления пароля в разработке.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.history.back()}
                    >
                      Назад
                    </button>
                  </div>
                } />

                {/* 404 страница */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* WhatsAppButton с проверкой пути */}
            <ConditionalWhatsAppButton />

            <Footer />
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
          </div>
        </Router>
      </LoadingProvider>
  );
}

// Компонент для условного отображения WhatsAppButton
const ConditionalWhatsAppButton = () => {
  const location = useLocation();

  // Не показываем на админских и клиентских страницах
  if (location.pathname.startsWith('/admin') ||
      location.pathname.startsWith('/client') ||
      location.pathname.startsWith('/auth')) {
    return null;
  }

  return <WhatsAppButton />;
};

// Компонент для защиты маршрутов
const RequireAuth = ({ children, type = 'client' }) => {
  const token = localStorage.getItem(`${type}Token`);

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default App;