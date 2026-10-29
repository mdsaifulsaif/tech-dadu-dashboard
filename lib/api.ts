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

// Category API Endpoints
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
