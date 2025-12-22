import React, { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api";

// Small inline SVG icon helpers (no extra deps)
const Icon = {
  Users: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Leaf: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 4 13C4 6 11 3 11 3s7 3 7 10a7 7 0 0 1-7 7z" />
      <path d="M11 3v17" />
    </svg>
  ),
  Box: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  ),
  Pencil: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  Trash: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  ),
  Plus: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  ),
  Search: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Logout: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px 18px",
    backgroundImage:
      "linear-gradient(rgba(245, 247, 250, 0.92), rgba(245, 247, 250, 0.92)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=60')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  container: {
    maxWidth: 1150,
    margin: "0 auto",
  },
  hero: {
    borderRadius: 16,
    padding: "18px 18px",
    background:
      "linear-gradient(135deg, rgba(46, 204, 113, 0.18), rgba(52, 152, 219, 0.15))",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "flex",
    gap: 14,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  heroTitle: { margin: 0, fontSize: 22, fontWeight: 800, color: "#1f2937" },
  heroSub: { margin: "6px 0 0", color: "#4b5563", maxWidth: 740 },
  heroPill: {
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(0,0,0,0.08)",
    fontWeight: 700,
    color: "#111827",
  },
  topBar: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap" },
  tabBtn: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.10)",
    background: active ? "#1f2937" : "rgba(255,255,255,0.85)",
    color: active ? "#fff" : "#111827",
    cursor: "pointer",
    fontWeight: 800,
  }),
  card: {
    marginTop: 14,
    borderRadius: 16,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "14px 14px",
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 10px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "#fff",
    minWidth: 260,
  },
  input: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: 14,
  },
  btn: (variant = "primary") => {
    const base = {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 12px",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 800,
      border: "1px solid rgba(0,0,0,0.10)",
    };
    if (variant === "primary") return { ...base, background: "#2ecc71", color: "#fff" };
    if (variant === "danger") return { ...base, background: "#e74c3c", color: "#fff" };
    if (variant === "ghost") return { ...base, background: "rgba(255,255,255,0.8)", color: "#111827" };
    return { ...base, background: "#111827", color: "#fff" };
  },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: 12,
    color: "#6b7280",
    background: "rgba(17,24,39,0.03)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    verticalAlign: "middle",
    color: "#111827",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  badge: (tone = "neutral") => {
    const tones = {
      neutral: { bg: "rgba(17,24,39,0.06)", fg: "#111827" },
      green: { bg: "rgba(46, 204, 113, 0.16)", fg: "#1f7a43" },
      blue: { bg: "rgba(52, 152, 219, 0.16)", fg: "#1f5f86" },
      red: { bg: "rgba(231, 76, 60, 0.14)", fg: "#9b2d23" },
    };
    const t = tones[tone] || tones.neutral;
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      background: t.bg,
      color: t.fg,
      fontWeight: 800,
      fontSize: 12,
      border: "1px solid rgba(0,0,0,0.06)",
    };
  },
  actions: { display: "flex", gap: 8, justifyContent: "flex-end" },
  iconBtn: (tone) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 10px",
    borderRadius: 12,
    cursor: "pointer",
    border: "1px solid rgba(0,0,0,0.10)",
    background: tone === "danger" ? "rgba(231, 76, 60, 0.12)" : "rgba(17,24,39,0.05)",
    color: tone === "danger" ? "#c0392b" : "#111827",
    fontWeight: 900,
  }),
  footer: {
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  pager: { display: "flex", gap: 8, alignItems: "center" },
  small: { color: "#6b7280", fontSize: 12 },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 2000,
  },
  modal: {
    width: "100%",
    maxWidth: 560,
    borderRadius: 16,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "14px 14px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  modalBody: { padding: "14px 14px", display: "grid", gap: 10 },
  fieldRow: { display: "grid", gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: "#4b5563" },
  inputBox: {
    border: "1px solid rgba(0,0,0,0.14)",
    borderRadius: 12,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },
  modalFooter: {
    padding: "14px 14px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
};

function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function prettyDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return String(d);
  }
}

