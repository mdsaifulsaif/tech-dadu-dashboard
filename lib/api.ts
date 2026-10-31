import {
  IProduct,
  IProductInput,
  IDigitalProduct,
  IDigitalProductInput,
  IBlog,
  IBlogInput,
  ISubscriber,
  ISiteSettings,
} from "@/types";
import { ICategory, ICategoryInput } from "@/types/category";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: "Network error or invalid server response",
  }));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// ============================================================================
// 1. Categories API
// ============================================================================
export const categoryApi = {
  getAll: (type?: string) => {
    const query = type && type !== "all" ? `?type=${type}` : "";
    return apiRequest<ICategory[]>(`/categories${query}`);
  },

  getBySlug: (slug: string) => apiRequest<ICategory>(`/categories/${slug}`),

  create: (data: ICategoryInput, token?: string) =>
    apiRequest<ICategory>(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    ),

  update: (id: string, data: Partial<ICategoryInput>, token?: string) =>
    apiRequest<ICategory>(
      `/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ),

  delete: (id: string, token?: string) =>
    apiRequest<{ message: string; deletedId: string }>(
      `/categories/${id}`,
      {
        method: "DELETE",
      },
      token
    ),
};

// ============================================================================
// 2. Products / Desk Gear API
// ============================================================================
export const productApi = {
  getAll: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return apiRequest<{
      products: IProduct[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasMore: boolean;
      };
    }>(`/products${queryString ? `?${queryString}` : ""}`);
  },

  getById: (id: string) => apiRequest<IProduct>(`/products/id/${id}`),

  create: (data: IProductInput, token?: string) =>
    apiRequest<IProduct>(
      "/products",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    ),

  update: (id: string, data: Partial<IProductInput>, token?: string) =>
    apiRequest<IProduct>(
      `/products/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ),

  delete: (id: string, token?: string) =>
    apiRequest<{ message: string; deletedId: string }>(
      `/products/${id}`,
      {
        method: "DELETE",
      },
      token
    ),
};

// ============================================================================
// 3. Digital Templates / Boilerplates API
// ============================================================================
export const templateApi = {
  getAll: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return apiRequest<{
      products: IDigitalProduct[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasMore: boolean;
      };
    }>(`/templates${queryString ? `?${queryString}` : ""}`);
  },

  getById: (id: string) => apiRequest<IDigitalProduct>(`/templates/id/${id}`),

  create: (data: IDigitalProductInput, token?: string) =>
    apiRequest<IDigitalProduct>(
      "/templates",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    ),

  update: (id: string, data: Partial<IDigitalProductInput>, token?: string) =>
    apiRequest<IDigitalProduct>(
      `/templates/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ),

  delete: (id: string, token?: string) =>
    apiRequest<{ message: string; deletedId: string }>(
      `/templates/${id}`,
      {
        method: "DELETE",
      },
      token
    ),
};

// ============================================================================
// 4. Guides & Blogs API
// ============================================================================
export const blogApi = {
  getAll: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return apiRequest<{
      blogs: IBlog[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasMore: boolean;
      };
    }>(`/blogs${queryString ? `?${queryString}` : ""}`);
  },

  getById: (id: string) => apiRequest<IBlog>(`/blogs/id/${id}`),

  create: (data: IBlogInput, token?: string) =>
    apiRequest<IBlog>(
      "/blogs",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    ),

  update: (id: string, data: Partial<IBlogInput>, token?: string) =>
    apiRequest<IBlog>(
      `/blogs/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ),

  delete: (id: string, token?: string) =>
    apiRequest<{ message: string; deletedId: string }>(
      `/blogs/${id}`,
      {
        method: "DELETE",
      },
      token
    ),
};

// ============================================================================
// 5. Subscribers / Leads API
// ============================================================================
export const subscriberApi = {
  getAll: (page: number = 1, limit: number = 20, token?: string) =>
    apiRequest<{
      subscribers: ISubscriber[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
      };
    }>(`/newsletter?page=${page}&limit=${limit}`, {}, token),

  broadcast: (subject: string, content: string, token?: string) =>
    apiRequest<{ message: string; sentCount: number }>(
      "/newsletter/broadcast",
      {
        method: "POST",
        body: JSON.stringify({ subject, content }),
      },
      token
    ),
};

// ============================================================================
// 6. Site Settings API
// ============================================================================
export const siteSettingApi = {
  get: () => apiRequest<ISiteSettings>("/settings"),

  update: (data: Partial<ISiteSettings>, token?: string) =>
    apiRequest<ISiteSettings>(
      "/settings",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ),
};

// ============================================================================
// 7. Analytics API
// ============================================================================
export const analyticsApi = {
  getOverview: (token?: string) =>
    apiRequest<{
      counts: {
        products: number;
        templates: number;
        blogs: number;
        subscribers: number;
        clicks: number;
      };
      topProducts: IProduct[];
      platformBreakdown: { platform: string; count: number }[];
      referrerBreakdown: { referrer: string; count: number }[];
      recentClicks: any[];
    }>("/analytics/overview", {}, token),
};

// ============================================================================
// 8. Cloudinary Upload API
// ============================================================================
export const uploadApi = {
  uploadSingle: async (
    file: File,
    token?: string,
    folder: string = "tech-dadu"
  ): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/upload/single`, {
      method: "POST",
      headers,
      body: formData,
    });

    const res = await response.json();
    if (!response.ok || !res.success) {
      throw new Error(res.message || "Image upload failed");
    }

    return res.data;
  },
};
