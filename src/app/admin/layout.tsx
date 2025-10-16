/**
 * Admin Dashboard Layout
 * Protected layout with sidebar navigation
 */

import { requireAdmin } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata = {
  title: "Admin Dashboard | AI Resume Builder",
  description: "Admin control panel for managing users, analytics, and system settings",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect the admin routes
  const { user } = await requireAdmin();

  if (!user) {
    redirect("/dashboard");
  }

  // Convert Mongoose document to plain object for client components
  const plainUser = {
    id: user.id || user._id?.toString(),
    clerkId: user.clerkId,
    email: user.email,
    username: user.username,
    photo: user.photo,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    plan: user.plan,
    role: user.role,
    isActive: user.isActive,
    isSuspended: user.isSuspended,
    lastActive: user.lastActive?.toISOString(),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar user={plainUser} />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <AdminHeader user={plainUser} />

          {/* Content */}
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
