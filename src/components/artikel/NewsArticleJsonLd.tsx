interface NewsArticleJsonLdProps {
  title: string;
  dek: string;
  publishedAt: Date;
  authorName: string;
  slug: string;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jurnalisme-damai.vercel.app";

export function NewsArticleJsonLd({
  title,
  dek,
  publishedAt,
  authorName,
  slug,
}: NewsArticleJsonLdProps) {
  const absoluteUrl = `${SITE_URL}/artikel/${slug}`;

  const json = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: dek,
    datePublished: publishedAt.toISOString(),
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: "Anyaman",
    },
    url: absoluteUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
