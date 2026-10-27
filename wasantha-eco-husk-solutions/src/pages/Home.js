import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Package, Truck } from "lucide-react";
import API_BASE_URL, { assetUrl } from "../config/api";
import "../Styles/Home.css";

const PLACEHOLDER_IMAGE = "/images/product-placeholder.png";

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products/getFeaturedProducts.php`)
      .then((response) => response.json())
      .then((data) => setFeaturedProducts(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Featured products could not be loaded:", error));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/feedback/getAllFeedbacks.php`)
      .then((response) => response.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.feedbacks)) {
          setTestimonials(data.feedbacks.slice(0, 6));
        }
      })
      .catch((error) => console.error("Customer feedback could not be loaded:", error));
  }, []);

  const heroImage = useMemo(() => {
    try { return require("../assests/main.jpg"); } catch { return PLACEHOLDER_IMAGE; }
  }, []);

  return (
    <main className="home-page">
      <section className="hero-section" aria-labelledby="home-title">
        <div className="hero-overlay" />
        <img src={heroImage} alt="Coconut husk products and sustainable farming" />
        <div className="hero-text">
          <p className="hero-eyebrow">Sustainable solutions from Sri Lanka</p>
          <h1 id="home-title">Natural products for a greener future</h1>
          <p>Quality coconut husk products and healthy plants for homes, gardens, farms and businesses.</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-shop">Explore products</Link>
            <Link to="/about" className="btn-learn">About our company</Link>
          </div>
        </div>
      </section>

      <section className="features" aria-labelledby="why-us-title">
        <p className="section-eyebrow">Why choose us</p>
        <h2 id="why-us-title">Reliable products. Responsible choices.</h2>
        <p>We transform natural coconut by-products into practical, dependable solutions while supporting local communities and sustainable farming.</p>
        <div className="feature-grid">
          <article className="feature-card"><Leaf aria-hidden="true" /><h3>Made with nature in mind</h3><p>Useful coconut-based products that help reduce agricultural waste.</p></article>
          <article className="feature-card"><Package aria-hidden="true" /><h3>Consistent quality</h3><p>Carefully prepared and packed for dependable everyday use.</p></article>
          <article className="feature-card"><Truck aria-hidden="true" /><h3>Islandwide delivery</h3><p>Convenient delivery across Sri Lanka for every order.</p></article>
        </div>
      </section>

      <section className="featured-products" aria-labelledby="featured-title">
        <p className="section-eyebrow">Our selection</p>
        <h2 id="featured-title">Featured products</h2>
        <div className="product-grid polished">
          {featuredProducts.length ? featuredProducts.map((product) => (
            <article key={product.id} className="product-card polished">
              <div className="product-media"><img src={product.image_url ? assetUrl(product.image_url) : heroImage} alt={product.name} loading="lazy" /><Link to={`/product/${product.id}`} className="product-cta">View product</Link></div>
              <div className="product-info polished"><h3>{product.name}</h3></div>
            </article>
          )) : <p className="no-products">Our featured products will appear here soon.</p>}
        </div>
        <Link to="/products" className="section-link">View all products</Link>
      </section>

      <section className="testimonials polished" aria-labelledby="reviews-title">
        <p className="section-eyebrow">Customer feedback</p>
        <h2 id="reviews-title">Trusted by our customers</h2>
        <div className="testimonial-grid polished">
          {testimonials.length ? testimonials.map((testimonial) => (
            <figure className="testimonial-card polished" key={testimonial.id}><figcaption className="testimonial-name">{testimonial.user_name || "Our customer"}</figcaption><blockquote className="testimonial-quote no-avatar"><p>“{testimonial.message}”</p></blockquote></figure>
          )) : <p className="no-products">Customer reviews will appear here soon.</p>}
        </div>
      </section>

      <section className="cta-modern" aria-labelledby="cta-title">
        <div className="cta-container"><div className="cta-card">
          <p className="section-eyebrow">Start your sustainable journey</p>
          <h2 id="cta-title" className="cta-title">Choose better. Grow greener.</h2>
          <p className="cta-subtitle">Shop quality coconut husk products and plants from Wasantha Eco Husk Solutions.</p>
          <div className="cta-buttons"><Link to="/products" className="cta-btn cta-btn-shop">Shop now</Link><Link to="/contact" className="cta-btn cta-btn-contact">Contact us</Link></div>
        </div></div>
      </section>
    </main>
  );
};
