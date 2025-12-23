// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import Header from './components/Layout/Header';
// import Footer from './components/Layout/Footer';
// import Home from './pages/Home';
// import Catalog from './pages/Catalog';
// import About from './pages/About';
// import Contact from './pages/Contact';
// import SiteDetail from './pages/SiteDetail';
// import Admin from './pages/Admin';
// import { LoadingProvider } from './context/LoadingContext';
// import './App.css';

// function App() {
//   return (
//       <LoadingProvider>
//         <Router>
//           <div className="App">
//             <Header />
//             <main className="main-content">
//               <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/catalog" element={<Catalog />} />
//                 <Route path="/catalog/:id" element={<SiteDetail />} />
//                 <Route path="/about" element={<About />} />
//                 <Route path="/contact" element={<Contact />} />
//                 <Route path="/admin/*" element={<Admin />} />
//               </Routes>
//             </main>
//             <Footer />
//             <ToastContainer
//                 position="top-right"
//                 autoClose={5000}
//                 hideProgressBar={false}
//                 newestOnTop
//                 closeOnClick
//                 rtl={false}
//                 pauseOnFocusLoss
//                 draggable
//                 pauseOnHover
//                 theme="dark"
//             />
//           </div>
//         </Router>
//       </LoadingProvider>
//   );
// }
// export default App;


import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import Contact from './pages/Contact';
import SiteDetail from './pages/SiteDetail';
import Admin from './pages/Admin';
import { LoadingProvider } from './context/LoadingContext';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';

import './App.css';

function App() {
  return (
      <LoadingProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/:id" element={<SiteDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin/*" element={<Admin />} />
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

  // Не показываем на админских страницах
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return <WhatsAppButton />;
};

export default App;

