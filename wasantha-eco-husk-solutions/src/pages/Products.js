import API_BASE_URL, { assetUrl } from "../config/api";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";
import "../Styles/Products.css";

const Products = () => {
  const { t } = usePreferences();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetch(
      `${API_BASE_URL}/products/getAllProducts.php`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
        else setProducts([]);
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products
    .filter((p) =>
      selectedCategory === "all"
        ? true
        : selectedCategory === "chips"
        ? p.category.toLowerCase().includes("chip")
        : p.category.toLowerCase().includes("by")
    )
    .filter((p) => (!inStockOnly ? true : parseInt(p.stock) > 0))
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(
      (p) =>
        (!minPrice || parseFloat(p.price) >= parseFloat(minPrice)) &&
        (!maxPrice || parseFloat(p.price) <= parseFloat(maxPrice))
    )
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

  return (
    <div className="products-page">
      <header className="products-header">
        <p className="products-eyebrow">{t("Wasantha Eco Husk Solutions")}</p>
        <h2>{t("Our Products")}</h2>
        <p>{t("Explore quality coconut husk products for your home, garden, and farm.")}</p>
      </header>

      <div className="filter-bar">
        <input
          type="text"
          aria-label={t("Search products")}
          placeholder={t("Search products...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="number"
          aria-label={t("Minimum price")}
          placeholder={t("Min price")}
          min="0"
          step="0.01"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          aria-label={t("Maximum price")}
          placeholder={t("Max price")}
          min="0"
          step="0.01"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <label className="in-stock-checkbox">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          {t("In Stock Only")}
        </label>
        <select
          aria-label={t("Sort products")}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">{t("Newest")}</option>
          <option value="price-asc">{t("Price: Low to High")}</option>
          <option value="price-desc">{t("Price: High to Low")}</option>
        </select>
      </div>

      <div className="category-tabs" aria-label={t("Product categories")}>
        {["all", "chips", "by-products"].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-btn ${
              selectedCategory === cat ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
            aria-pressed={selectedCategory === cat}
          >
            {cat === "all"
              ? t("All Products")
              : cat === "chips"
              ? t("Coconut Husk Chips")
              : t("Chips By-Products")}
          </button>
        ))}
      </div>

      {!loading && (
        <p className="products-count" aria-live="polite">
          {t("Showing")} <strong>{filteredProducts.length}</strong>{" "}
          {filteredProducts.length === 1 ? t("product") : t("products")}
        </p>
      )}

      {loading ? (
        <p className="products-status">{t("Loading products...")}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="products-status">{t("No products match your filters.")}</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) => (
            <Link
              key={p.id}
              className="product-card"
              to={`/product/${p.id}`}
            >
              <div className="product-image-wrap">
                <img src={assetUrl(p.image_url)} alt={p.name} loading="lazy" />
              </div>
              <div className="product-info">
                <h3>{p.name}</h3>
                <p className="desc">{p.description}</p>
                <p className="price">Rs. {parseFloat(p.price).toFixed(2)}</p>

                {p.category.toLowerCase().includes("chip") && (
                  <p className="bag-price">{t("Price (500g bag)")}</p>
                )}

                <span
                  className={`stock-label ${
                    p.stock > 0 ? "in-stock" : "out-stock"
                  }`}
                >
                  {p.stock > 0 ? t("In stock") : t("Out of stock")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
