import { Metadata } from "next";
import { AdminPanel } from "@/components/admin-panel";

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Secure admin portal for DM Public School Puri.",
  robots: {
    index: false,
    follow: false,
    nocache: true
  },
  alternates: {
    canonical: "/admin"
  }
};

export default function AdminPage() {
  return (
    <main className="section-shell section-spacing">
      <AdminPanel />
    </main>
  );
}
