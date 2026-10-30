import React, { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  Factory,
  Home,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Truck,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePreferences } from "../../contexts/PreferencesContext";
import "../../Styles/AdminStyle/AdminLayout.css";
import logo from "../../assests/icon.png";

const AdminNavbar = () => {
  const { t } = usePreferences();
  const [adminName, setAdminName] = useState("Admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "null");
      setAdminName(user?.name || user?.first_name || user?.firstName || "Admin");
    } catch (error) {
      console.error("Invalid session user:", error);
      setAdminName("Admin");
    }
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { label: t("Overview"), to: "/admin/dashboard", icon: LayoutDashboard, end: true },
    { label: t("Orders"), to: "/admin/order", icon: ClipboardList },
    { label: t("Products"), to: "/admin/products", icon: Package, match: "/admin/products" },
    { label: t("Coconut Husk"), to: "/admin/huskList", icon: Leaf },
    {
      label: t("Delivery Persons Management"),
      to: "/admin/delivery-persons",
      icon: Truck,
    },
    {
      label: t("Feedbacks and Inquiries"),
      to: "/admin/feedbacks",
      icon: MessageSquare,
    },
    { label: t("Reports"), to: "/admin/reports", icon: BarChart3, match: "/admin/reports" },
    {
      label: t("Add Daily Husk Cutting"),
      to: "/admin/husk-production-entry",
      icon: Factory,
    },
  ];

  const currentPage = navItems.find(
    (item) =>
      location.pathname === item.to ||
      (item.match && location.pathname.startsWith(item.match))
  );

  return (
    <div className="admin-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-scrim"
          aria-label={t("Close navigation")}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`admin-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <Link
          to="/admin/dashboard"
          className="admin-brand"
          onClick={() => setSidebarOpen(false)}
        >
          <img src={logo} alt="" />
          <span>
            <strong>Wasantha Eco Husk</strong>
            <small>{t("Admin workspace")}</small>
          </span>
        </Link>

        <p className="admin-nav-label">{t("Workspace")}</p>
        <nav className="admin-nav" aria-label={t("Admin navigation")}>
          {navItems.map(({ label, to, icon: Icon, end, match }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `admin-nav-link${isActive || (match && location.pathname.startsWith(match)) ? " active" : ""}`
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-store-link">
            <Home size={17} aria-hidden="true" />
            <span>{t("View Store")}</span>
          </Link>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            <LogOut size={17} aria-hidden="true" />
            <span>{t("Log out")}</span>
          </button>
        </div>
      </aside>

      <div className="admin-shell-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-toggle"
            aria-label={t(sidebarOpen ? "Close navigation" : "Open navigation")}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="admin-breadcrumb">
            <span>{t("Admin workspace")}</span>
            <strong>{currentPage?.label || t("Admin Dashboard")}</strong>
          </div>
          <div className="admin-user">
            <span className="admin-user-avatar">{adminName.charAt(0).toUpperCase()}</span>
            <span>
              <small>{t("Signed in as")}</small>
              <strong>{adminName}</strong>
            </span>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminNavbar;
