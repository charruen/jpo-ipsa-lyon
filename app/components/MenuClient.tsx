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

  // Real-time subscription for live stock updates
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
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
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
      const offset = 76;
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
    <main className="max-w-lg mx-auto min-h-dvh pb-8 relative">
      {/* Header */}
      <header className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold-800/30 via-transparent to-transparent" />
        <div className="relative px-6 pt-10 pb-6 text-center">
          <div className="inline-block mb-3">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mb-4" />
            <h1
              className="text-4xl tracking-wider text-gold-300"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              U TRAGULINU
            </h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mt-4" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-corse-400 mt-2">
            Saint-Cyprien — Lecci — Porto-Vecchio
          </p>
          <p className="text-[10px] text-corse-500 mt-1 italic">
            Cuisine Méditerranéenne &amp; Spécialités Corses
          </p>
        </div>
      </header>

      {/* Sticky category nav */}
      <nav
        ref={navRef}
        className="sticky top-0 z-20 backdrop-blur-xl bg-[#1a1612]/90 border-b border-gold-900/30 py-2.5 px-3 flex gap-1.5 overflow-x-auto no-scrollbar"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            data-nav={cat.slug}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              activeSlug === cat.slug
                ? "bg-gold-600 text-white shadow-lg shadow-gold-600/25 scale-105"
                : "bg-white/5 text-corse-300 hover:bg-white/10 hover:text-corse-100"
            }`}
          >
            <span className="mr-1">{SECTION_ICONS[cat.slug] ?? "•"}</span>
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Menu sections */}
      <div className="px-4 pt-6 space-y-8">
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
              className="animate-fade-in-up"
              style={{ animationDelay: `${catIndex * 50}ms` }}
            >
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">
                  {SECTION_ICONS[cat.slug] ?? "•"}
                </span>
                <h2
                  className="text-xl text-gold-300 tracking-wide"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gold-800/50 to-transparent" />
              </div>

              {/* Products list */}
              <div className="space-y-1">
                {catProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`group relative px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/[0.03] ${
                      !product.in_stock ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-medium text-[15px] text-corse-100 leading-tight">
                            {product.name}
                          </h3>
                          {!product.in_stock && (
                            <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
                              Épuisé
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-xs text-corse-500 mt-0.5 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-gold-400 tabular-nums">
                        {Number(product.price).toFixed(2)}&nbsp;€
                      </span>
                    </div>
                    {/* Subtle bottom separator */}
                    <div className="absolute bottom-0 left-4 right-4 h-px bg-white/[0.04]" />
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Empty state */}
        {categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-corse-500 text-sm">
              La carte est en cours de mise à jour...
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 px-4 pb-8 text-center">
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold-700/50 to-transparent mx-auto mb-4" />
        <p className="text-[10px] text-corse-600 uppercase tracking-[0.3em]">
          U Tragulinu
        </p>
        <p className="text-[10px] text-corse-700 mt-1">
          Saint-Cyprien, Lecci — Porto-Vecchio, Corse
        </p>
      </footer>
    </main>
  );
}
