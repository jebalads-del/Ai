import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "@auth/create/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

const SITE_NAME = "كرياتيف AI";
const SITE_DESC =
  "منصة إنشاء الصور بالذكاء الاصطناعي — حوّل أفكارك لصور مذهلة في ثوانٍ باستخدام تقنية DALL-E";
const SITE_URL = process.env.NEXT_PUBLIC_CREATE_APP_URL || "";

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* ── أساسيات السيو ── */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{SITE_NAME} — إنشاء صور بالذكاء الاصطناعي</title>
        <meta name="description" content={SITE_DESC} />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="canonical" href={SITE_URL} />

        {/* ── Open Graph (فيسبوك، واتساب، تيليجرام) ── */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta
          property="og:title"
          content={`${SITE_NAME} — إنشاء صور بالذكاء الاصطناعي`}
        />
        <meta property="og:description" content={SITE_DESC} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:locale" content="ar_SA" />

        {/* ── Twitter / X Card ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${SITE_NAME} — إنشاء صور بالذكاء الاصطناعي`}
        />
        <meta name="twitter:description" content={SITE_DESC} />

        {/* ── الكلمات المفتاحية ── */}
        <meta
          name="keywords"
          content="إنشاء صور بالذكاء الاصطناعي، توليد صور، DALL-E، كرياتيف، AI، صور احترافية، تحويل نص لصورة"
        />
        <meta name="author" content={SITE_NAME} />

        {/* ── Preconnect للأداء ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SessionProvider refetchOnWindowFocus={true} refetchInterval={240}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
