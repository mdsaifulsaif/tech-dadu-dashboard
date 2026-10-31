import { ICategory } from "./category";

export interface IAffiliateLink {
  platform: "amazon" | "aliexpress" | "official" | "other";
  url: string;
  isPrimary: boolean;
}

export interface IProductPrice {
  amount: number;
  currency: string;
  formatted?: string;
}

export interface IProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface IProduct {
  _id: string;
  title: string;
  slug: string;
  category: ICategory | string;
  images: string[];
  shortSummary: string;
  description: string;
  price: IProductPrice;
  affiliateLinks: IAffiliateLink[];
  rating: number;
  pros: string[];
  cons: string[];
  badges: string[];
  isFeatured: boolean;
  status: "draft" | "published";
  clickCount: number;
  seo?: IProductSEO;
  createdAt: string;
  updatedAt: string;
}

export interface IProductInput {
  title: string;
  slug?: string;
  category: string;
  images: string[];
  shortSummary: string;
  description: string;
  price: {
    amount: number;
    currency?: string;
    formatted?: string;
  };
  affiliateLinks: IAffiliateLink[];
  rating?: number;
  pros?: string[];
  cons?: string[];
  badges?: string[];
  isFeatured?: boolean;
  status?: "draft" | "published";
  seo?: IProductSEO;
}

export interface IDigitalProduct {
  _id: string;
  title: string;
  slug: string;
  category: ICategory | string;
  shortSummary?: string;
  description: string;
  features: string[];
  techStack: string[];
  price: number;
  isFree: boolean;
  liveDemoUrl: string;
  purchaseUrl: string;
  previewImages: string[];
  downloadCount: number;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface IDigitalProductInput {
  title: string;
  slug?: string;
  category: string;
  shortSummary?: string;
  description: string;
  features: string[];
  techStack: string[];
  price: number;
  isFree?: boolean;
  liveDemoUrl: string;
  purchaseUrl: string;
  previewImages: string[];
  status?: "draft" | "published";
}

export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: { _id: string; name: string; avatar?: string } | string;
  category: ICategory | string;
  tags: string[];
  linkedProducts?: (IProduct | string)[];
  readingTime?: number;
  views: number;
  status: "draft" | "published";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBlogInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags?: string[];
  linkedProducts?: string[];
  status?: "draft" | "published";
}

export interface ISubscriber {
  _id: string;
  email: string;
  source: string;
  status: "subscribed" | "unsubscribed";
  createdAt: string;
  updatedAt: string;
}

export interface ISiteSettings {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl?: string;
  faviconUrl?: string;
  defaultOgImage?: string;
  socialLinks?: {
    pinterest?: string;
    github?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
  };
  analytics?: {
    gtmId?: string;
    gaId?: string;
    metaPixelId?: string;
    pinterestTagId?: string;
    pinterestVerification?: string;
    googleVerification?: string;
  };
  announcement?: {
    enabled?: boolean;
    text?: string;
    link?: string;
  };
}

