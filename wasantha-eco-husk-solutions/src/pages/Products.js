import API_BASE_URL, { assetUrl } from "../config/api";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Products.css";

const Products = () => {
  const navigate = useNavigate();
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
      <h2>Our Products</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder=" Search product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <label className="in-stock-checkbox">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          In Stock Only
        </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low Ã¢â€ â€™ High</option>
          <option value="price-desc">Price: High Ã¢â€ â€™ Low</option>
        </select>
      </div>

      <div className="category-tabs">
        {["all", "chips", "by-products"].map((cat) => (
          <button
            key={cat}
            className={`category-btn ${
              selectedCategory === cat ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "all"
              ? "All Products"
              : cat === "chips"
              ? "Coconut Husk Chips"
              : "Chips By-Products"}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="no-products">No products available.</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="product-card"
              onClick={() => navigate(`/product/${p.id}`)}
            >
              <img
                src={assetUrl(p.image_url)}
                alt={p.name}
              />
              <div className="product-info">
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p className="price">Rs. {parseFloat(p.price).toFixed(2)}</p>

                {p.category.toLowerCase().includes("chip") && (
                  <p className="bag-price"> Price (500g bag)</p>
                )}

                <span
                  className={`stock-label ${
                    p.stock > 0 ? "in-stock" : "out-stock"
                  }`}
                >
                  {p.stock > 0 ? " In Stock" : " Out of Stock"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
