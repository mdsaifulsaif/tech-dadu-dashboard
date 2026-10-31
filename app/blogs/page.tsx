"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Clock,
  Upload,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { blogApi, categoryApi, uploadApi } from "@/lib/api";
import { IBlog, IBlogInput } from "@/types";
import { ICategory } from "@/types/category";
import { RichTextEditor } from "@/components/common/RichTextEditor";

export default function BlogsAdminPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string | undefined;

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<IBlog | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<IBlogInput>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "",
    tags: ["desk setup", "productivity", "tech 2026"],
    status: "published",
  });

  const [tagInput, setTagInput] = useState("");

  // 1. Fetch Categories for Dropdown (Blogs)
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "blog"],
    queryFn: async () => {
      const res = await categoryApi.getAll("blog");
      return res.data || [];
    },
  });

  // 2. Fetch Blogs
  const {
    data: blogsData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["admin-blogs", selectedCategory, selectedStatus, searchQuery, page],
    queryFn: async () => {
      const res = await blogApi.getAll({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      return res.data;
    },
  });

  const blogs = blogsData?.blogs || [];
  const pagination = blogsData?.pagination;

  // 3. Create Mutation
  const createMutation = useMutation({
    mutationFn: (newBlog: IBlogInput) => blogApi.create(newBlog, token),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      setIsModalOpen(false);
      setSuccessMsg(`Article "${res.data?.title}" published successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || "Failed to publish article");
    },
  });

  // 4. Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IBlogInput> }) =>
      blogApi.update(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      setIsModalOpen(false);
      setSuccessMsg("Article updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || "Failed to update article");
    },
  });

  // 5. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      setSuccessMsg("Article deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      alert(err?.message || "Failed to delete article");
    },
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      category: categories[0]?._id || "",
      tags: ["desk setup", "developer gear", "productivity"],
      status: "published",
    });
    setTagInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (b: IBlog) => {
    setEditingBlog(b);
    const catId = typeof b.category === "object" ? b.category._id : b.category;
    setFormData({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || "",
      content: b.content || "",
      coverImage: b.coverImage || "",
      category: catId,
      tags: b.tags || [],
      status: b.status || "published",
    });
    setTagInput("");
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
      const uploaded = await uploadApi.uploadSingle(file, token, "tech-dadu/blogs");
      if (uploaded.url) {
        setFormData((prev) => ({ ...prev, coverImage: uploaded.url }));
      }
    } catch (err: any) {
      setFormError(err?.message || "Failed to upload cover image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Article title is required");
      return;
    }
    if (!formData.category) {
      setFormError("Please select a category");
      return;
    }
    if (!formData.coverImage) {
      setFormError("Please upload or provide a cover image");
      return;
    }
    if (!formData.excerpt.trim()) {
      setFormError("Please provide an excerpt summary for SEO");
      return;
    }
    if (!formData.content.trim()) {
      setFormError("Article content cannot be empty");
      return;
    }

    setFormError(null);

    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-theme-primary-light text-theme-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-theme-fg">
              Guides & SEO Blog Engine
            </h1>
            {isFetching && !isLoading && (
              <span title="Syncing...">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-theme-muted" />
              </span>
            )}
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Publish Top 10 listicles, setup guides, and reviews driving Google SEO & Pinterest referral traffic.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Write Article</span>
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
            placeholder="Search blogs by title or keyword..."
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

      {/* Blogs Table */}
      {isLoading ? (
        <div className="card-surface p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary mx-auto mb-3" />
          <p className="text-xs text-theme-muted">Loading articles catalog...</p>
        </div>
      ) : blogs.length > 0 ? (
        <div className="card-surface rounded-2xl overflow-hidden border border-theme-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-theme-bg/60 border-b border-theme-border text-theme-muted uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Read Time</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {blogs.map((b: IBlog) => {
                  const catName =
                    typeof b.category === "object" && b.category?.name
                      ? b.category.name
                      : "General";

                  return (
                    <tr key={b._id} className="hover:bg-theme-surface-hover/50 transition-colors">
                      {/* Title & Cover */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.coverImage || "/next.svg"}
                            alt={b.title}
                            className="w-12 h-9 rounded-lg object-cover bg-theme-bg border border-theme-border shrink-0"
                          />
                          <div>
                            <p className="font-bold text-theme-fg line-clamp-1 max-w-md">
                              {b.title}
                            </p>
                            <span className="text-[11px] font-mono text-theme-muted">
                              /blog/{b.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-semibold text-theme-muted">
                        {catName}
                      </td>

                      {/* Read Time */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-theme-muted">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{b.readingTime || 5} min read</span>
                        </span>
                      </td>

                      {/* Views */}
                      <td className="py-3.5 px-4 font-bold text-theme-fg">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-theme-primary" />
                          <span>{b.views || 0}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            b.status === "published"
                              ? "bg-theme-success/15 text-theme-success border-emerald-500/20"
                              : "bg-theme-bg text-theme-muted border-theme-border"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-surface-hover hover:text-theme-primary text-theme-muted transition-colors"
                            title="Edit Article"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete article "${b.title}"?`)) {
                                deleteMutation.mutate(b._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-danger hover:text-white text-theme-muted transition-colors"
                            title="Delete Article"
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

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="p-4 border-t border-theme-border flex items-center justify-between text-xs text-theme-muted">
              <span>
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} articles)
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
          <div className="w-12 h-12 rounded-xl bg-theme-primary-light text-theme-accent flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-theme-fg mb-1">No Articles Found</h3>
          <p className="text-xs text-theme-muted mb-5">
            {searchQuery
              ? `No articles matching "${searchQuery}".`
              : "Write your first SEO-optimized listicle or tech review."}
          </p>
          <button onClick={handleOpenAdd} className="btn-primary text-xs py-2 px-4 shadow-sm">
            Write First Article
          </button>
        </div>
      )}

      {/* Modal: Add / Edit Blog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="card-surface w-full max-w-4xl rounded-2xl p-6 sm:p-8 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-theme-border sticky top-0 bg-theme-surface z-10">
              <h2 className="text-base font-bold text-theme-fg flex items-center gap-2">
                <span>{editingBlog ? "Edit Article" : "Write New SEO Article"}</span>
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
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Top 10 Minimal Desk Accessories for Developers (2026)"
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
                    placeholder="e.g. top-10-minimal-desk-accessories-2026"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              {/* Cover Image */}
              <div className="p-3 rounded-xl bg-theme-bg border border-theme-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wider text-theme-fg">
                    Cover Image (16:9 or Vertical for Pinterest) *
                  </span>
                  <label className="btn-outline text-xs py-1 px-3 cursor-pointer inline-flex items-center gap-1.5">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Upload from Computer"}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Or paste cover image URL..."
                  className="input-theme text-xs py-1.5"
                />

                {formData.coverImage && (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden border border-theme-border">
                    <img
                      src={formData.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Excerpt / Search Meta Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Engaging summary for Google SEO search snippets and social cards..."
                  className="input-theme text-xs py-2 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Tags (SEO & Filters)
                </label>
                <div className="flex gap-1.5 mb-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g. keyboards, desk setup, coding (press Enter)"
                    className="input-theme text-xs py-1.5"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (tagInput.trim()) {
                          setFormData((p) => ({ ...p, tags: [...(p.tags || []), tagInput.trim()] }));
                          setTagInput("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim()) {
                        setFormData((p) => ({ ...p, tags: [...(p.tags || []), tagInput.trim()] }));
                        setTagInput("");
                      }
                    }}
                    className="btn-outline text-xs px-2.5 py-1"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-theme-bg border border-theme-border text-theme-muted text-[10px] inline-flex items-center gap-1 font-semibold"
                    >
                      #{tag}
                      <X
                        className="w-2.5 h-2.5 cursor-pointer hover:text-theme-danger"
                        onClick={() =>
                          setFormData((p) => ({ ...p, tags: p.tags?.filter((_, idx) => idx !== i) }))
                        }
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Article Content with Visual WYSIWYG Editor */}
              <RichTextEditor
                label="Article Content"
                required
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
                placeholder="Write your article here. Use bold, headings, lists, external URLs and images..."
                rows={12}
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
                  <span>{editingBlog ? "Update Article" : "Publish Article"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
