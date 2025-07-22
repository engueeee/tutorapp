# SEO Documentation

## Overview

The SEO system for TutorApp uses Next.js 13+ App Router's standard metadata API to handle meta tags, Open Graph, Twitter Cards, and other important SEO elements.

## Basic Usage

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title | TutorApp",
  description: "Page description for search engines",
  keywords: "relevant, keywords",
  robots: {
    index: true, // or false for private pages
    follow: true, // or false for private pages
  },
  openGraph: {
    title: "Page Title | TutorApp",
    description: "Page description",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Page Title | TutorApp",
    description: "Page description",
    images: ["/logo.png"],
  },
};

export default function MyPage() {
  return <div>{/* Your page content */}</div>;
}
```

## Metadata Properties

| Property      | Type   | Description                              |
| ------------- | ------ | ---------------------------------------- | -------------------------- |
| `title`       | string | Page title (include "                    | TutorApp" for consistency) |
| `description` | string | Meta description for search engines      |
| `keywords`    | string | Comma-separated keywords                 |
| `robots`      | object | Search engine indexing control           |
| `openGraph`   | object | Social media sharing metadata            |
| `twitter`     | object | Twitter Card metadata                    |
| `alternates`  | object | Canonical URLs and language alternatives |

## Examples

### Public Landing Page

```tsx
export const metadata: Metadata = {
  title: "Accueil | TutorApp",
  description:
    "TutorApp - La plateforme de tutorat qui connecte étudiants et tuteurs. Trouvez votre tuteur idéal ou proposez vos services de tutorat.",
  keywords:
    "tutorat, cours particuliers, soutien scolaire, étudiants, tuteurs, TutorApp",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Accueil | TutorApp",
    description:
      "TutorApp - La plateforme de tutorat qui connecte étudiants et tuteurs. Trouvez votre tuteur idéal ou proposez vos services de tutorat.",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Accueil | TutorApp",
    description:
      "TutorApp - La plateforme de tutorat qui connecte étudiants et tuteurs. Trouvez votre tuteur idéal ou proposez vos services de tutorat.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://tutorapp.com",
  },
};
```

### Private Pages (noindex)

```tsx
export const metadata: Metadata = {
  title: "Connexion | TutorApp",
  description:
    "Connectez-vous à votre compte TutorApp pour accéder à votre tableau de bord et gérer vos cours.",
  keywords: "connexion, login, compte, TutorApp",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Connexion | TutorApp",
    description:
      "Connectez-vous à votre compte TutorApp pour accéder à votre tableau de bord et gérer vos cours.",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Connexion | TutorApp",
    description:
      "Connectez-vous à votre compte TutorApp pour accéder à votre tableau de bord et gérer vos cours.",
    images: ["/logo.png"],
  },
};
```

### Dashboard Pages

```tsx
export const metadata: Metadata = {
  title: "Tableau de bord Tuteur | TutorApp",
  description:
    "Gérez vos cours, étudiants et revenus depuis votre tableau de bord tuteur. Planifiez vos leçons et suivez vos performances.",
  keywords: "tableau de bord, tuteur, cours, étudiants, revenus, TutorApp",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Tableau de bord Tuteur | TutorApp",
    description:
      "Gérez vos cours, étudiants et revenus depuis votre tableau de bord tuteur. Planifiez vos leçons et suivez vos performances.",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Tableau de bord Tuteur | TutorApp",
    description:
      "Gérez vos cours, étudiants et revenus depuis votre tableau de bord tuteur. Planifiez vos leçons et suivez vos performances.",
    images: ["/logo.png"],
  },
};
```

## Handling Client Components

If your page is a Client Component (uses `"use client"`), you need to split it into two files:

### 1. Server Component (page.tsx)

```tsx
import type { Metadata } from "next";
import MyPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Page Title | TutorApp",
  description: "Page description",
  robots: {
    index: false, // for private pages
    follow: false, // for private pages
  },
  // ... other metadata
};

export default function MyPage() {
  return <MyPageClient />;
}
```

### 2. Client Component (page-client.tsx)

```tsx
"use client";

import { useAuth } from "@/context/AuthContext";
// ... other imports

export default function MyPageClient() {
  const { user } = useAuth();
  // ... your client-side logic

  return <div>{/* Your page content */}</div>;
}
```

## Best Practices

1. **Always include title and description** - These are the most important SEO elements
2. **Use robots: { index: false } for private pages** - Dashboard pages, login/register pages should not be indexed
3. **Keep descriptions under 160 characters** - This is the typical limit for search engine snippets
4. **Use relevant keywords** - Include important terms naturally in the description
5. **Set canonical URLs for public pages** - Helps prevent duplicate content issues
6. **Use appropriate Open Graph types** - "website" for general pages, "article" for content, "profile" for user profiles
7. **Split Client Components** - If your page needs to be a Client Component, create a separate Server Component for metadata
8. **Consistent branding** - Always include "| TutorApp" in titles for brand consistency

## Generated Meta Tags

The metadata API automatically generates:

- Basic meta tags (title, description, viewport, favicon)
- Keywords meta tag
- Robots meta tag (based on robots property)
- Canonical link (if alternates.canonical is provided)
- Open Graph tags (title, description, type, image, site_name, locale)
- Twitter Card tags (card type, title, description, image)
- Application meta tags (name, theme-color)

## Integration with Next.js App Router

The system uses Next.js 13+ App Router's metadata API, which provides:

- **Server-side rendering** - Metadata is generated on the server
- **Automatic deduplication** - No duplicate meta tags
- **Layout inheritance** - Child pages inherit parent layout metadata
- **Dynamic metadata** - Can be generated based on props or data
- **Type safety** - Full TypeScript support with Metadata type

## Important Notes

- **Client Components**: The metadata export must be in a Server Component. If your page is a Client Component, you'll need to create a separate Server Component wrapper.
- **Layout Override**: Layout files can override page metadata. Make sure your page metadata is more specific than layout metadata.
- **Dynamic Metadata**: For dynamic metadata based on data, use the `generateMetadata` function instead of the `metadata` export.
- **Error Handling**: The error you encountered was because metadata exports are not allowed in Client Components. Always use Server Components for metadata.
