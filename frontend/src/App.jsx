import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const emptyProduct = { name: "", price: "", quantity: "", imageUrl: "" };

function App() {
  const [view, setView] = useState("login");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    price: "",
    quantity: "",
    imageUrl: ""
  });
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (view === "products") {
      fetchProducts();
    }
  }, [view]);

  const fetchProducts = async () => {
    setMessage({ text: "", type: "" });
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.products || []);
    } catch (error) {
      setMessage({ text: "Failed to load products", type: "error" });
    }
  };

  const handleAuth = async (endpoint) => {
    setMessage({ text: "", type: "" });
    try {
      const response = await axios.post(`${API_URL}/auth/${endpoint}`, authForm);

      if (endpoint === "register") {
        setMessage({ text: "Account created successfully. Please sign in.", type: "success" });
        setView("login");
      } else {
        setUser(response.data.user);
        setView("products");
        setActiveNav("products");
      }

      setAuthForm({ name: "", email: "", password: "" });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Request failed",
        type: "error"
      });
    }
  };

  const addProduct = async () => {
    setMessage({ text: "", type: "" });
    try {
      await axios.post(`${API_URL}/products`, productForm);
      setProductForm(emptyProduct);
      setIsAddOpen(false);
      fetchProducts();
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to add product",
        type: "error"
      });
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
    setView("edit");
  };

  const saveEdit = async () => {
    setMessage({ text: "", type: "" });
    try {
      await axios.put(`${API_URL}/products/${editForm.id}`, {
        name: editForm.name,
        price: editForm.price,
        quantity: editForm.quantity,
        imageUrl: editForm.imageUrl
      });
      setView("products");
      fetchProducts();
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to update product",
        type: "error"
      });
    }
  };

  const deleteProduct = async (productId) => {
    setMessage({ text: "", type: "" });
    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      fetchProducts();
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to delete product",
        type: "error"
      });
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    const term = searchTerm.toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(term));
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

  if (view === "login" || view === "register") {
    return (
      <div className="auth-shell">
        <div className="auth-hero">
          <div className="auth-brand">WarehouseIQ</div>
          <h1>Inventory operations, always in sync.</h1>
          <p className="muted">
            Track stock levels, monitor fast movers, and keep warehouse teams aligned from a
            single dashboard.
          </p>
          <div className="auth-highlights">
            <div>
              <p className="highlight-label">Realtime stock</p>
              <p className="highlight-value">24/7 visibility</p>
            </div>
            <div>
              <p className="highlight-label">Low stock alerts</p>
              <p className="highlight-value">Never miss a reorder</p>
            </div>
          </div>
        </div>
        <div className="auth-card">
          <h2>{view === "login" ? "Welcome back" : "Create your workspace"}</h2>
          {message.text ? (
            <div className={`alert ${message.type}`}>{message.text}</div>
          ) : null}
          {view === "register" ? (
            <label>
              Full name
              <input
                type="text"
                value={authForm.name}
                onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
              />
            </label>
          ) : null}
          <label>
            Email
            <input
              type="email"
              value={authForm.email}
              onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
            />
          </label>
          <button
            type="button"
            onClick={() => handleAuth(view === "login" ? "login" : "register")}
          >
            {view === "login" ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => setView(view === "login" ? "register" : "login")}
          >
            {view === "login" ? "Need an account? Register" : "Already registered? Sign in"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">Inventory System</div>
        <nav className="nav">
          <button
            type="button"
            className={`nav-item ${activeNav === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("dashboard");
              setView("products");
            }}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === "products" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("products");
              setView("products");
            }}
          >
            Products
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === "add" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("add");
              setIsAddOpen(true);
            }}
          >
            Add Item
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === "reports" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("reports");
              setView("reports");
            }}
          >
            Reports
          </button>
        </nav>
        <div className="profile-card">
          <div>
            <p className="profile-name">{user?.name || "Manager"}</p>
            <p className="muted">admin@warehouse.io</p>
          </div>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setUser(null);
              setView("login");
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="content">
        {view === "reports" ? (
          <section className="reports-card">
            <h1>Reports</h1>
            <p className="muted">Insights for DevOps inventory readiness and warehouse flow.</p>
            <div className="reports-grid">
              <div className="report-tile">
                <h3>Weekly movement</h3>
                <p className="muted">Track inbound and outbound volume.</p>
              </div>
              <div className="report-tile">
                <h3>Critical items</h3>
                <p className="muted">Identify low stock risk early.</p>
              </div>
              <div className="report-tile">
                <h3>Service coverage</h3>
                <p className="muted">Align inventory with service SLAs.</p>
              </div>
            </div>
          </section>
        ) : (
          <>
            <header className="topbar">
              <div>
                <h1>Products</h1>
                <p className="muted">Track stock movement and update warehouse inventory.</p>
              </div>
              <div className="topbar-actions">
                <button type="button" onClick={() => setIsAddOpen(true)}>
                  + Add new item
                </button>
              </div>
            </header>

            {message.text ? (
              <div className={`alert ${message.type}`}>{message.text}</div>
            ) : null}

          <section className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total products</p>
            <h3>{stats.totalProducts}</h3>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total stock</p>
            <h3>{stats.totalStock}</h3>
          </div>
          <div className="stat-card">
            <p className="stat-label">Inventory value</p>
            <h3>${stats.totalValue.toFixed(2)}</h3>
          </div>
          <div className="stat-card warning">
            <p className="stat-label">Low stock</p>
            <h3>{stats.lowStock}</h3>
          </div>
        </section>

          <section className="table-card">
          <div className="table-toolbar">
            <div className="search-box">
              <input
                type="search"
                placeholder="Search products"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="table-actions">
              <button type="button" className="ghost" onClick={fetchProducts}>Refresh</button>
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.length === 0 ? (
              <div className="empty">No products yet.</div>
            ) : (
              filteredProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <div className="thumb">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80"}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="muted">Price: ${product.price}</p>
                    <p className="muted">Stock: {product.quantity}</p>
                  </div>
                  <div className="actions">
                    <button type="button" className="ghost" onClick={() => openEdit(product)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteProduct(product.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
            </section>
          </>
        )}
      </main>

      {isAddOpen ? (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add product</h2>
              <button type="button" className="ghost" onClick={() => setIsAddOpen(false)}>
                Close
              </button>
            </div>
            <div className="modal-body">
              <label>
                Name
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                />
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  value={productForm.quantity}
                  onChange={(event) => setProductForm({ ...productForm, quantity: event.target.value })}
                />
              </label>
              <label>
                Image URL
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(event) =>
                    setProductForm({ ...productForm, imageUrl: event.target.value })
                  }
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={addProduct}>Save</button>
              <button type="button" className="ghost" onClick={() => setIsAddOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {view === "edit" ? (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit product</h2>
              <button type="button" className="ghost" onClick={() => setView("products")}>
                Close
              </button>
            </div>
            <div className="modal-body">
              <label>
                Name
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(event) => setEditForm({ ...editForm, price: event.target.value })}
                />
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={(event) => setEditForm({ ...editForm, quantity: event.target.value })}
                />
              </label>
              <label>
                Image URL
                <input
                  type="url"
                  value={editForm.imageUrl}
                  onChange={(event) => setEditForm({ ...editForm, imageUrl: event.target.value })}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={saveEdit}>Save changes</button>
              <button type="button" className="ghost" onClick={() => setView("products")}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
