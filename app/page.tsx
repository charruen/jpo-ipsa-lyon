import { supabase } from "@/lib/supabaseClient";
import MenuClient from "@/app/components/MenuClient";

export const dynamic = "force-dynamic";

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

export default async function Page() {
  const [catsRes, prodsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  const categories: Category[] = catsRes.data ?? [];
  const products: Product[] = prodsRes.data ?? [];

  return <MenuClient categories={categories} products={products} />;
}