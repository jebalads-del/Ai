export async function GET() {
  const BASE = process.env.NEXT_PUBLIC_CREATE_APP_URL || "";

  const content = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin
Disallow: /api/
Disallow: /account/

Sitemap: ${BASE}/sitemap.xml

# كرياتيف AI — منصة إنشاء الصور بالذكاء الاصطناعي
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
