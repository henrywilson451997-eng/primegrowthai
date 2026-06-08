import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  lang?: string;
  alternateHref?: string;
  alternateLang?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

const DEFAULT_OG_IMAGE = "https://www.primegrowthai.com/og-image.png";

export function useSEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  lang = "en",
  alternateHref,
  alternateLang,
  noindex = false,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    // ── Title ──────────────────────────────────────────────────────────────
    document.title = title;

    // ── HTML lang ─────────────────────────────────────────────────────────
    document.documentElement.lang = lang;

    // Helper: upsert a <meta> tag
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrVal] = selector.replace(/[\[\]"]/g, "").split("=");
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    // Helper: upsert a <link> tag
    const setLink = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]:not([hreflang])`;
      let el = document.querySelector<HTMLLinkElement>(selector);
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        if (hreflang) el.setAttribute("hreflang", hreflang);
        document.head.appendChild(el);
      }
      el.href = href;
    };

    // Helper: remove stale link tags
    const removeLink = (rel: string, hreflang: string) => {
      const el = document.querySelector<HTMLLinkElement>(
        `link[rel="${rel}"][hreflang="${hreflang}"]`
      );
      if (el) el.remove();
    };

    // ── Robots ────────────────────────────────────────────────────────────
    setMeta('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");

    // ── Standard meta ──────────────────────────────────────────────────────
    setMeta('meta[name="description"]', "content", description);
    setLink("canonical", canonical);

    // ── Open Graph ─────────────────────────────────────────────────────────
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonical);
    setMeta('meta[property="og:type"]', "content", "website");
    setMeta('meta[property="og:image"]', "content", ogImage);
    setMeta('meta[property="og:locale"]', "content", lang === "fr" ? "fr_CA" : "en_CA");
    setMeta('meta[property="og:site_name"]', "content", "PrimeGrowth AI");

    // ── Twitter Card ───────────────────────────────────────────────────────
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", ogImage);

    // ── hreflang alternates ────────────────────────────────────────────────
    if (alternateHref && alternateLang) {
      // Set current language alternate
      setLink("alternate", canonical, lang);
      // Set other language alternate
      setLink("alternate", alternateHref, alternateLang);
      // Set x-default to English version (or current if English)
      const xDefaultHref = lang === "en" ? canonical : alternateHref;
      setLink("alternate", xDefaultHref, "x-default");
    } else {
      // Clean up stale hreflang links if no alternates
      removeLink("alternate", "en");
      removeLink("alternate", "fr");
      removeLink("alternate", "x-default");
    }

    // ── JSON-LD structured data ────────────────────────────────────────────
    // Remove any existing JSON-LD injected by this hook
    document
      .querySelectorAll('script[data-seo="true"]')
      .forEach((el) => el.remove());

    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach((schema) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo", "true");
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    // Cleanup on unmount
    return () => {
      document
        .querySelectorAll('script[data-seo="true"]')
        .forEach((el) => el.remove());
    };
  }, [title, description, canonical, ogImage, lang, alternateHref, alternateLang, noindex, jsonLd]);
}
