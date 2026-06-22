interface NewsArticleJsonLdProps {
  title: string;
  dek: string;
  publishedAt: Date;
  authorName: string;
  url: string;
}

export function NewsArticleJsonLd({
  title,
  dek,
  publishedAt,
  authorName,
  url,
}: NewsArticleJsonLdProps) {
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
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}