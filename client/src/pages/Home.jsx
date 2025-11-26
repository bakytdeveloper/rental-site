import { useEffect } from 'react';
import Hero from '../components/Hero/Hero';
import Features from '../components/Features/Features';
import FeaturedSites from '../components/FeaturedSites/FeaturedSites';
import CTA from '../components/CTA/CTA';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Home.css';

const Home = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }, []);

    return (
        <div className="home-page">
            <Hero />
            <Features />
            <FeaturedSites />
            <CTA />
        </div>
    );
};

export default Home;