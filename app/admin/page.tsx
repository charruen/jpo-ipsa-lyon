import AdminDashboard from "@/app/components/AdminDashboard";

export const metadata = {
  title: "Admin — U Tragulinu",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}