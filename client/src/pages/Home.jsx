import { useEffect } from 'react';
import Hero from '../components/Hero/Hero';
// import Features from '../components/Features/Features';
import TargetAudience from '../components/TargetAudience/TargetAudience';
import WhyRent from '../components/WhyRent/WhyRent';
import Benefits from '../components/Benefits/Benefits';
import CooperationFormats from '../components/CooperationFormats/CooperationFormats';
import WorkStages from '../components/WorkStages/WorkStages'; // Добавляем новый компонент
import FeaturedSites from '../components/FeaturedSites/FeaturedSites';
import CTA from '../components/CTA/CTA';
import SEO from '../components/SEO/SEO';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Home.css';
import Tariffs from "../components/Tariffs/Tariffs";
import Reviews from "../components/Reviews/Reviews";

const Home = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }, []);

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "RentalSite",
        "url": "https://rentalsite.kz",
        "description": "Сервис аренды готовых сайтов для бизнеса в Казахстане",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://rentalsite.kz/catalog?search={search_term_string}",
            "query-input": "required name=search_term_string"
        },
        "publisher": {
            "@type": "Organization",
            "name": "RentalSite",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+7-778-008-33-14",
                "contactType": "customer service"
            }
        }
    };

    return (
        <div className="home-page">
            {/* SEO компонент для главной страницы */}
            <SEO
                title="Аренда готовых сайтов для бизнеса | Лендинги, интернет-магазины"
                description="Арендуйте профессиональные сайты для бизнеса в Казахстане. Быстрый запуск за 24 часа, техподдержка 24/7, гибкие условия аренды. Лендинги, интернет-магазины, корпоративные сайты."
                keywords="аренда сайтов Казахстан, готовые сайты аренда, лендинг в аренду, интернет-магазин аренда, сайт под ключ, веб-сайт аренда"
                canonical="https://rentalsite.kz/"
                structuredData={structuredData}
            />

            <Hero />
            {/*<Features />*/}
            <TargetAudience />
            <WhyRent />
            <Benefits />
            <CooperationFormats />
            <WorkStages />
            <Tariffs />
            <FeaturedSites />
            <Reviews /> {/* Добавляем новый компонент отзывов */}
            <CTA />
        </div>
    );
};

export default Home;
