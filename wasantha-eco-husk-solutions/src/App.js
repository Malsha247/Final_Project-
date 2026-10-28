import React from "react";
import Navbar from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Admin/Dashboard";
import AdminNavbar from "./components/Admin/adminNavbar";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/Admin/AdminOrders";
import ProductDetails from "./pages/ProductDetails";
import Sell from "./pages/Sell";
import SellHusk from "./pages/huskSell";
import Profile from "./pages/Profile";
import Husklist from "./pages/Admin/huskList";
import MyHuskList from "./pages/MyHuskSales";
import EditProfile from "./pages/EditProfile";
import ContactUs from "./pages/Contact";
import AdminFeedbacks from "./pages/Admin/AdminFeedbacks";
import AdminReports from "./pages/Admin/Reports";
import OrdersReport from "./pages/Admin/Reports/OrdersReport";
import SellPlant from "./pages/SellPlant";
import Plnatdetails from "./pages/PlantDetails";
import Plant from "./pages/Plants";
import MyRequests from "./pages/MyRequests";
import DeliveryDashboard from "./pages/Delivery/Dashboard";
import DeliveryPersons from "./pages/Admin/DeliveryPersons";
import CustomersReport from "./pages/Admin/Reports/CustomersReport";
import StocksReport from "./pages/Admin/Reports/StocksReport";
import HuskProductionReport from "./pages/Admin/Reports/HuskProductionReport";
import AboutUs from "./pages/About";

import ProductList from "./pages/Admin/ProductList";
import AddProductPage from "./pages/Admin/AddProductPage";
import EditProductPage from "./pages/Admin/EditProductPage";
import HuskProductionEntry from "./pages/Admin/HuskProductionEntry";

import "./App.css";
import { PreferenceControls } from "./contexts/PreferencesContext";

const App = () => {
  const location = useLocation();

  /* ================= ADMIN / DELIVERY CHECK ================= */
  const isAdminRoute =
    location.pathname.toLowerCase().includes("/admin") ||
    location.pathname.toLowerCase().includes("/delivery");

  const hideLayoutRoutes = ["/login", "/register"];
  const shouldHideCustomerLayout = hideLayoutRoutes.includes(location.pathname);

  // Chatbase is loaded once by public/index.html.

  return (
    <>
      {(shouldHideCustomerLayout || isAdminRoute) && (
        <div className="preferences-floating">
          <PreferenceControls />
        </div>
      )}
      {/* ===== Customer Navbar ===== */}
      {!shouldHideCustomerLayout && !isAdminRoute && <Navbar />}

      <Routes>
        {/* ===== Customer Routes ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/sell-husk" element={<SellHusk />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/MyHuskSales" element={<MyHuskList />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/sell-plant" element={<SellPlant />} />
        <Route path="/plants" element={<Plant />} />
        <Route path="/plant/:id" element={<Plnatdetails />} />
        <Route path="/my-requests" element={<MyRequests />} />

        {/* ===== Admin Reports ===== */}
        <Route
          path="/admin/reports/customers"
          element={<><AdminNavbar /><CustomersReport /></>}
        />
        <Route
          path="/admin/reports/stocks"
          element={<><AdminNavbar /><StocksReport /></>}
        />
        <Route
          path="/admin/reports/husk-production"
          element={<><AdminNavbar /><HuskProductionReport /></>}
        />
        <Route
          path="/admin/reports/orders"
          element={<><AdminNavbar /><OrdersReport /></>}
        />

        {/* ===== Admin Routes ===== */}
        <Route
          path="/admin/dashboard"
          element={
            <>
              <AdminNavbar />
              <Dashboard />
            </>
          }
        />

        <Route
          path="/admin/products"
          element={
            <>
              <AdminNavbar />
              <ProductList />
            </>
          }
        />

        <Route
          path="/admin/products/add"
          element={
            <>
              <AdminNavbar />
              <AddProductPage />
            </>
          }
        />

        <Route
          path="/admin/products/edit/:id"
          element={
            <>
              <AdminNavbar />
              <EditProductPage />
            </>
          }
        />

        <Route
          path="/admin/order"
          element={
            <>
              <AdminNavbar />
              <AdminOrders />
            </>
          }
        />

        <Route
          path="/admin/huskList"
          element={
            <>
              <AdminNavbar />
              <Husklist />
            </>
          }
        />

        <Route
          path="/admin/feedbacks"
          element={
            <>
              <AdminNavbar />
              <AdminFeedbacks />
            </>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <>
              <AdminNavbar />
              <AdminReports />
            </>
          }
        />

        <Route
          path="/admin/husk-production-entry"
          element={<><AdminNavbar /><HuskProductionEntry /></>}
        />

        <Route
          path="/admin/delivery-persons"
          element={<><AdminNavbar /><DeliveryPersons /></>}
        />

        {/* ===== Delivery ===== */}
        <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
      </Routes>

      {/* ===== Customer Footer ===== */}
      {!shouldHideCustomerLayout && !isAdminRoute && <Footer />}
    </>
  );
};

export default App;
