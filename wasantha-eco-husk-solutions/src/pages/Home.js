import API_BASE_URL, { assetUrl } from "../config/api";

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Leaf, Package, Truck } from "lucide-react";
import "../Styles/Home.css";


const PLACEHOLDER_AVATAR = "/mnt/data/f18dc0f1-0d55-46af-976c-485b1342d27e.png";

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch(
      `${API_BASE_URL}/products/getFeaturedProducts.php`
    )
      .then((res) => res.json())
      .then((data) => setFeaturedProducts(data))
      .catch((err) => console.error("Error fetching featured products:", err));
  }, []);

  useEffect(() => {
    fetch(
      `${API_BASE_URL}/feedback/getAllFeedbacks.php`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.feedbacks)) {
          setTestimonials(data.feedbacks);
        } else {
          console.warn("No testimonials or invalid response", data);
        }
      })
      .catch((err) => console.error("Error fetching testimonials:", err));
  }, []);

  const heroSrc = useMemo(() => {
    try {
      return require("../assests/main.jpg");
    } catch {
      return PLACEHOLDER_AVATAR;
    }
  }, []);

  return (
    <div className="home-page">

      <div className="hero-section">
        <div className="hero-overlay" />
        <img src={heroSrc} alt="Coconut Farm" loading="lazy" />
        <div className="hero-text">
          <h1>Empowering Green Growth in Sri Lanka</h1>
          <p>
            Sustainable coconut husk products and coconut plants, supporting
            eco-friendly farming and rural livelihoods.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-shop">
              Shop Now
            </Link>
            <Link to="/about" className="btn-learn">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      <div className="features">
        <h2>Why Choose Wasantha Eco Husk Solutions?</h2>
        <p>
          WeÃ¢â‚¬â„¢re committed to sustainability, fair trade, and top-quality
          coconut-based products.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <Leaf className="h-10 w-10 text-green-700" />
            <h3>Eco-Friendly Production</h3>
            <p>
              Our husk and plant products are made from natural coconut
              by-products Ã¢â‚¬â€ reducing waste and improving soil health.
            </p>
          </div>

          <div className="feature-card">
            <Package className="h-10 w-10 text-green-700" />
            <h3>High Quality Standards</h3>
            <p>
              Every product is inspected and packed with care to ensure
              consistent quality for farmers and home gardeners alike.
            </p>
          </div>

          <div className="feature-card">
            <Truck className="h-10 w-10 text-green-700" />
            <h3>Islandwide Delivery</h3>
            <p>
              We deliver throughout Sri Lanka with affordable and reliable
              shipping options.
            </p>
          </div>
        </div>
      </div>


      <div className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-grid polished">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <div key={product.id} className="product-card polished">
                <div className="product-media">
                  <img
                    src={
                      product.image_url
                        ? assetUrl(product.image_url)
                        : PLACEHOLDER_AVATAR
                    }
                    alt={product.name}
                    loading="lazy"
                  />
                  <Link to={`/product/${product.id}`} className="product-cta">
                    View
                  </Link>
                </div>

                <div className="product-info polished">
                  <h3>{product.name}</h3>
           
                </div>
              </div>
            ))
          ) : (
            <p className="no-products">No featured products available yet.</p>
          )}
        </div>
      </div>

   
      <div className="testimonials polished">
        <h2>What Our Customers Say</h2>

        <div className="testimonial-grid polished">
          {testimonials.length > 0 ? (
            testimonials.map((t) => (
              <figure className="testimonial-card polished" key={t.id}>
                <div className="testimonial-top no-avatar">
                  <figcaption className="testimonial-meta">
                    <strong className="testimonial-name">{t.user_name}</strong>
                  </figcaption>
                </div>

                <blockquote className="testimonial-quote no-avatar">
                  <p>Ã¢â‚¬Å“{t.message}Ã¢â‚¬Â</p>
                </blockquote>
              </figure>
            ))
          ) : (
            <p className="no-products">
              No testimonials yet Ã¢â‚¬â€ be the first to review!
            </p>
          )}
        </div>
      </div>

      
      <section className="cta-modern">
        <div className="cta-wave-top">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,160L60,170.7C120,181,240,203,360,186.7C480,171,600,117,720,101.3C840,85,960,107,1080,133.3C1200,160,1320,192,1380,208L1440,224L1440,0L0,0Z"
            />
          </svg>
        </div>
        <div className="cta-container">
          <div className="cta-card">
            <h2 className="cta-title fade-in">
              LetÃ¢â‚¬â„¢s Build a Greener Tomorrow Together Ã°Å¸Å’Â´
            </h2>
            <p className="cta-subtitle fade-in">
              Support sustainable coconut farming in Sri Lanka Ã¢â‚¬â€ purchase
              eco-friendly husk products and plants directly from the source.
            </p>
            <div className="cta-buttons fade-in">
              <Link to="/products" className="cta-btn cta-btn-shop">
                Explore Products
              </Link>
              <Link to="/contact" className="cta-btn cta-btn-contact">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        <div className="cta-wave-bottom">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,96L60,106.7C120,117,240,139,360,144C480,149,600,139,720,122.7C840,107,960,85,1080,85.3C1200,85,1320,107,1380,117.3L1440,128L1440,320L0,320Z"
            />
          </svg>
        </div>
      </section>
    </div>
  );
};
