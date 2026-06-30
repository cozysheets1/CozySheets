export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string; // Category ID
  version: string;
  features: string[];
  thumbnail: string;
  screenshots: string[];
  demoLink?: string;
  buyLink: string;
  status: 'Published' | 'Draft' | 'Archived';
  tags: string[];
  changelog: { version: string; date: string; changes: string[] }[];
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  category: string; // Category ID or Name
  status: 'Published' | 'Draft';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
}

export interface TrashItem {
  id: string;
  type: 'product' | 'blog' | 'category';
  originalData: any;
  deletedAt: string;
}

export interface SiteSettings {
  siteName: string;
  logo: string;
  primaryColor: string;
  footerText: string;
  aboutText: string;
  contactDetails: {
    facebook: string;
    messenger: string;
    email: string;
    phone: string;
    twitter?: string;
    github?: string;
  };
  seo: {
    pageTitle: string;
    description: string;
    keywords: string;
  };
}

export type CurrencyCode = 'USD' | 'PHP' | 'EUR' | 'GBP';

export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  PHP: { symbol: '₱', rate: 58.0, label: 'PHP (₱)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)' },
};

export function formatCurrency(amountInUsd: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  const converted = amountInUsd * config.rate;
  return `${config.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

