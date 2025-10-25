// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';

/**
 * Templates Page
 * Manage resume templates
 */

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
          Templates
        </h1>
        <p className="text-gray-600 mt-1">Manage resume templates</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <p className="text-gray-600">Template management coming soon...</p>
      </div>
    </div>
  );
}
