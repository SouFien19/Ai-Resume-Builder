import { IntegratedLayout } from "@/components/layout/IntegratedLayout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <IntegratedLayout>
      {children}
    </IntegratedLayout>
  )
}
