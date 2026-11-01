"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { categoryApi, triggerFrontendRevalidation } from "@/lib/api";
import { ICategory, ICategoryInput } from "@/types/category";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.user?.accessToken as string | undefined;

  // Filter States
  const [activeType, setActiveType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Alert Messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  // Form State
  const [formData, setFormData] = useState<ICategoryInput>({
    name: "",
    slug: "",
    description: "",
    icon: "⚡",
    image: "",
    type: "product",
    order: 0,
    showInHero: false,
    isDefaultHero: false,
  });

  // 1. TanStack Query: Fetch categories with automatic caching and invalidation
  const {
    data: categories = [],
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery<ICategory[]>({
    queryKey: ["categories", activeType],
    queryFn: async () => {
      const res = await categoryApi.getAll(activeType);
      return res.data || [];
    },
  });

  // 2. TanStack Mutation: Create Category
  const createMutation = useMutation({
    mutationFn: (newCategory: ICategoryInput) => categoryApi.create(newCategory, token),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      triggerFrontendRevalidation("/");
      setIsModalOpen(false);
      setSuccessMsg(`Category "${res.data?.name || formData.name}" created successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to create category");
    },
  });

  // 3. TanStack Mutation: Update Category
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICategoryInput> }) =>
      categoryApi.update(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      triggerFrontendRevalidation("/");
      setIsModalOpen(false);
      setSuccessMsg(`Category updated successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to update category");
    },
  });

  // 4. TanStack Mutation: Delete Category
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      triggerFrontendRevalidation("/");
      setSuccessMsg("Category deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: Error) => {
      alert(err.message || "Failed to delete category");
    },
  });

  // Instant Toggle: Show in Hero
  const handleToggleHero = (cat: ICategory) => {
    updateMutation.mutate({
      id: cat._id,
      data: { showInHero: !cat.showInHero },
    });
  };

  // Instant Toggle: Set Default Hero Tab
  const handleSetDefaultHero = (cat: ICategory) => {
    updateMutation.mutate({
      id: cat._id,
      data: { isDefaultHero: !cat.isDefaultHero, showInHero: true },
    });
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "⚡",
      image: "",
      type: "product",
      order: categories.length + 1,
      showInHero: true,
      isDefaultHero: false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: ICategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon || "⚡",
      image: cat.image || "",
      type: cat.type,
      order: cat.order ?? 0,
      showInHero: Boolean(cat.showInHero),
      isDefaultHero: Boolean(cat.isDefaultHero),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Category name is required");
      return;
    }

    setFormError(null);

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Handle Delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filtered by Search & Sorted by Display Order
  const filteredCategories = useMemo(() => {
    return categories
      .filter((c: ICategory) => {
        return (
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a: ICategory, b: ICategory) => (a.order ?? 0) - (b.order ?? 0));
  }, [categories, searchQuery]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-theme-primary-light text-theme-primary flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-theme-fg">
              Categories Management
            </h1>
            {isFetching && !isLoading && (
              <span title="Syncing...">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-theme-muted" />
              </span>
            )}
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Real-time categorized taxonomy with Hero Comparison Table controls.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-theme-success/15 border border-emerald-500/20 text-theme-success text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Query Error Alert */}
      {queryError && (
        <div className="p-3.5 rounded-xl bg-theme-danger text-theme-danger border border-red-200 dark:border-red-900/50 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{queryError instanceof Error ? queryError.message : "Failed to fetch categories"}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="underline font-semibold hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div className="card-surface p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Categories" },
            { id: "product", label: "Products / Gear" },
            { id: "template", label: "Templates" },
            { id: "blog", label: "Blogs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeType === tab.id
                  ? "bg-theme-primary text-theme-primary-fg shadow-sm"
                  : "text-theme-muted hover:text-theme-fg hover:bg-theme-surface-hover"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="input-theme input-icon-left text-xs py-1.5 w-full"
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
      </div>

      {/* Categories Table */}
      {isLoading ? (
        <div className="card-surface p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary mx-auto mb-3" />
          <p className="text-xs text-theme-muted">Loading categories with TanStack Query...</p>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="card-surface rounded-2xl overflow-hidden border border-theme-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-theme-bg/60 border-b border-theme-border text-theme-muted uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Applies To</th>
                  <th className="py-3 px-4 text-center">Hero Control</th>
                  <th className="py-3 px-4 text-center">Display Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {filteredCategories.map((cat: ICategory) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-theme-surface-hover/50 transition-colors"
                  >
                    {/* Name & Icon */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-theme-bg border border-theme-border flex items-center justify-center text-sm shadow-xs">
                          {cat.icon || "🏷️"}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-theme-fg">{cat.name}</p>
                            {cat.isDefaultHero && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>Default</span>
                              </span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-[11px] text-theme-muted line-clamp-1 max-w-xs">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-theme-muted">
                      /{cat.slug}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          cat.type === "product"
                            ? "bg-theme-primary-light text-theme-primary border-theme-primary/20"
                            : cat.type === "template"
                            ? "bg-theme-secondary-light text-theme-secondary border-theme-secondary/20"
                            : cat.type === "blog"
                            ? "bg-amber-500/10 text-theme-accent border-amber-500/20"
                            : "bg-theme-bg text-theme-muted border-theme-border"
                        }`}
                      >
                        {cat.type}
                      </span>
                    </td>

                    {/* Hero Control (Toggle Show in Hero & Default) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggleHero(cat)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                            cat.showInHero
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs"
                              : "bg-theme-bg text-theme-muted border-theme-border hover:text-theme-fg"
                          }`}
                          title={cat.showInHero ? "Showing in Hero comparison" : "Hidden from Hero"}
                        >
                          {cat.showInHero ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-500" />
                              <span>In Hero</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-theme-muted" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetDefaultHero(cat)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            cat.isDefaultHero
                              ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                              : "border-theme-border text-theme-muted hover:text-amber-500 hover:border-amber-500/40"
                          }`}
                          title={cat.isDefaultHero ? "Current default tab" : "Make default tab"}
                        >
                          <Star className={`w-3.5 h-3.5 ${cat.isDefaultHero ? "fill-amber-500" : ""}`} />
                        </button>
                      </div>
                    </td>

                    {/* Order (Editable Display Value) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        <span className="text-theme-muted font-bold text-xs">#</span>
                        <input
                          type="number"
                          key={`order-${cat._id}-${cat.order}`}
                          defaultValue={cat.order ?? 0}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val !== (cat.order ?? 0)) {
                              updateMutation.mutate({
                                id: cat._id,
                                data: { order: val },
                              });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-14 text-center py-1 px-1.5 rounded-lg border border-theme-border bg-theme-bg font-extrabold text-xs text-theme-fg focus:border-theme-primary focus:ring-1 focus:ring-theme-primary outline-none transition-all shadow-2xs"
                          title="Display order value (lower number appears first in hero)"
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-surface-hover hover:text-theme-primary text-theme-muted transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-danger hover:text-white text-theme-muted transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card-surface p-12 text-center rounded-2xl max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-theme-primary-light text-theme-primary flex items-center justify-center mx-auto mb-3">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-theme-fg mb-1">No Categories Found</h3>
          <p className="text-xs text-theme-muted mb-5">
            {searchQuery
              ? `No categories matching "${searchQuery}".`
              : "Create your first category to organize desk gear, templates, and blog posts."}
          </p>
          <button onClick={handleOpenAdd} className="btn-primary text-xs py-2 px-4 shadow-sm">
            Create First Category
          </button>
        </div>
      )}

      {/* Modal: Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card-surface w-full max-w-md rounded-2xl p-6 sm:p-7 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-theme-border">
              <h2 className="text-base font-bold text-theme-fg flex items-center gap-2">
                <span>{editingCategory ? "Edit Category" : "Add New Category"}</span>
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
              {/* Category Name */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mechanical Keyboards"
                  className="input-theme text-xs py-2"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Slug (Auto-generated if left empty)
                </label>
                <input
                  type="text"
                  value={formData.slug || ""}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. mechanical-keyboards"
                  className="input-theme text-xs py-2 font-mono"
                />
              </div>

              {/* Grid: Type & Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Applies To (Type)
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "product" | "blog" | "template" | "all",
                      })
                    }
                    className="input-theme text-xs py-2 cursor-pointer"
                  >
                    <option value="product">Product / Gear</option>
                    <option value="template">Template</option>
                    <option value="blog">Blog / Guide</option>
                    <option value="all">Universal (All)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Display Order (Hero position)
                  </label>
                  <input
                    type="number"
                    value={formData.order ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, order: Number(e.target.value) })
                    }
                    className="input-theme text-xs py-2"
                  />
                </div>
              </div>

              {/* Hero Showcase Controls */}
              <div className="p-3.5 rounded-xl bg-theme-bg border border-theme-border space-y-3">
                <span className="font-bold text-theme-fg block text-[11px] uppercase tracking-wider">
                  Hero Section Visibility
                </span>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-theme-fg block">Show in Hero Tab Bar</span>
                    <span className="text-[11px] text-theme-muted">
                      Display this category as a pill in the homepage comparison switcher
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.showInHero)}
                    onChange={(e) =>
                      setFormData({ ...formData, showInHero: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-theme-primary accent-theme-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-theme-border">
                  <div>
                    <span className="font-semibold text-theme-fg block">Default Selected Hero Tab</span>
                    <span className="text-[11px] text-theme-muted">
                      Open this category automatically when visitors land on the homepage
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isDefaultHero)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isDefaultHero: e.target.checked,
                        showInHero: e.target.checked ? true : formData.showInHero,
                      })
                    }
                    className="w-4 h-4 rounded text-theme-primary accent-theme-primary cursor-pointer"
                  />
                </label>
              </div>

              {/* Icon Emoji */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Category Emoji / Icon
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.icon || ""}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g. ⌨️ or 🖱️ or 💻"
                    className="input-theme text-xs py-2 max-w-[120px] text-center text-base"
                  />
                  <span className="text-[11px] text-theme-muted">
                    Quick picks:
                  </span>
                  <div className="flex gap-1 text-sm">
                    {["⌨️", "🖱️", "💻", "🎧", "💡", "⚡", "📦"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className="p-1 rounded hover:bg-theme-surface-hover"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Short description for SEO and cards..."
                  className="input-theme text-xs py-2 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-theme-border">
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
                  <span>{editingCategory ? "Update Category" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
