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

  // Product form (Add & Edit)
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
    sort_order: 0,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Category form (Add & Edit)
  const [newCatName, setNewCatName] = useState("");
  const [newCatOrder, setNewCatOrder] = useState<number>(0);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submittingCat, setSubmittingCat] = useState(false);

  // Feedback banner
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

  // --- CATEGORIES LOGIC ---
  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingCat(true);

    if (editingCategory) {
      // Edit category
      const slug = editingCategory.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      try {
        const res = await fetch("/api/admin/manage", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resource: "categories",
            id: editingCategory.id,
            data: {
              name: editingCategory.name,
              slug,
              sort_order: Number(editingCategory.sort_order),
            },
          }),
        });

        if (res.ok) {
          setEditingCategory(null);
          showFeedback("success", "Catégorie mise à jour !");
          fetchData();
        } else {
          const data = await res.json();
          showFeedback("error", data.error || "Erreur lors de la modification.");
        }
      } catch {
        showFeedback("error", "Erreur réseau.");
      } finally {
        setSubmittingCat(false);
      }
    } else {
      // Add new category
      if (!newCatName) return;
      const slug = newCatName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const sortOrder =
        newCatOrder > 0
          ? newCatOrder
          : (categories.length + 1) * 10;

      try {
        const res = await fetch("/api/admin/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resource: "categories",
            data: {
              name: newCatName,
              slug,
              sort_order: sortOrder,
            },
          }),
        });

        if (res.ok) {
          setNewCatName("");
          setNewCatOrder(0);
          showFeedback("success", "Catégorie créée !");
          fetchData();
        } else {
          const data = await res.json();
          showFeedback("error", data.error || "Erreur lors de la création.");
        }
      } catch {
        showFeedback("error", "Erreur réseau.");
      } finally {
        setSubmittingCat(false);
      }
    }
  }

  async function handleQuickReorderCat(category: Category, delta: number) {
    const newOrder = category.sort_order + delta;
    try {
      const res = await fetch("/api/admin/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: "categories",
          id: category.id,
          data: {
            ...category,
            sort_order: newOrder,
          },
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      showFeedback("error", "Erreur lors de la réorganisation.");
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm("Supprimer cette catégorie et tous ses produits ?")) return;

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

  // --- PRODUCTS LOGIC ---
  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingProduct(true);

    if (editingProduct) {
      // Edit existing product
      try {
        const res = await fetch("/api/admin/manage", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resource: "products",
            id: editingProduct.id,
            data: {
              name: editingProduct.name,
              price: Number(editingProduct.price),
              category_id: Number(editingProduct.category_id),
              description: editingProduct.description || null,
              in_stock: editingProduct.in_stock,
              sort_order: Number(editingProduct.sort_order),
            },
          }),
        });

        if (res.ok) {
          setEditingProduct(null);
          showFeedback("success", "Produit modifié !");
          fetchData();
        } else {
          const data = await res.json();
          showFeedback("error", data.error || "Erreur lors de la modification.");
        }
      } catch {
        showFeedback("error", "Erreur réseau.");
      } finally {
        setSubmittingProduct(false);
      }
    } else {
      // Add new product
      if (!newProduct.name || !newProduct.price || !newProduct.category_id)
        return;

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
              sort_order: Number(newProduct.sort_order) || 0,
            },
          }),
        });

        if (res.ok) {
          setNewProduct({
            name: "",
            price: "",
            category_id: "",
            description: "",
            sort_order: 0,
          });
          showFeedback("success", "Produit ajouté !");
          fetchData();
        } else {
          const data = await res.json();
          showFeedback("error", data.error || "Erreur lors de l'ajout.");
        }
      } catch {
        showFeedback("error", "Erreur réseau.");
      } finally {
        setSubmittingProduct(false);
      }
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

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#1a1612]">
        <div className="text-corse-400 text-sm animate-pulse">
          Vérification de l&apos;accès...
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
          className="bg-white/[0.03] border border-white/[0.06] p-8 rounded-2xl w-full max-w-sm space-y-5 backdrop-blur-sm shadow-xl"
        >
          <div className="text-center">
            <h1
              className="text-2xl text-gold-300 tracking-wider font-serif"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Administration
            </h1>
            <p className="text-xs text-corse-400 mt-1">U Tragulinu</p>
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
            className="w-full bg-gold-600 hover:bg-gold-700 text-white font-medium py-3 rounded-xl text-sm transition-all disabled:opacity-50 shadow-md cursor-pointer"
          >
            {loginLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#1a1612] text-corse-100 p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Feedback banner */}
        {feedback && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-semibold shadow-2xl transition-all ${
              feedback.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <h1
              className="text-2xl sm:text-3xl text-gold-300 tracking-wide font-serif"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Administration Carte &amp; Stocks
            </h1>
            <p className="text-xs sm:text-sm text-corse-400 mt-1">
              U Tragulinu — {products.length} produits • {categories.length}{" "}
              catégories
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs sm:text-sm text-corse-400 hover:text-red-400 transition-colors px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06]"
          >
            Déconnexion
          </button>
        </header>

        {/* Tab nav */}
        <nav className="flex gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.05] max-w-md">
          {(
            [
              { key: "stock", label: "📦 Stocks" },
              { key: "products", label: "🍔 Produits" },
              { key: "categories", label: "📁 Catégories (Ordre)" },
            ] as { key: Tab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setEditingProduct(null);
                setEditingCategory(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-gold-600 text-white shadow-lg shadow-gold-600/25"
                  : "text-corse-400 hover:text-corse-200 hover:bg-white/[0.03]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ================= STOCKS TAB ================= */}
        {activeTab === "stock" && (
          <section className="space-y-6">
            {categories.map((cat) => {
              const catProducts = products.filter(
                (p) => p.category_id === cat.id
              );
              if (catProducts.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-corse-500">
                      (ordre: {cat.sort_order})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {catProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <p className="text-sm sm:text-base font-semibold text-corse-100 truncate">
                              {p.name}
                            </p>
                            <span className="text-xs text-gold-400 font-bold">
                              {Number(p.price).toFixed(2)} €
                            </span>
                          </div>
                          {p.description && (
                            <p className="text-xs text-corse-400 line-clamp-1 mt-0.5">
                              {p.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => toggleStock(p)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              p.in_stock
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                            }`}
                          >
                            {p.in_stock ? "✓ En stock" : "✕ Rupture"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setActiveTab("products");
                            }}
                            className="p-1.5 text-xs text-corse-400 hover:text-gold-300 bg-white/[0.04] rounded-lg hover:bg-white/[0.08]"
                            title="Modifier le produit"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {products.length === 0 && (
              <p className="text-center text-corse-500 text-sm py-12">
                Aucun produit à afficher.
              </p>
            )}
          </section>
        )}

        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === "products" && (
          <section className="space-y-8">
            {/* Add or Edit Product Form */}
            <div className="bg-white/[0.03] border border-white/[0.06] p-6 rounded-2xl space-y-4 shadow-lg">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gold-300 text-base sm:text-lg">
                  {editingProduct
                    ? `Modifier : ${editingProduct.name}`
                    : "Ajouter un produit"}
                </h2>
                {editingProduct && (
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="text-xs text-corse-400 hover:text-white px-2.5 py-1 bg-white/[0.05] rounded-lg"
                  >
                    Annuler l&apos;édition
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nom du plat / boisson"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/50"
                    value={
                      editingProduct ? editingProduct.name : newProduct.name
                    }
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({
                            ...editingProduct,
                            name: e.target.value,
                          })
                        : setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                  />

                  <select
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-corse-100 focus:outline-none focus:border-gold-600/50"
                    value={
                      editingProduct
                        ? editingProduct.category_id
                        : newProduct.category_id
                    }
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({
                            ...editingProduct,
                            category_id: parseInt(e.target.value),
                          })
                        : setNewProduct({
                            ...newProduct,
                            category_id: e.target.value,
                          })
                    }
                    required
                  >
                    <option value="" className="bg-[#1a1612]">
                      Sélectionner une catégorie
                    </option>
                    {categories.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        className="bg-[#1a1612]"
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Prix (€)"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/50"
                    value={
                      editingProduct ? editingProduct.price : newProduct.price
                    }
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({
                            ...editingProduct,
                            price: parseFloat(e.target.value) || 0,
                          })
                        : setNewProduct({
                            ...newProduct,
                            price: e.target.value,
                          })
                    }
                    required
                  />

                  <input
                    type="number"
                    placeholder="Ordre d'affichage (ex: 1, 2, 3)"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/50"
                    value={
                      editingProduct
                        ? editingProduct.sort_order
                        : newProduct.sort_order
                    }
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({
                            ...editingProduct,
                            sort_order: parseInt(e.target.value) || 0,
                          })
                        : setNewProduct({
                            ...newProduct,
                            sort_order: parseInt(e.target.value) || 0,
                          })
                    }
                  />
                </div>

                <textarea
                  placeholder="Description / Ingrédients (optionnel)"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/50 resize-none"
                  rows={2}
                  value={
                    editingProduct
                      ? editingProduct.description || ""
                      : newProduct.description
                  }
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({
                          ...editingProduct,
                          description: e.target.value,
                        })
                      : setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                  }
                />

                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="w-full bg-gold-600 hover:bg-gold-700 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submittingProduct
                    ? "Enregistrement..."
                    : editingProduct
                    ? "Mettre à jour le produit"
                    : "Ajouter le produit"}
                </button>
              </form>
            </div>

            {/* List of existing products */}
            <div className="space-y-4">
              <h3 className="font-semibold text-corse-300 text-sm">
                Tous les produits existants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-corse-100 truncate">
                          {p.name}
                        </p>
                        <span className="text-xs text-gold-400 font-bold">
                          {Number(p.price).toFixed(2)} €
                        </span>
                      </div>
                      <p className="text-xs text-corse-400 mt-0.5">
                        Catégorie :{" "}
                        {categories.find((c) => c.id === p.category_id)?.name ||
                          "—"}{" "}
                        • Ordre : {p.sort_order}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white/[0.05] text-gold-300 rounded-lg hover:bg-white/[0.1] transition-all"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= CATEGORIES TAB (ORDERING) ================= */}
        {activeTab === "categories" && (
          <section className="space-y-8">
            {/* Add or Edit Category Form */}
            <div className="bg-white/[0.03] border border-white/[0.06] p-6 rounded-2xl space-y-4 shadow-lg">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gold-300 text-base sm:text-lg">
                  {editingCategory
                    ? `Modifier catégorie : ${editingCategory.name}`
                    : "Créer une nouvelle catégorie"}
                </h2>
                {editingCategory && (
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="text-xs text-corse-400 hover:text-white px-2.5 py-1 bg-white/[0.05] rounded-lg"
                  >
                    Annuler
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nom (ex: Entrées, Cocktails...)"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/50"
                    value={
                      editingCategory ? editingCategory.name : newCatName
                    }
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        : setNewCatName(e.target.value)
                    }
                    required
                  />

                  <input
                    type="number"
                    placeholder="Ordre d'affichage (ex: 10, 20, 30...)"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-corse-100 placeholder:text-corse-600 focus:outline-none focus:border-gold-600/50"
                    value={
                      editingCategory
                        ? editingCategory.sort_order
                        : newCatOrder || ""
                    }
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({
                            ...editingCategory,
                            sort_order: parseInt(e.target.value) || 0,
                          })
                        : setNewCatOrder(parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingCat}
                  className="w-full bg-gold-600 hover:bg-gold-700 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submittingCat
                    ? "Enregistrement..."
                    : editingCategory
                    ? "Mettre à jour la catégorie"
                    : "Créer la catégorie"}
                </button>
              </form>
            </div>

            {/* List & Reorder Categories */}
            <div className="space-y-3">
              <h3 className="font-semibold text-corse-300 text-sm">
                Ordre des catégories sur le site (trié par numéro d&apos;ordre)
              </h3>
              <div className="space-y-2">
                {categories.map((cat, idx) => {
                  const count = products.filter(
                    (p) => p.category_id === cat.id
                  ).length;
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gold-400 bg-gold-400/10 px-2.5 py-1 rounded-lg border border-gold-400/20">
                          #{cat.sort_order}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-corse-100">
                            {cat.name}
                          </p>
                          <p className="text-xs text-corse-500">
                            {count} produit{count > 1 ? "s" : ""} • slug:{" "}
                            {cat.slug}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quick Up / Down reordering */}
                        <button
                          onClick={() => handleQuickReorderCat(cat, -1)}
                          disabled={idx === 0}
                          className="px-2 py-1 text-xs bg-white/[0.05] hover:bg-white/[0.1] rounded text-corse-300 disabled:opacity-30"
                          title="Monter"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleQuickReorderCat(cat, 1)}
                          disabled={idx === categories.length - 1}
                          className="px-2 py-1 text-xs bg-white/[0.05] hover:bg-white/[0.1] rounded text-corse-300 disabled:opacity-30"
                          title="Descendre"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="px-3 py-1 text-xs font-semibold bg-white/[0.05] text-gold-300 rounded-lg hover:bg-white/[0.1]"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1 text-xs text-red-400 hover:bg-red-500/20 rounded"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
