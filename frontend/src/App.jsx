import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Bell,
  LogOut,
  Search,
  Plus,
  RefreshCw,
  Check,
  X,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Inbox
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Configure Axios authorization interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const emptyProduct = { name: "", price: "", quantity: "", imageUrl: "" };
const emptySupplier = { name: "", contactName: "", email: "", phone: "", rating: 5, suppliedCategory: "Electronics" };

function App() {
  const [view, setView] = useState("login");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [user, setUser] = useState(null);
  
  // Forms
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "Staff" });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editForm, setEditForm] = useState({ id: "", name: "", price: "", quantity: "", imageUrl: "" });
  const [supplierForm, setSupplierForm] = useState(emptySupplier);
  const [orderForm, setOrderForm] = useState({ productId: "", quantity: 1, type: "Outbound" });

  // Data lists
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // UI states
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load session on startup
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setView("app");
        setActiveNav("dashboard");
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (view === "app") {
      fetchAllData();
    }
  }, [view]);

  const fetchAllData = async () => {
    fetchProducts();
    fetchOrders();
    fetchSuppliers();
    fetchPurchaseOrders();
    fetchAlerts();
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to load products");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Failed to load orders");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_URL}/suppliers`);
      setSuppliers(response.data.suppliers || []);
    } catch (error) {
      console.error("Failed to load suppliers");
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/procurement/orders`);
      setPurchaseOrders(response.data.orders || []);
    } catch (error) {
      console.error("Failed to load POs");
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_URL}/alerts`);
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error("Failed to load alerts");
    }
  };

  const handleAuth = async (endpoint) => {
    setMessage({ text: "", type: "" });
    try {
      const response = await axios.post(`${API_URL}/auth/${endpoint}`, authForm);
      if (endpoint === "register") {
        setMessage({ text: "Account registered successfully. Please sign in.", type: "success" });
        setView("login");
      } else {
        const { user, token } = response.data;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        setUser(user);
        setView("app");
        setActiveNav("dashboard");
      }
      setAuthForm({ name: "", email: "", password: "", role: "Staff" });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Authentication failed",
        type: "error"
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setView("login");
  };

  // Product CRUD
  const addProduct = async () => {
    try {
      await axios.post(`${API_URL}/products`, productForm);
      setProductForm(emptyProduct);
      setIsAddOpen(false);
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  const openEdit = (product) => {
    setEditForm({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      imageUrl: product.imageUrl || ""
    });
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API_URL}/products/${editForm.id}`, {
        name: editForm.name,
        price: editForm.price,
        quantity: editForm.quantity,
        imageUrl: editForm.imageUrl
      });
      setIsEditOpen(false);
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update product");
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product");
    }
  };

  // Order Operations
  const placeOrder = async () => {
    try {
      await axios.post(`${API_URL}/orders`, orderForm);
      setOrderForm({ productId: "", quantity: 1, type: "Outbound" });
      setIsOrderOpen(false);
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place order");
    }
  };

  // Supplier & PO Operations
  const addSupplier = async () => {
    try {
      await axios.post(`${API_URL}/suppliers`, supplierForm);
      setSupplierForm(emptySupplier);
      setIsAddSupplierOpen(false);
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add supplier");
    }
  };

  const updatePOStatus = async (poId, status) => {
    try {
      await axios.put(`${API_URL}/procurement/orders/${poId}`, { status });
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update PO status");
    }
  };

  // Alerts
  const markAlertRead = async (alertId) => {
    try {
      await axios.put(`${API_URL}/alerts/${alertId}/read`);
      fetchAlerts();
    } catch (error) {
      console.error(error);
    }
  };

  // Filters & Analytics
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, searchTerm]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalValue = products.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
      0
    );
    const lowStock = products.filter((item) => Number(item.quantity || 0) <= 5).length;
    return { totalProducts, totalStock, totalValue, lowStock };
  }, [products]);

  // Chart Data preparation
  const barChartData = useMemo(() => {
    return products.slice(0, 8).map((p) => ({
      name: p.name.length > 10 ? `${p.name.substring(0, 10)}...` : p.name,
      Stock: p.quantity,
      Value: Number((p.quantity * p.price).toFixed(2))
    }));
  }, [products]);

  const lineChartData = useMemo(() => {
    // Generate dummy historical trends based on orders
    return [
      { name: "Mon", Orders: 2 },
      { name: "Tue", Orders: 5 },
      { name: "Wed", Orders: 3 },
      { name: "Thu", Orders: orders.length },
      { name: "Fri", Orders: orders.length + 2 },
      { name: "Sat", Orders: orders.length + 1 },
      { name: "Sun", Orders: orders.length }
    ];
  }, [orders]);

  if (view === "login" || view === "register") {
    return (
      <div className="auth-shell">
        <div className="auth-hero">
          <div className="auth-brand">
            <div className="logo-icon">
              <Layers size={22} color="#fff" />
            </div>
            <span>WarehouseIQ Pro</span>
          </div>
          <h1>Autonomous stock operations at your fingertips.</h1>
          <p className="muted">
            Track inventories, orchestrate automated suppliers restocking, review logs, and leverage real-time analytical monitoring.
          </p>
          <div className="auth-highlights">
            <div className="highlight-box">
              <p className="highlight-label">Event-Driven Alerts</p>
              <p className="highlight-value">Broker Subscriptions</p>
            </div>
            <div className="highlight-box">
              <p className="highlight-label">Performance Cache</p>
              <p className="highlight-value">Redis Powered</p>
            </div>
          </div>
        </div>

        <div className="auth-container">
          <div className="auth-card">
            <h2>{view === "login" ? "Sign In" : "Register Workspace"}</h2>
            {message.text ? (
              <div className={`alert ${message.type}`}>{message.text}</div>
            ) : null}

            {view === "register" ? (
              <>
                <label>
                  Full Name
                  <input
                    type="text"
                    value={authForm.name}
                    placeholder="Enter full name"
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  />
                </label>
                <label>
                  Assign Role
                  <select
                    value={authForm.role}
                    onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                  >
                    <option value="Staff">Staff (View Only & Place Orders)</option>
                    <option value="Manager">Manager (Full Access)</option>
                  </select>
                </label>
              </>
            ) : null}

            <label>
              Email Address
              <input
                type="email"
                placeholder="you@warehouse.io"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </label>

            <button
              type="button"
              className="btn"
              onClick={() => handleAuth(view === "login" ? "login" : "register")}
            >
              {view === "login" ? "Continue" : "Create Workspace"}
            </button>

            <button
              type="button"
              className="link-button"
              onClick={() => {
                setMessage({ text: "", type: "" });
                setView(view === "login" ? "register" : "login");
              }}
            >
              {view === "login" ? "Create a workspace account" : "Back to Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <Layers size={20} color="#fff" />
          </div>
          <span className="logo-text">WarehouseIQ</span>
        </div>

        <nav className="nav">
          <button
            type="button"
            className={`nav-item ${activeNav === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveNav("dashboard")}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === "products" ? "active" : ""}`}
            onClick={() => setActiveNav("products")}
          >
            <Package size={18} />
            Inventory & Stock
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === "orders" ? "active" : ""}`}
            onClick={() => setActiveNav("orders")}
          >
            <ShoppingCart size={18} />
            Orders Journal
          </button>
          {user?.role !== "Staff" && (
            <>
              <button
                type="button"
                className={`nav-item ${activeNav === "suppliers" ? "active" : ""}`}
                onClick={() => setActiveNav("suppliers")}
              >
                <Truck size={18} />
                Procurement
              </button>
              <button
                type="button"
                className={`nav-item ${activeNav === "alerts" ? "active" : ""}`}
                onClick={() => setActiveNav("alerts")}
              >
                <Bell size={18} />
                Alert Inbox {alerts.filter((a) => !a.read).length > 0 && `(${alerts.filter((a) => !a.read).length})`}
              </button>
            </>
          )}
        </nav>

        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar">
              {user?.name?.substring(0, 2).toUpperCase() || "OP"}
            </div>
            <div className="profile-details">
              <p className="profile-name">{user?.name || "Operator"}</p>
              <span className="profile-role-badge">{user?.role || "Staff"}</span>
            </div>
          </div>
          <button type="button" className="btn ghost" onClick={handleLogout} style={{ justifyContent: "center" }}>
            <LogOut size={16} style={{ marginRight: 6 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="content">
        {/* VIEW 1: DASHBOARD */}
        {activeNav === "dashboard" && (
          <section>
            <header className="topbar">
              <div>
                <h1>Control Tower</h1>
                <p className="muted">Orchestrating services clusters activity & system indicators.</p>
              </div>
              <div>
                <button type="button" className="btn ghost" onClick={fetchAllData}>
                  <RefreshCw size={16} />
                  Sync Cluster
                </button>
              </div>
            </header>

            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">Indexed Products</p>
                <h3 className="stat-value">{stats.totalProducts}</h3>
                <div className="stat-icon-wrapper"><Package size={48} /></div>
              </div>
              <div className="stat-card">
                <p className="stat-label">Cumulative Stock</p>
                <h3 className="stat-value">{stats.totalStock}</h3>
                <div className="stat-icon-wrapper"><Layers size={48} /></div>
              </div>
              <div className="stat-card">
                <p className="stat-label">Asset Valuation</p>
                <h3 className="stat-value">${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className="stat-icon-wrapper"><ArrowUpRight size={48} /></div>
              </div>
              <div className="stat-card warning-style">
                <p className="stat-label">Critical Alerts</p>
                <h3 className="stat-value">{stats.lowStock}</h3>
                <div className="stat-icon-wrapper"><Shield size={48} /></div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="card">
                <h3 style={{ marginBottom: 20 }}>Stock Values Breakdown</h3>
                {barChartData.length > 0 ? (
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                        <Legend />
                        <Bar dataKey="Stock" fill="#818cf8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Value" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="empty">No products data available. Add products to view insights.</div>
                )}
              </div>

              <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                <h3 style={{ marginBottom: 20 }}>Recent Notifications</h3>
                <div style={{ flex: 1, overflowY: "auto", maxHeight: 300 }}>
                  {alerts.slice(0, 4).map((alert) => (
                    <div key={alert._id} className={`alert-item ${!alert.read ? "unread" : ""}`} style={{ padding: 12, marginBottom: 8 }}>
                      <div className="alert-info">
                        <span className="alert-title" style={{ fontSize: 13 }}>{alert.title}</span>
                        <span className="alert-message" style={{ fontSize: 11 }}>{alert.message}</span>
                      </div>
                      {!alert.read && (
                        <button type="button" className="btn ghost" onClick={() => markAlertRead(alert._id)} style={{ padding: 4 }}>
                          <Check size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {alerts.length === 0 && <div className="empty">No events logged.</div>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 2: PRODUCTS CATALOG */}
        {activeNav === "products" && (
          <section>
            <header className="topbar">
              <div>
                <h1>Inventory Catalog</h1>
                <p className="muted">Manage and update warehouse physical stock and prices.</p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {user?.role !== "Staff" && (
                  <button type="button" className="btn" onClick={() => setIsAddOpen(true)}>
                    <Plus size={16} />
                    New Product
                  </button>
                )}
              </div>
            </header>

            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  type="search"
                  placeholder="Search item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="button" className="btn ghost" onClick={fetchProducts}>
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="product-grid">
              {filteredProducts.map((p) => {
                const stockQty = Number(p.quantity || 0);
                const badgeClass = stockQty === 0 ? "out-of-stock" : stockQty <= 5 ? "low-stock" : "in-stock";
                const badgeText = stockQty === 0 ? "Out of Stock" : stockQty <= 5 ? "Low Stock" : "In Stock";
                
                return (
                  <div key={p.id} className="product-card" style={{ cursor: "pointer" }} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedProduct(p);
                    // Use setTimeout to prevent event from reaching overlay in same tick
                    setTimeout(() => setIsDetailsOpen(true), 0);
                  }}>
                    <div className="thumb">
                      <img
                        src={p.imageUrl || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80"}
                        alt={p.name}
                        loading="lazy"
                      />
                      <span className={`stock-badge ${badgeClass}`}>{badgeText}</span>
                    </div>
                    <div className="product-info">
                      <h4>{p.name}</h4>
                      <p className="price-tag">${Number(p.price).toFixed(2)}</p>
                      <p className="stock-info">Available Stock: {p.quantity} units</p>
                    </div>
                    {user?.role !== "Staff" && (
                      <div className="actions">
                        <button type="button" className="btn ghost" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>
                          Edit
                        </button>
                        <button type="button" className="btn danger" onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredProducts.length === 0 && <div className="empty">No products registered yet.</div>}
            </div>
          </section>
        )}

        {/* VIEW 3: ORDERS JOURNAL */}
        {activeNav === "orders" && (
          <section>
            <header className="topbar">
              <div>
                <h1>Orders Ledger</h1>
                <p className="muted">Log inbound stock items or process outbound warehouse fulfillments.</p>
              </div>
              <div>
                <button type="button" className="btn" onClick={() => setIsOrderOpen(true)}>
                  <ShoppingCart size={16} />
                  Place Order
                </button>
              </div>
            </header>

            <div className="card">
              <h3 style={{ marginBottom: 20 }}>Order History Logs</h3>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                      <th>Flow Direction</th>
                      <th>Status</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td style={{ fontWeight: 600 }}>{o.productName}</td>
                        <td>{o.quantity} units</td>
                        <td>${Number(o.price || 0).toFixed(2)}</td>
                        <td style={{ fontWeight: 700 }}>${(Number(o.price || 0) * o.quantity).toFixed(2)}</td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              color: o.type === "Inbound" ? "#34d399" : "#a855f7",
                              fontWeight: 600
                            }}
                          >
                            {o.type === "Inbound" ? (
                              <ArrowDownRight size={14} style={{ marginRight: 4 }} />
                            ) : (
                              <ArrowUpRight size={14} style={{ marginRight: 4 }} />
                            )}
                            {o.type}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span>
                        </td>
                        <td className="muted">{new Date(o.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: 30 }} className="muted">
                          No order logs recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 4: SUPPLIERS & PROCUREMENT */}
        {activeNav === "suppliers" && (
          <section>
            <header className="topbar">
              <div>
                <h1>Procurement Control</h1>
                <p className="muted">Register vendors and monitor autonomous supply chain restock cycles.</p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {user?.role !== "Staff" && (
                  <button type="button" className="btn" onClick={() => setIsAddSupplierOpen(true)}>
                    <Plus size={16} />
                    Add Supplier
                  </button>
                )}
              </div>
            </header>

            <div className="dashboard-grid">
              <div className="card">
                <h3 style={{ marginBottom: 20 }}>Auto-Generated Purchase Orders</h3>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Supplier</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrders.map((po) => (
                        <tr key={po._id}>
                          <td>{po.productName}</td>
                          <td>{po.quantity}</td>
                          <td>{po.supplierName}</td>
                          <td>
                            <span className={`badge ${po.status.toLowerCase()}`}>{po.status}</span>
                          </td>
                          <td>
                            {po.status === "Pending" && user?.role !== "Staff" && (
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  type="button"
                                  className="btn"
                                  onClick={() => updatePOStatus(po._id, "Completed")}
                                  style={{ padding: "6px 10px", fontSize: 12 }}
                                >
                                  Restock
                                </button>
                                <button
                                  type="button"
                                  className="btn danger"
                                  onClick={() => updatePOStatus(po._id, "Cancelled")}
                                  style={{ padding: "6px 10px", fontSize: 12 }}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                            {po.status !== "Pending" && <span className="muted">Closed</span>}
                          </td>
                        </tr>
                      ))}
                      {purchaseOrders.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", padding: 24 }} className="muted">
                            No active restocking purchase orders drafted.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: 20 }}>Suppliers Registry</h3>
                <div style={{ overflowY: "auto", maxHeight: 400 }}>
                  {suppliers.map((s) => (
                    <div key={s._id} style={{ borderBottom: "1px solid #222d3d", padding: "12px 0" }}>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</p>
                      <p className="muted" style={{ fontSize: 12 }}>Cat: {s.suppliedCategory} | Rating: {"★".repeat(s.rating)}</p>
                      <p className="muted" style={{ fontSize: 11 }}>Email: {s.email || "N/A"}</p>
                    </div>
                  ))}
                  {suppliers.length === 0 && <div className="empty">No vendors listed.</div>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 5: ALERTS INBOX */}
        {activeNav === "alerts" && (
          <section>
            <header className="topbar">
              <div>
                <h1>Alert & Logs Inbox</h1>
                <p className="muted">Detailed broker queue logs and system transactions.</p>
              </div>
              <div>
                <button type="button" className="btn ghost" onClick={fetchAlerts}>
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </header>

            <div className="card" style={{ maxWidth: 800 }}>
              {alerts.map((a) => (
                <div key={a._id} className={`alert-item ${!a.read ? "unread" : ""}`}>
                  <div className="alert-info">
                    <span className="alert-title">{a.title}</span>
                    <span className="alert-message">{a.message}</span>
                    <span className="alert-time">{new Date(a.timestamp).toLocaleString()}</span>
                  </div>
                  {!a.read && (
                    <button type="button" className="btn" onClick={() => markAlertRead(a._id)} style={{ padding: "6px 12px", fontSize: 13 }}>
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
              {alerts.length === 0 && (
                <div style={{ textAlign: "center", padding: 40 }} className="muted">
                  <Inbox size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p>All queues cleared. No logs recorded.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsAddOpen(false); }}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register New Inventory Item</h2>
              <button type="button" className="btn ghost" onClick={() => setIsAddOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <label>
                Item Name
                <input
                  type="text"
                  placeholder="e.g. Nvidia RTX 5090"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </label>
              <label>
                Unit Sale Price ($)
                <input
                  type="number"
                  placeholder="e.g. 1999"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                />
              </label>
              <label>
                Initial Stock Level
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={productForm.quantity}
                  onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                />
              </label>
              <label>
                Product Thumbnail Link
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setIsAddOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn" onClick={addProduct}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Place Order Modal */}
      {isOrderOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Deduct or Replenish Stock</h2>
              <button type="button" className="btn ghost" onClick={() => setIsOrderOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <label>
                Select Product
                <select
                  value={orderForm.productId}
                  onChange={(e) => setOrderForm({ ...orderForm, productId: e.target.value })}
                >
                  <option value="">-- Choose item --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantity to transact
                <input
                  type="number"
                  min="1"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })}
                />
              </label>
              <label>
                Order Direction
                <select
                  value={orderForm.type}
                  onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value })}
                >
                  <option value="Outbound">Outbound (Ship out / Sales shipment)</option>
                  <option value="Inbound">Inbound (Ship in / Internal refill)</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setIsOrderOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn" onClick={placeOrder} disabled={!orderForm.productId}>
                Transact Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Register New Vendor Partner</h2>
              <button type="button" className="btn ghost" onClick={() => setIsAddSupplierOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <label>
                Supplier / Business Name
                <input
                  type="text"
                  placeholder="e.g. Taiwan Semiconductors Inc"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                />
              </label>
              <label>
                Contact Agent Name
                <input
                  type="text"
                  placeholder="e.g. Morris Chang"
                  value={supplierForm.contactName}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                />
              </label>
              <label>
                Email Address
                <input
                  type="email"
                  placeholder="contact@tsmc.com"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                />
              </label>
              <label>
                Phone Number
                <input
                  type="text"
                  placeholder="e.g. +886-3-5781666"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                />
              </label>
              <label>
                Supplied Category
                <input
                  type="text"
                  placeholder="e.g. Electronics"
                  value={supplierForm.suppliedCategory}
                  onChange={(e) => setSupplierForm({ ...supplierForm, suppliedCategory: e.target.value })}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setIsAddSupplierOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn" onClick={addSupplier}>
                Add Partner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Modify Product</h2>
              <button type="button" className="btn ghost" onClick={() => setIsEditOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <label>
                Product Name
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </label>
              <label>
                Unit Price ($)
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </label>
              <label>
                Current Quantity
                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                />
              </label>
              <label>
                Image URL
                <input
                  type="url"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setIsEditOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn" onClick={saveEdit}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {isDetailsOpen && selectedProduct && (
        <div 
          className="modal-overlay" 
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsDetailsOpen(false);
            }
          }}
        >
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Product Details</h2>
              <button type="button" className="btn ghost" onClick={() => setIsDetailsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ alignItems: "center" }}>
              <div style={{ width: "100%", height: "240px", borderRadius: "12px", overflow: "hidden", marginBottom: "16px", backgroundColor: "#000" }}>
                <img 
                  src={selectedProduct.imageUrl || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80"} 
                  alt={selectedProduct.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>Product Name</span>
                  <span style={{ fontWeight: 600, fontSize: "16px" }}>{selectedProduct.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1e293b", paddingTop: "12px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>Unit Price</span>
                  <span style={{ fontWeight: 800, color: "#fff", fontSize: "18px" }}>${Number(selectedProduct.price).toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1e293b", paddingTop: "12px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>Stock Available</span>
                  <span style={{ fontWeight: 600, fontSize: "16px" }}>{selectedProduct.quantity} units</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setIsDetailsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
