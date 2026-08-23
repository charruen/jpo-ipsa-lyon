"use client";

import { useEffect, useState, useCallback } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
};

type Product = {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  in_stock: boolean;
  sort_order: number;
};

type Tab = "products" | "categories" | "stock";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("stock");

  // Product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
  });
  const [addingProduct, setAddingProduct] = useState(false);

  // Category form
  const [newCatName, setNewCatName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch("/api/admin/session");
      if (res.ok) {
        setIsAuthenticated(true);
        fetchData();
      }
    } catch {
      /* not authenticated */
    } finally {
      setIsChecking(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setPasswordInput("");
        fetchData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Mot de passe incorrect.");
      }
    } catch {
      setErrorMsg("Erreur de connexion.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setIsAuthenticated(false);
  }

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/manage");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data.categories ?? []);
      setProducts(data.products ?? []);
    } catch {
      showFeedback("error", "Impossible de charger les données.");
    }
  }, []);

  function showFeedback(type: "success" | "error", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  }

  // Add product
  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category_id)
      return;
    setAddingProduct(true);

    try {
      const res = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: "products",
          data: {
            name: newProduct.name,
            price: parseFloat(newProduct.price),
            category_id: parseInt(newProduct.category_id),
            description: newProduct.description || null,
            in_stock: true,
          },
        }),
      });

      if (res.ok) {
        setNewProduct({ name: "", price: "", category_id: "", description: "" });
        showFeedback("success", "Produit ajouté !");
        fetchData();
      } else {
        const data = await res.json();
        showFeedback("error", data.error || "Erreur lors de l'ajout.");
      }
    } catch {
      showFeedback("error", "Erreur réseau.");
    } finally {
      setAddingProduct(false);
    }
  }

  // Add category
  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName) return;
    setAddingCategory(true);

    const slug = newCatName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      const res = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: "categories",
          data: {
            name: newCatName,
            slug,
            sort_order: (categories.length + 1) * 10,
          },
        }),
      });

      if (res.ok) {
        setNewCatName("");
        showFeedback("success", "Catégorie créée !");
        fetchData();
      } else {
        const data = await res.json();
        showFeedback("error", data.error || "Erreur lors de la création.");
      }
    } catch {
      showFeedback("error", "Erreur réseau.");
    } finally {
      setAddingCategory(false);
    }
  }

  // Toggle stock
  async function toggleStock(product: Product) {
    try {
      const res = await fetch("/api/admin/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: "products",
          id: product.id,
          data: { ...product, in_stock: !product.in_stock },
        }),
      });

      if (res.ok) {
        fetchData();
      } else {
        showFeedback("error", "Erreur lors de la mise à jour.");
      }
    } catch {
      showFeedback("error", "Erreur réseau.");
    }
  }

  // Delete product
  async function deleteProduct(id: number) {
    if (!confirm("Supprimer ce produit ?")) return;

    try {
      const res = await fetch(
        `/api/admin/manage?resource=products&id=${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        showFeedback("success", "Produit supprimé.");
        fetchData();
      }
    } catch {
      showFeedback("error", "Erreur réseau.");
    }
  }

  // Delete category
  async function deleteCategory(id: number) {
    if (
      !confirm(
        "Supprimer cette catégorie et tous ses produits ?"
      )
    )
      return;

    try {
      const res = await fetch(
        `/api/admin/manage?resource=categories&id=${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        showFeedback("success", "Catégorie supprimée.");
        fetchData();
      }
    } catch {
      showFeedback("error", "Erreur réseau.");
    }
  }

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#1a1612]">
        <div className="text-corse-500 text-sm animate-pulse">
          Vérification...
        </div>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[#1a1612] p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white/[0.03] border border-white/[0.06] p-8 rounded-2xl w-full max-w-sm space-y-5 backdrop-blur-sm"
        >
          <div className="text-center">
            <h1
              className="text-2xl text-gold-300 tracking-wider"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Administration
            </h1>
            <p className="text-xs text-corse-500 mt-1">U Tragulinu</p>
          </div>

          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/50 focus:ring-1 focus:ring-gold-600/25 transition-all"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              autoFocus
            />
            {errorMsg && (
              <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-gold-600 hover:bg-gold-700 text-white font-medium py-3 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {loginLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </main>
    );
  }

  // Dashboard
  const getCategoryName = (catId: number) =>
    categories.find((c) => c.id === catId)?.name ?? "—";

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all ${
            feedback.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center border-b border-white/[0.06] pb-4">
        <div>
          <h1
            className="text-xl text-gold-300 tracking-wide"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Espace Admin
          </h1>
          <p className="text-xs text-corse-500">
            Gestion de la carte — {products.length} produits,{" "}
            {categories.length} catégories
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-corse-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.03]"
        >
          Déconnexion
        </button>
      </header>

      {/* Tab nav */}
      <nav className="flex gap-1 bg-white/[0.03] p-1 rounded-xl">
        {(
          [
            { key: "stock", label: "📦 Stocks" },
            { key: "products", label: "➕ Produits" },
            { key: "categories", label: "📁 Catégories" },
          ] as { key: Tab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-gold-600 text-white shadow-md"
                : "text-corse-400 hover:text-corse-200 hover:bg-white/[0.03]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* STOCK TAB */}
      {activeTab === "stock" && (
        <section className="space-y-2">
          {categories.map((cat) => {
            const catProducts = products.filter(
              (p) => p.category_id === cat.id
            );
            if (catProducts.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-1">
                <h3 className="text-xs font-semibold text-gold-500 uppercase tracking-wider px-1 pt-3 pb-1">
                  {cat.name}
                </h3>
                {catProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-corse-100 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-corse-500">
                        {Number(p.price).toFixed(2)} €
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStock(p)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          p.in_stock
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                        }`}
                      >
                        {p.in_stock ? "En stock" : "Rupture"}
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-corse-600 hover:text-red-400 transition-colors p-1"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {products.length === 0 && (
            <p className="text-center text-corse-500 text-sm py-10">
              Aucun produit. Ajoutez-en via l&apos;onglet Produits.
            </p>
          )}
        </section>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === "products" && (
        <section className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl space-y-4">
          <h2 className="font-semibold text-corse-200 text-sm">
            Ajouter un produit
          </h2>
          <form onSubmit={handleAddProduct} className="space-y-3">
            <input
              type="text"
              placeholder="Nom du plat / boisson"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/40 transition-all"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Prix (€)"
                className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/40 transition-all"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                required
              />
              <select
                className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-corse-100 focus:outline-none focus:border-gold-600/40 transition-all"
                value={newProduct.category_id}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category_id: e.target.value })
                }
                required
              >
                <option value="">Catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Description / Ingrédients (optionnel)"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/40 transition-all resize-none"
              rows={2}
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />
            <button
              type="submit"
              disabled={addingProduct}
              className="w-full bg-gold-600 hover:bg-gold-700 text-white font-medium py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {addingProduct ? "Ajout en cours..." : "Ajouter à la carte"}
            </button>
          </form>
        </section>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === "categories" && (
        <section className="space-y-4">
          <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl space-y-4">
            <h2 className="font-semibold text-corse-200 text-sm">
              Nouvelle catégorie
            </h2>
            <form
              onSubmit={handleAddCategory}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Nom de la catégorie"
                className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/40 transition-all"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={addingCategory}
                className="bg-gold-600 hover:bg-gold-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                {addingCategory ? "..." : "Créer"}
              </button>
            </form>
          </div>

          <div className="space-y-1.5">
            {categories.map((cat) => {
              const count = products.filter(
                (p) => p.category_id === cat.id
              ).length;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-corse-100">
                      {cat.name}
                    </p>
                    <p className="text-[11px] text-corse-500">
                      {count} produit{count > 1 ? "s" : ""} • ordre :{" "}
                      {cat.sort_order}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-corse-600 hover:text-red-400 transition-colors p-1 text-sm"
                    title="Supprimer la catégorie"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