function Confirm({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button onClick={onCancel} style={styles.iconBtn()} aria-label="Close">
            ✕
          </button>
        </div>
        <div style={styles.modalBody}>
          <div style={{ color: "#374151" }}>{message}</div>
        </div>
        <div style={styles.modalFooter}>
          <button onClick={onCancel} style={styles.btn("ghost")}>
            Cancel
          </button>
          <button onClick={onConfirm} style={styles.btn("danger")}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ open, title, fields, form, setForm, onClose, onSave }) {
  if (!open) return null;
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 950 }}>{title}</span>
          </div>
          <button onClick={onClose} style={styles.iconBtn()} aria-label="Close">
            ✕
          </button>
        </div>
        <div style={styles.modalBody}>
          {fields.map((f) => (
            <div key={f.key} style={styles.fieldRow}>
              <div style={styles.label}>{f.label}</div>
              {f.type === "select" ? (
                <select
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  style={styles.inputBox}
                >
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  style={{ ...styles.inputBox, minHeight: 90, resize: "vertical" }}
                />
              ) : (
                <input
                  type={f.type || "text"}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  style={styles.inputBox}
                />
              )}
            </div>
          ))}
        </div>
        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.btn("ghost")}>
            Cancel
          </button>
          <button onClick={onSave} style={styles.btn("primary")}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel({ user, onLogout }) {
  const token = localStorage.getItem("authToken");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const [tab, setTab] = useState("users");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [products, setProducts] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // edit / create
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editFields, setEditFields] = useState([]);
  const [editForm, setEditForm] = useState({});
  const [editMeta, setEditMeta] = useState({ kind: "", id: null });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMeta, setConfirmMeta] = useState({ kind: "", id: null });

  // ---------------- LOADERS ----------------
  const loadUsers = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const r = await fetch(`${API}/admin/users`, { headers });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed to load users");
      setUsers(d.users || []);
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const loadCrops = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const r = await fetch(`${API}/admin/crops`, { headers });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed to load crops");
      setCrops(d.crops || []);
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const r = await fetch(`${API}/admin/products`, { headers });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed to load products");
      setProducts(d.products || []);
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setQuery("");
    if (tab === "users") loadUsers();
    if (tab === "crops") loadCrops();
    if (tab === "products") loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ---------------- FILTERED DATA ----------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      if (tab === "users") return users;
      if (tab === "crops") return crops;
      return products;
    }
    const list = tab === "users" ? users : tab === "crops" ? crops : products;
    return list.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [tab, users, crops, products, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => paginate(filtered, currentPage, pageSize), [filtered, currentPage]);

  // ---------------- ACTIONS ----------------
  const openEdit = (kind, row) => {
    setStatus({ type: "", message: "" });
    if (kind === "user") {
      setEditTitle("Edit User");
      setEditFields([
        { key: "username", label: "Username" },
        { key: "email", label: "Email" },
        {
          key: "role",
          label: "Role",
          type: "select",
          options: [
            { value: "farmer", label: "farmer" },
            { value: "admin", label: "admin" },
          ],
        },
      ]);
      setEditForm({ username: row.username, email: row.email, role: row.role });
      setEditMeta({ kind, id: row.user_id });
    }
    if (kind === "crop") {
      setEditTitle("Edit Crop");
      setEditFields([
        { key: "crop_name", label: "Crop Name" },
        { key: "optimal_N", label: "Optimal N", type: "number" },
        { key: "optimal_P", label: "Optimal P", type: "number" },
        { key: "optimal_K", label: "Optimal K", type: "number" },
      ]);
      setEditForm({
        crop_name: row.crop_name,
        optimal_N: row.optimal_N,
        optimal_P: row.optimal_P,
        optimal_K: row.optimal_K,
      });
      setEditMeta({ kind, id: row.crop_id });
    }
    if (kind === "product") {
      setEditTitle(row.product_id ? "Edit Product" : "Add Product");
      setEditFields([
        { key: "name", label: "Product Name" },
        { key: "category", label: "Category" },
        { key: "price", label: "Price (£)", type: "number" },
        { key: "stock", label: "Stock", type: "number" },
        { key: "description", label: "Description", type: "textarea" },
      ]);
      setEditForm({
        name: row.name || "",
        category: row.category || "",
        price: row.price ?? 0,
        stock: row.stock ?? 0,
        description: row.description || "",
      });
      setEditMeta({ kind, id: row.product_id || null });
    }
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      setStatus({ type: "", message: "" });

      if (editMeta.kind === "user") {
        const r = await fetch(`${API}/admin/users/${editMeta.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(editForm),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || "Failed to update user");
        setStatus({ type: "success", message: "User updated successfully." });
        await loadUsers();
      }

      if (editMeta.kind === "crop") {
        const r = await fetch(`${API}/admin/crops/${editMeta.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(editForm),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || "Failed to update crop");
        setStatus({ type: "success", message: "Crop updated successfully." });
        await loadCrops();
      }

      if (editMeta.kind === "product") {
        if (editMeta.id) {
          const r = await fetch(`${API}/admin/products/${editMeta.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(editForm),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.message || "Failed to update product");
          setStatus({ type: "success", message: "Product updated successfully." });
        } else {
          const r = await fetch(`${API}/admin/products`, {
            method: "POST",
            headers,
            body: JSON.stringify(editForm),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.message || "Failed to add product");
          setStatus({ type: "success", message: "Product added successfully." });
        }
        await loadProducts();
      }

      setEditOpen(false);
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (kind, id) => {
    setConfirmMeta({ kind, id });
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      setStatus({ type: "", message: "" });

      if (confirmMeta.kind === "user") {
        const r = await fetch(`${API}/admin/users/${confirmMeta.id}`, { method: "DELETE", headers });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || "Failed to delete user");
        setStatus({ type: "success", message: "User deleted." });
        await loadUsers();
      }
      if (confirmMeta.kind === "crop") {
        const r = await fetch(`${API}/admin/crops/${confirmMeta.id}`, { method: "DELETE", headers });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || "Failed to delete crop");
        setStatus({ type: "success", message: "Crop deleted." });
        await loadCrops();
      }
      if (confirmMeta.kind === "product") {
        const r = await fetch(`${API}/admin/products/${confirmMeta.id}`, { method: "DELETE", headers });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || "Failed to delete product");
        setStatus({ type: "success", message: "Product deleted." });
        await loadProducts();
      }
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const TabBtn = ({ id, label, icon: I, count }) => (
    <button
      onClick={() => setTab(id)}
      style={styles.tabBtn(tab === id)}
      aria-pressed={tab === id}
      type="button"
    >
      <I />
      <span>{label}</span>
      <span style={styles.badge(tab === id ? "blue" : "neutral")}>{count}</span>
    </button>
  );

  const title = tab === "users" ? "Users" : tab === "crops" ? "Crops" : "Products";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <div>
            <h2 style={styles.heroTitle}>Admin Dashboard</h2>
            <p style={styles.heroSub}>
              Manage <b>users</b>, <b>crop master data</b>, and <b>product catalogue</b> in one place. Role-Based Access
              Control (RBAC) ensures only admins can access this panel.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <span style={styles.heroPill}>👤 Logged in as: {user?.username || "Admin"}</span>
              <span style={styles.heroPill}>🔐 Role: {user?.role || "admin"}</span>
            </div>
          </div>

          <button onClick={onLogout} style={styles.btn("danger")} type="button">
            <Icon.Logout />
            Logout
          </button>
        </div>

        <div style={styles.topBar}>
          <div style={styles.tabs}>
            <TabBtn id="users" label="Users" icon={Icon.Users} count={users.length} />
            <TabBtn id="crops" label="Crops" icon={Icon.Leaf} count={crops.length} />
            <TabBtn id="products" label="Products" icon={Icon.Box} count={products.length} />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={styles.searchWrap}>
              <Icon.Search style={{ color: "#6b7280" }} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={`Search ${title.toLowerCase()}...`}
                style={styles.input}
              />
            </div>

            {tab === "products" && (
              <button
                onClick={() => openEdit("product", {})}
                style={styles.btn("primary")}
                type="button"
              >
                <Icon.Plus />
                Add Product
              </button>
            )}
          </div>
        </div>

        {status.message && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 12,
              fontWeight: 800,
              background: status.type === "success" ? "rgba(46, 204, 113, 0.16)" : "rgba(231, 76, 60, 0.12)",
              border: "1px solid rgba(0,0,0,0.08)",
              color: status.type === "success" ? "#1f7a43" : "#9b2d23",
            }}
          >
            {status.message}
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ fontWeight: 950, fontSize: 16 }}>{title} Management</div>
            <div style={styles.small}>
              {loading ? "Loading..." : `${filtered.length} record(s) • Page ${currentPage} of ${totalPages}`}
            </div>
          </div>

          <div style={styles.tableWrap}>
            {tab === "users" && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>User ID</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Created</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((u) => (
                    <tr key={u.user_id}>
                      <td style={styles.td}>{u.user_id}</td>
                      <td style={styles.td}>
                        <b>{u.username}</b>
                      </td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        <span style={styles.badge(u.role === "admin" ? "blue" : "green")}>{u.role}</span>
                      </td>
                      <td style={styles.td}>{prettyDate(u.created_at)}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.actions}>
                          <button onClick={() => openEdit("user", u)} style={styles.iconBtn()} type="button">
                            <Icon.Pencil />
                          </button>
                          <button
                            onClick={() => requestDelete("user", u.user_id)}
                            style={styles.iconBtn("danger")}
                            type="button"
                          >
                            <Icon.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr>
                      <td style={styles.td} colSpan={6}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {tab === "crops" && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Crop ID</th>
                    <th style={styles.th}>Crop</th>
                    <th style={styles.th}>Optimal N</th>
                    <th style={styles.th}>Optimal P</th>
                    <th style={styles.th}>Optimal K</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => (
                    <tr key={c.crop_id}>
                      <td style={styles.td}>{c.crop_id}</td>
                      <td style={styles.td}>
                        <b>{c.crop_name}</b>
                      </td>
                      <td style={styles.td}>{c.optimal_N}</td>
                      <td style={styles.td}>{c.optimal_P}</td>
                      <td style={styles.td}>{c.optimal_K}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.actions}>
                          <button onClick={() => openEdit("crop", c)} style={styles.iconBtn()} type="button">
                            <Icon.Pencil />
                          </button>
                          <button
                            onClick={() => requestDelete("crop", c.crop_id)}
                            style={styles.iconBtn("danger")}
                            type="button"
                          >
                            <Icon.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr>
                      <td style={styles.td} colSpan={6}>
                        No crops found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {tab === "products" && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Product ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Price (£)</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Created</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => (
                    <tr key={p.product_id}>
                      <td style={styles.td}>{p.product_id}</td>
                      <td style={styles.td}>
                        <b>{p.name}</b>
                        {p.description ? (
                          <div style={{ fontSize: 12, color: "#6b7280", maxWidth: 420, whiteSpace: "normal" }}>
                            {p.description}
                          </div>
                        ) : null}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge("blue")}>{p.category}</span>
                      </td>
                      <td style={styles.td}>{Number(p.price ?? 0).toFixed(2)}</td>
                      <td style={styles.td}>
                        <span style={styles.badge(p.stock > 0 ? "green" : "red")}>{p.stock ?? 0}</span>
                      </td>
                      <td style={styles.td}>{prettyDate(p.created_at)}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.actions}>
                          <button onClick={() => openEdit("product", p)} style={styles.iconBtn()} type="button">
                            <Icon.Pencil />
                          </button>
                          <button
                            onClick={() => requestDelete("product", p.product_id)}
                            style={styles.iconBtn("danger")}
                            type="button"
                          >
                            <Icon.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr>
                      <td style={styles.td} colSpan={7}>
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div style={styles.footer}>
            <div style={styles.small}>Tip: Use search to quickly find records.</div>
            <div style={styles.pager}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={styles.btn("ghost")}
                disabled={currentPage === 1}
                type="button"
              >
                ◀ Prev
              </button>
              <span style={{ fontWeight: 900 }}>{currentPage}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={styles.btn("ghost")}
                disabled={currentPage === totalPages}
                type="button"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>

        <EditModal
          open={editOpen}
          title={editTitle}
          fields={editFields}
          form={editForm}
          setForm={setEditForm}
          onClose={() => setEditOpen(false)}
          onSave={saveEdit}
        />

        <Confirm
          open={confirmOpen}
          title="Confirm deletion"
          message="This action cannot be undone. Do you want to proceed?"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
