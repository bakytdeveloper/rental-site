import { Helmet } from 'react-helmet-async';

const SEO = ({
                 title,
                 description,
                 keywords,
                 canonical,
                 ogImage,
                 ogType = 'website',
                 structuredData,
                 noindex = false,
                 publishedTime,
                 modifiedTime,
                 author,
                 section = 'business',
                 productData, // Добавляем проп для данных продукта
                 isProduct = false // Флаг для страниц продукта
             }) => {
    const siteTitle = 'RentalSite - Аренда готовых сайтов в Казахстане';
    const siteDescription = description || 'Арендуйте готовые сайты для бизнеса в Казахстане. Лендинги, интернет-магазины, корпоративные сайты. Быстрый запуск за 24 часа, техническая поддержка 24/7, гибкие условия аренды.';
    const siteKeywords = keywords || 'аренда сайтов Казахстан, готовые сайты аренда, сайты в аренду, лендинг аренда, интернет-магазин аренда';
    const siteUrl = 'https://rentalsite.kz';
    const defaultOgImage = 'https://rentalsite.kz/images/og-image.jpg';

    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const fullCanonical = canonical || siteUrl;

    // Для страниц продукта меняем Open Graph тип
    const ogTypeToUse = isProduct ? 'product' : ogType;

    return (
        <Helmet>
            {/* Базовые мета-теги */}
            <title>{fullTitle}</title>
            <meta name="description" content={siteDescription} />
            <meta name="keywords" content={siteKeywords} />

            {/* Индексация */}
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {!noindex && <meta name="robots" content="index, follow, max-image-preview:large" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogTypeToUse} />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:image" content={ogImage || defaultOgImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="RentalSite" />
            <meta property="og:locale" content="ru_KZ" />

            {/* Для продуктов добавляем дополнительные OG теги */}
            {isProduct && productData && (
                <>
                    <meta property="og:price:amount" content={productData.price} />
                    <meta property="og:price:currency" content="KZT" />
                    <meta property="product:availability" content={productData.isActive ? "in stock" : "out of stock"} />
                    <meta property="product:condition" content="new" />
                    <meta property="product:brand" content="RentalSite" />
                    {productData.category && (
                        <meta property="product:category" content={productData.category} />
                    )}
                </>
            )}

            {/* Для статей */}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {author && <meta property="article:author" content={author} />}
            <meta property="article:section" content={section} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullCanonical} />
            <meta property="twitter:title" content={title || siteTitle} />
            <meta property="twitter:description" content={siteDescription} />
            <meta property="twitter:image" content={ogImage || defaultOgImage} />
            <meta property="twitter:site" content="@rentalsite_kz" />
            <meta property="twitter:creator" content="@rentalsite_kz" />

            {/* Каноническая ссылка и альтернативные языки */}
            <link rel="canonical" href={fullCanonical} />
            <link rel="alternate" hreflang="ru" href={fullCanonical} />
            <link rel="alternate" hreflang="kk" href={`https://rentalsite.kz/kk${fullCanonical.replace('https://rentalsite.kz', '')}`} />
            <link rel="alternate" hreflang="x-default" href={fullCanonical} />

            {/* Структурированные данные */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}

            {/* Дополнительные мета-теги */}
            <meta name="geo.region" content="KZ" />
            <meta name="geo.placename" content="Казахстан" />
            <meta name="author" content={author || "RentalSite"} />
            <meta name="copyright" content={`${new Date().getFullYear()} RentalSite`} />
        </Helmet>
    );
};

export default SEO;