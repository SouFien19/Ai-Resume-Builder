export function Preloads() {
  return (
    <>
      <link
        rel="preload"
        href="/api/analytics/summary"
        as="fetch"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}
