"use client";

import { useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Laptop,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  Star,
  ExternalLink,
  Upload,
  Sparkles,
  DollarSign,
  Eye,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { productApi, categoryApi, uploadApi } from "@/lib/api";
import { IProduct, IProductInput } from "@/types";
import { ICategory } from "@/types/category";
import { ImageGalleryManager } from "@/components/common/ImageGalleryManager";
import { RichTextEditor } from "@/components/common/RichTextEditor";

export default function ProductsAdminPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string | undefined;

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<IProductInput>({
    title: "",
    slug: "",
    category: "",
    images: [],
    shortSummary: "",
    description: "",
    price: {
      amount: 0,
      currency: "USD",
      formatted: "$0.00",
    },
    affiliateLinks: [{ platform: "amazon", url: "", isPrimary: true }],
    rating: 4.8,
    pros: [],
    cons: [],
    badges: ["Top Pick"],
    isFeatured: false,
    status: "published",
  });

  // String helpers for arrays in form
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [proInput, setProInput] = useState("");
  const [conInput, setConInput] = useState("");
  const [badgeInput, setBadgeInput] = useState("");

  // 1. Fetch Categories for Dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "product"],
    queryFn: async () => {
      const res = await categoryApi.getAll("product");
      return res.data || [];
    },
  });

  // 2. Fetch Products with TanStack Query
  const {
    data: productsData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["admin-products", selectedCategory, selectedStatus, searchQuery, page],
    queryFn: async () => {
      const res = await productApi.getAll({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      return res.data;
    },
  });

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  // 3. Create Product Mutation
  const createMutation = useMutation({
    mutationFn: (newProduct: IProductInput) => productApi.create(newProduct, token),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setIsModalOpen(false);
      setSuccessMsg(`Product "${res.data?.title}" created successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || "Failed to create product");
    },
  });

  // 4. Update Product Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IProductInput> }) =>
      productApi.update(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setIsModalOpen(false);
      setSuccessMsg("Product updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || "Failed to update product");
    },
  });

  // 5. Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setSuccessMsg("Product deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      alert(err?.message || "Failed to delete product");
    },
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      slug: "",
      category: categories[0]?._id || "",
      images: [],
      shortSummary: "",
      description: "",
      price: { amount: 79.99, currency: "USD", formatted: "$79.99" },
      affiliateLinks: [{ platform: "amazon", url: "", isPrimary: true }],
      rating: 4.8,
      pros: ["Ergonomic design", "Wireless connectivity"],
      cons: ["Slightly heavier"],
      badges: ["Top Pick"],
      isFeatured: false,
      status: "published",
    });
    setImageUrlInput("");
    setProInput("");
    setConInput("");
    setBadgeInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (prod: IProduct) => {
    setEditingProduct(prod);
    const catId = typeof prod.category === "object" ? prod.category._id : prod.category;
    setFormData({
      title: prod.title,
      slug: prod.slug,
      category: catId,
      images: prod.images || [],
      shortSummary: prod.shortSummary || "",
      description: prod.description || "",
      price: {
        amount: prod.price?.amount || 0,
        currency: prod.price?.currency || "USD",
        formatted: prod.price?.formatted || `$${prod.price?.amount || 0}`,
      },
      affiliateLinks: prod.affiliateLinks?.length
        ? prod.affiliateLinks
        : [{ platform: "amazon", url: "", isPrimary: true }],
      rating: prod.rating || 5,
      pros: prod.pros || [],
      cons: prod.cons || [],
      badges: prod.badges || [],
      isFeatured: prod.isFeatured || false,
      status: prod.status || "published",
    });
    setImageUrlInput("");
    setProInput("");
    setConInput("");
    setBadgeInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Cloudinary image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);
    try {
      const uploaded = await uploadApi.uploadSingle(file, token, "tech-dadu/products");
      if (uploaded.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, uploaded.url],
        }));
      }
    } catch (err: any) {
      setFormError(err?.message || "Failed to upload image to Cloudinary");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add image URL manually
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput("");
  };

  // Remove image from gallery
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Product title is required");
      return;
    }
    if (!formData.category) {
      setFormError("Please select a category");
      return;
    }
    if (formData.images.length === 0) {
      setFormError("Please add at least one product image");
      return;
    }
    if (!formData.affiliateLinks[0]?.url) {
      setFormError("Please provide an affiliate URL");
      return;
    }

    setFormError(null);

    // Auto format price
    const submissionData = {
      ...formData,
      price: {
        ...formData.price,
        formatted: formData.price.formatted || `$${formData.price.amount}`,
      },
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: submissionData });
    } else {
      createMutation.mutate(submissionData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-theme-primary-light text-theme-primary flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-theme-fg">
              Products & Desk Gear
            </h1>
            {isFetching && !isLoading && (
              <span title="Syncing...">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-theme-muted" />
              </span>
            )}
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Manage affiliate tech gear, keyboards, monitors, and track outbound affiliate clicks.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-theme-success/15 border border-emerald-500/20 text-theme-success text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="card-surface p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search products by title..."
            className="input-theme input-icon-left text-xs py-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-fg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category & Status Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="input-theme text-xs py-2 px-3 cursor-pointer w-auto"
          >
            <option value="all">All Categories</option>
            {categories.map((cat: ICategory) => (
              <option key={cat._id} value={cat.slug || cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="input-theme text-xs py-2 px-3 cursor-pointer w-auto"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="card-surface p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary mx-auto mb-3" />
          <p className="text-xs text-theme-muted">Loading desk gear catalog...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="card-surface rounded-2xl overflow-hidden border border-theme-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-theme-bg/60 border-b border-theme-border text-theme-muted uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Affiliate Clicks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {products.map((prod: IProduct) => {
                  const catName =
                    typeof prod.category === "object" && prod.category?.name
                      ? prod.category.name
                      : "Desk Gear";
                  const mainImg = prod.images?.[0] || "/next.svg";

                  return (
                    <tr key={prod._id} className="hover:bg-theme-surface-hover/50 transition-colors">
                      {/* Product Name & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={mainImg}
                            alt={prod.title}
                            className="w-10 h-10 rounded-lg object-cover bg-theme-bg border border-theme-border shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-theme-fg line-clamp-1 max-w-xs">
                                {prod.title}
                              </p>
                              {prod.isFeatured && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-theme-accent border border-amber-500/30">
                                  Top Pick
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-theme-muted">
                              /{prod.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-theme-muted">{catName}</span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-theme-fg">
                        {prod.price?.formatted || `$${prod.price?.amount || 0}`}
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{prod.rating?.toFixed(1) || "5.0"}</span>
                        </div>
                      </td>

                      {/* Click Count */}
                      <td className="py-3.5 px-4 font-bold text-theme-primary">
                        {prod.clickCount || 0} clicks
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            prod.status === "published"
                              ? "bg-theme-success/15 text-theme-success border-emerald-500/20"
                              : "bg-theme-bg text-theme-muted border-theme-border"
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-surface-hover hover:text-theme-primary text-theme-muted transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete product "${prod.title}"?`)) {
                                deleteMutation.mutate(prod._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-danger hover:text-white text-theme-muted transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pagination && pagination.pages > 1 && (
            <div className="p-4 border-t border-theme-border flex items-center justify-between text-xs text-theme-muted">
              <span>
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} items)
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-outline text-xs py-1 px-3 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={!pagination.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-outline text-xs py-1 px-3 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card-surface p-12 text-center rounded-2xl max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-theme-primary-light text-theme-primary flex items-center justify-center mx-auto mb-3">
            <Laptop className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-theme-fg mb-1">No Products Found</h3>
          <p className="text-xs text-theme-muted mb-5">
            {searchQuery
              ? `No gear matching "${searchQuery}".`
              : "Add your first affiliate tech product to start monetizing."}
          </p>
          <button onClick={handleOpenAdd} className="btn-primary text-xs py-2 px-4 shadow-sm">
            Add First Product
          </button>
        </div>
      )}

      {/* Modal: Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="card-surface w-full max-w-4xl rounded-2xl p-6 sm:p-8 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-theme-border sticky top-0 bg-theme-surface z-10">
              <h2 className="text-base font-bold text-theme-fg flex items-center gap-2">
                <span>{editingProduct ? "Edit Desk Gear Product" : "Add New Desk Gear"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-theme-muted hover:text-theme-fg p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-theme-danger text-theme-danger border border-red-200 dark:border-red-900/50 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Keychron K2 Wireless Keyboard"
                    className="input-theme text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Slug (Auto if empty)
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. keychron-k2-wireless-keyboard"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>
              </div>

              {/* Category & Status & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-theme text-xs py-2 cursor-pointer"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c: ICategory) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "draft" | "published" })
                    }
                    className="input-theme text-xs py-2 cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-theme-primary cursor-pointer"
                  />
                  <label htmlFor="isFeatured" className="font-semibold text-theme-fg cursor-pointer">
                    Saif&apos;s Top Pick ⭐
                  </label>
                </div>
              </div>

              {/* Price & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Price Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price.amount}
                    onChange={(e) => {
                      const amount = Number(e.target.value);
                      setFormData({
                        ...formData,
                        price: {
                          ...formData.price,
                          amount,
                          formatted: `$${amount.toFixed(2)}`,
                        },
                      });
                    }}
                    className="input-theme text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Formatted Price Text
                  </label>
                  <input
                    type="text"
                    value={formData.price.formatted || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: { ...formData.price, formatted: e.target.value },
                      })
                    }
                    placeholder="e.g. $79.99"
                    className="input-theme text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Star Rating (1.0 to 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating ?? 4.8}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: Number(e.target.value) })
                    }
                    className="input-theme text-xs py-2"
                  />
                </div>
              </div>

              {/* Affiliate Link */}
              <div className="p-3 rounded-xl bg-theme-bg border border-theme-border space-y-2">
                <span className="font-semibold uppercase tracking-wider text-theme-fg block">
                  Primary Affiliate Link *
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={formData.affiliateLinks[0]?.platform || "amazon"}
                    onChange={(e) => {
                      const platform = e.target.value as any;
                      setFormData({
                        ...formData,
                        affiliateLinks: [{ ...formData.affiliateLinks[0], platform, isPrimary: true }],
                      });
                    }}
                    className="input-theme text-xs py-2 cursor-pointer"
                  >
                    <option value="amazon">Amazon Affiliate</option>
                    <option value="aliexpress">AliExpress</option>
                    <option value="official">Official Brand Store</option>
                    <option value="other">Other Platform</option>
                  </select>

                  <div className="sm:col-span-2">
                    <input
                      type="url"
                      required
                      value={formData.affiliateLinks[0]?.url || ""}
                      onChange={(e) => {
                        const url = e.target.value;
                        setFormData({
                          ...formData,
                          affiliateLinks: [{ ...formData.affiliateLinks[0], url, isPrimary: true }],
                        });
                      }}
                      placeholder="https://amazon.com/dp/B07.../?tag=yourtag-20"
                      className="input-theme text-xs py-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Images: Interactive Gallery & Main Thumbnail Manager */}
              <ImageGalleryManager
                images={formData.images}
                onChange={(images) => setFormData((p) => ({ ...p, images }))}
                onUpload={async (file) => {
                  try {
                    const uploaded = await uploadApi.uploadSingle(file, token, "tech-dadu/products");
                    return uploaded.url || null;
                  } catch (err: any) {
                    setFormError(err?.message || "Failed to upload image");
                    return null;
                  }
                }}
                isUploading={uploadingImage}
                label="Product Images / Gallery"
                required
              />

              {/* Short Summary */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Short Bullet Summary *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shortSummary}
                  onChange={(e) => setFormData({ ...formData, shortSummary: e.target.value })}
                  placeholder="e.g. Wireless mechanical keyboard with 75% compact layout and hot-swappable switches."
                  className="input-theme text-xs py-2"
                />
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pros */}
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-success mb-1">
                    Pros (Selling Points)
                  </label>
                  <div className="flex gap-1.5 mb-1.5">
                    <input
                      type="text"
                      value={proInput}
                      onChange={(e) => setProInput(e.target.value)}
                      placeholder="e.g. Long battery life"
                      className="input-theme text-xs py-1.5"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (proInput.trim()) {
                            setFormData((p) => ({ ...p, pros: [...(p.pros || []), proInput.trim()] }));
                            setProInput("");
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (proInput.trim()) {
                          setFormData((p) => ({ ...p, pros: [...(p.pros || []), proInput.trim()] }));
                          setProInput("");
                        }
                      }}
                      className="btn-outline text-xs px-2.5 py-1"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.pros?.map((pro, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-theme-success text-[10px] inline-flex items-center gap-1"
                      >
                        {pro}
                        <X
                          className="w-2.5 h-2.5 cursor-pointer"
                          onClick={() =>
                            setFormData((p) => ({ ...p, pros: p.pros?.filter((_, idx) => idx !== i) }))
                          }
                        />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cons */}
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-danger mb-1">
                    Honest Cons
                  </label>
                  <div className="flex gap-1.5 mb-1.5">
                    <input
                      type="text"
                      value={conInput}
                      onChange={(e) => setConInput(e.target.value)}
                      placeholder="e.g. No 2.4GHz dongle"
                      className="input-theme text-xs py-1.5"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (conInput.trim()) {
                            setFormData((p) => ({ ...p, cons: [...(p.cons || []), conInput.trim()] }));
                            setConInput("");
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (conInput.trim()) {
                          setFormData((p) => ({ ...p, cons: [...(p.cons || []), conInput.trim()] }));
                          setConInput("");
                        }
                      }}
                      className="btn-outline text-xs px-2.5 py-1"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.cons?.map((con, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-red-500/10 text-theme-danger text-[10px] inline-flex items-center gap-1"
                      >
                        {con}
                        <X
                          className="w-2.5 h-2.5 cursor-pointer"
                          onClick={() =>
                            setFormData((p) => ({ ...p, cons: p.cons?.filter((_, idx) => idx !== i) }))
                          }
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rich Text Editor for Detailed Review / Description */}
              <RichTextEditor
                label="Detailed Review / In-Depth Verdict"
                required
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder="In-depth analysis, build quality, typing sound, ergonomics, insert images, links, or bullet points..."
                rows={8}
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-theme-border sticky bottom-0 bg-theme-surface z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline text-xs py-2 px-3.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? "Update Product" : "Save Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
