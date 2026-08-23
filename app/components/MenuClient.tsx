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
      <footer className="mt-20 px-4 pb-12 text-center border-t border-white/[0.04] pt-8 max-w-4xl mx-auto">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold-700/50 to-transparent mx-auto mb-4" />
        <p className="text-xs text-corse-400 uppercase tracking-[0.3em] font-medium">
          U Tragulinu
        </p>
        <p className="text-xs text-corse-500 mt-1">
          Saint-Cyprien, Lecci — Porto-Vecchio, Corse
        </p>
      </footer>
    </main>
  );
}
