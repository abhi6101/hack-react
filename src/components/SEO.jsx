import { useEffect } from 'react';

/**
 * SEO Component - Add meta tags to any page
 * Usage: <SEO title="Page Title" description="Page description" keywords="keyword1, keyword2" />
 */
const SEO = ({
    title = "Hack2Hired | Placement Portal",
    description = "Your gateway to top-tier job placements, resume mastery, and interview excellence. Prepare for placements with jobs, resume builder, interview prep, and more.",
    keywords = "placement portal, job portal, resume builder, interview preparation, campus placement, job search, career guidance",
    ogImage = "/images/og-image.jpg",
    url = "https://hack-2-hired.onrender.com"
}) => {
    useEffect(() => {
        // Update title
        document.title = title;

        // Update or create meta tags
        const updateMetaTag = (name, content, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${name}"]`);

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }

            element.setAttribute('content', content);
        };

        // Standard meta tags
        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);
        updateMetaTag('author', 'Hack2Hired Team');
        updateMetaTag('robots', 'index, follow');

        // Open Graph tags (for social media)
        updateMetaTag('og:title', title, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:image', ogImage, true);
        updateMetaTag('og:url', url, true);
        updateMetaTag('og:type', 'website', true);
        updateMetaTag('og:site_name', 'Hack2Hired', true);

        // Twitter Card tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', ogImage);

        // Additional SEO tags
        updateMetaTag('theme-color', '#4F46E5');
        updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    }, [title, description, keywords, ogImage, url]);

    return null; // This component doesn't render anything
};

export default SEO;
