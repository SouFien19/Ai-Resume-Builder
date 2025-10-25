// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';

import PerformanceDashboard from '@/components/PerformanceDashboard';

export default function PerformancePage() {
  return <PerformanceDashboard />;
}