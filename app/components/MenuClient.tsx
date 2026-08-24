"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

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

const SECTION_ICONS: Record<string, string> = {
  "a-partager": "🍽️",
  entrees: "🥗",
  plats: "🥩",
  salades: "🥬",
  desserts: "🍮",
  glaces: "🍨",
  cocktails: "🍸",
  vins: "🍷",
  bieres: "🍺",
  spiritueux: "🥃",
  softs: "🥤",
  "boissons-chaudes": "☕",
};

export default function MenuClient({
  categories: initialCategories,
  products: initialProducts,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [activeSlug, setActiveSlug] = useState(
    initialCategories[0]?.slug ?? ""
  );
  const navRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Real-time subscription for live stock & menu updates
  useEffect(() => {
    const channel = supabase
      .channel("menu-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => fetchCategories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Intersection Observer for active category tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = entry.target.getAttribute("data-slug");
            if (slug) {
              setActiveSlug(slug);
              scrollNavToActive(slug);
            }
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    const sections = document.querySelectorAll("[data-slug]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [categories, products]);

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setProducts(data);
  }

  async function fetchCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setCategories(data);
  }

  function scrollNavToActive(slug: string) {
    if (!navRef.current) return;
    const btn = navRef.current.querySelector(`[data-nav="${slug}"]`);
    if (btn) {
      btn.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }

  function handleCategoryClick(slug: string) {
    setActiveSlug(slug);
    const el = sectionRefs.current[slug];
    if (el) {
      const offset = 90;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  // Group products by category
  const productsByCategory = categories.reduce(
    (acc, cat) => {
      acc[cat.id] = products.filter((p) => p.category_id === cat.id);
      return acc;
    },
    {} as Record<number, Product[]>
  );

  return (
    <main className="min-h-dvh pb-16 relative bg-[#1a1612] text-corse-100">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-gold-900/20 bg-gradient-to-b from-gold-950/40 via-[#1a1612] to-[#1a1612]">
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
          <div className="inline-block mb-3">
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mb-4" />
            <h1
              className="text-4xl sm:text-5xl md:text-6xl tracking-wider text-gold-300 drop-shadow-sm font-serif"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              U TRAGULINU
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mt-4" />
          </div>
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-corse-400 mt-2 font-medium">
            Saint-Cyprien — Lecci — Porto-Vecchio
          </p>
          <p className="text-xs sm:text-sm text-corse-500 mt-1 italic">
            Cuisine Méditerranéenne &amp; Spécialités Corses
          </p>
        </div>
      </header>

      {/* Sticky category nav */}
      <nav
        ref={navRef}
        className="sticky top-0 z-30 backdrop-blur-xl bg-[#1a1612]/95 border-b border-gold-900/30 py-2 shadow-lg shadow-black/40"
      >
        <div className="max-w-6xl mx-auto overflow-x-auto no-scrollbar px-4 py-1">
          <div className="flex gap-2 w-max min-w-full justify-start md:justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                data-nav={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeSlug === cat.slug
                    ? "bg-gold-600 text-white shadow-md shadow-gold-600/30 ring-1 ring-gold-400/40"
                    : "bg-white/[0.04] text-corse-300 hover:bg-white/[0.08] hover:text-corse-100"
                }`}
              >
                <span className="mr-1.5">{SECTION_ICONS[cat.slug] ?? "•"}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Menu sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 space-y-12 md:space-y-16">
        {categories.map((cat, catIndex) => {
          const catProducts = productsByCategory[cat.id] ?? [];
          if (catProducts.length === 0) return null;

          return (
            <section
              key={cat.id}
              data-slug={cat.slug}
              ref={(el) => {
                sectionRefs.current[cat.slug] = el;
              }}
              className="animate-fade-in-up scroll-mt-24"
              style={{ animationDelay: `${catIndex * 40}ms` }}
            >
              {/* Section header */}
              <div className="flex items-center gap-3.5 mb-6 pb-2 border-b border-gold-900/30">
                <span className="text-2xl sm:text-3xl">
                  {SECTION_ICONS[cat.slug] ?? "•"}
                </span>
                <h2
                  className="text-2xl sm:text-3xl text-gold-300 tracking-wide font-serif"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gold-800/40 via-gold-800/10 to-transparent ml-2" />
              </div>

              {/* Products list - Grid layout for Tablet & Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {catProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`group relative p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] transition-all duration-300 hover:bg-white/[0.05] hover:border-gold-700/30 ${
                      !product.in_stock ? "opacity-45" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="font-semibold text-base sm:text-lg text-corse-100 leading-snug group-hover:text-gold-200 transition-colors">
                            {product.name}
                          </h3>
                          {!product.in_stock && (
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                              Épuisé
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-xs sm:text-sm text-corse-400 mt-1.5 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-base sm:text-lg font-bold text-gold-400 tabular-nums">
                        {Number(product.price).toFixed(2)}&nbsp;€
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Empty state */}
        {categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-corse-400 text-base">
              La carte est en cours de mise à jour...
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 px-4 pb-12 text-center border-t border-white/[0.06] pt-10 max-w-4xl mx-auto space-y-8">
        {/* Actions Réseaux & Avis */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          {/* Bouton Instagram */}
          <a
            href="https://www.instagram.com/" // À remplacer par l'URL Instagram d'U Tragulinu
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/[0.03] hover:bg-gradient-to-r hover:from-purple-950/40 hover:via-pink-950/30 hover:to-amber-950/30 border border-white/[0.08] hover:border-pink-500/40 text-corse-100 hover:text-white transition-all duration-300 shadow-lg hover:shadow-pink-500/10 cursor-pointer"
          >
            <div className="w-5 h-5 shrink-0 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium tracking-wide">
              Instagram
            </span>
          </a>

          {/* Bouton Avis Google */}
          <a
            href="https://g.page/r/" // À remplacer par le lien direct Google Review d'U Tragulinu
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/[0.03] hover:bg-gold-500/10 border border-white/[0.08] hover:border-gold-500/40 text-corse-100 hover:text-gold-200 transition-all duration-300 shadow-lg hover:shadow-gold-500/10 cursor-pointer"
          >
            <div className="w-5 h-5 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-medium tracking-wide">
                Laisser un avis
              </span>
              <span className="text-gold-400 text-xs">★★★★★</span>
            </div>
          </a>
        </div>

        <div className="space-y-1">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold-700/50 to-transparent mx-auto mb-3" />
          <p className="text-xs text-corse-400 uppercase tracking-[0.3em] font-medium">
            U Tragulinu
          </p>
          <p className="text-xs text-corse-500 mt-1">
            Saint-Cyprien, Lecci — Porto-Vecchio, Corse
          </p>
        </div>
      </footer>
    </main>
  );
}
