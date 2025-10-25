/**
 * User Detail Page
 * View and manage individual user
 */

// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
          User Details
        </h1>
        <p className="text-gray-600 mt-1">
          User ID: {id}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <p className="text-gray-600">
          User detail page coming soon...
        </p>
      </div>
    </div>
  );
}
