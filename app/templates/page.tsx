"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Upload,
  Download,
  Eye,
  RefreshCw,
  Code2,
  Palette,
} from "lucide-react";
import { templateApi, categoryApi, uploadApi } from "@/lib/api";
import { IDigitalProduct, IDigitalProductInput } from "@/types";
import { ICategory } from "@/types/category";
import { ImageGalleryManager } from "@/components/common/ImageGalleryManager";
import { RichTextEditor } from "@/components/common/RichTextEditor";

export default function TemplatesAdminPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string | undefined;

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pricingFilter, setPricingFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<IDigitalProduct | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<IDigitalProductInput>({
    title: "",
    slug: "",
    category: "",
    shortSummary: "",
    description: "",
    features: ["Fully Responsive", "Dark Mode Support", "Clean Architecture"],
    techStack: ["Next.js 15", "Tailwind CSS", "TypeScript"],
    price: 0,
    isFree: true,
    liveDemoUrl: "",
    purchaseUrl: "",
    previewImages: [],
    status: "published",
  });

  const [techInput, setTechInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");

  // 1. Fetch Categories for Dropdown (Templates)
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "template"],
    queryFn: async () => {
      const res = await categoryApi.getAll("template");
      return res.data || [];
    },
  });

  // Sync category param from URL
  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const matched = categories.find(
        (c: ICategory) => c.slug === categoryParam || c._id === categoryParam
      );
      if (matched) {
        setSelectedCategory(matched._id);
      }
    }
  }, [categoryParam, categories]);

  // 2. Fetch Templates
  const {
    data: templatesData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["admin-templates", selectedCategory, pricingFilter, searchQuery, page],
    queryFn: async () => {
      const res = await templateApi.getAll({
        status: "all",
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        isFree: pricingFilter === "free" ? true : pricingFilter === "paid" ? false : undefined,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      return res.data;
    },
  });

  const templates: IDigitalProduct[] =
    templatesData?.templates ||
    templatesData?.products ||
    (Array.isArray(templatesData) ? templatesData : []);
  const pagination = templatesData?.pagination;

  // 3. Create Mutation
  const createMutation = useMutation({
    mutationFn: (newTemplate: IDigitalProductInput) => templateApi.create(newTemplate, token),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      setIsModalOpen(false);
      setSuccessMsg(`Template "${res.data?.title}" created successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || "Failed to create template");
    },
  });

  // 4. Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IDigitalProductInput> }) =>
      templateApi.update(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      setIsModalOpen(false);
      setSuccessMsg("Template updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || "Failed to update template");
    },
  });

  // 5. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => templateApi.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      setSuccessMsg("Template deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      alert(err?.message || "Failed to delete template");
    },
  });

  // Open Add Modal
  const handleOpenAdd = (presetType: "template" | "uiux" = "template") => {
    setEditingTemplate(null);
    const uiUxCat = categories.find(
      (c: ICategory) => c.slug === "ui-ux-design" || c.name.toLowerCase().includes("ui")
    );
    const defaultCat =
      presetType === "uiux" && uiUxCat
        ? uiUxCat._id
        : selectedCategory !== "all"
        ? selectedCategory
        : categories[0]?._id || "";
    const isUiUx = presetType === "uiux" || (uiUxCat && defaultCat === uiUxCat._id);

    setFormData({
      title: "",
      slug: "",
      category: defaultCat,
      shortSummary: "",
      description: "",
      features: isUiUx
        ? [
            "50+ Clean Mobile & Web Screens",
            "Component System & Auto-Layout v5",
            "Dark & Light Theme Tokens",
            "Free Google Fonts & Icons",
          ]
        : [
            "Next.js 15 App Router",
            "Tailwind CSS v4 & Dark Mode",
            "TypeScript & ESLint",
            "Stripe Checkout Ready",
          ],
      techStack: isUiUx
        ? ["Figma", "Auto-Layout", "Design System", "Mobile App UI"]
        : ["Next.js", "Tailwind CSS", "TypeScript", "React 19"],
      price: isUiUx ? 19 : 29,
      isFree: false,
      liveDemoUrl: isUiUx ? "https://figma.com/@techdadu" : "https://demo.example.com",
      purchaseUrl: isUiUx ? "https://gumroad.com/l/ui-kit" : "https://gumroad.com/l/example",
      previewImages: [],
      status: "published",
    });
    setTechInput("");
    setFeatureInput("");
    setImageUrlInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (tmpl: IDigitalProduct) => {
    setEditingTemplate(tmpl);
    const catId = typeof tmpl.category === "object" ? tmpl.category._id : tmpl.category;
    setFormData({
      title: tmpl.title,
      slug: tmpl.slug,
      category: catId,
      shortSummary: tmpl.shortSummary || "",
      description: tmpl.description || "",
      features: tmpl.features || [],
      techStack: tmpl.techStack || [],
      price: tmpl.price || 0,
      isFree: tmpl.isFree || false,
      liveDemoUrl: tmpl.liveDemoUrl || "",
      purchaseUrl: tmpl.purchaseUrl || "",
      previewImages: tmpl.previewImages || [],
      status: tmpl.status || "published",
    });
    setTechInput("");
    setFeatureInput("");
    setImageUrlInput("");
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
      const uploaded = await uploadApi.uploadSingle(file, token, "tech-dadu/templates");
      if (uploaded.url) {
        setFormData((prev) => ({
          ...prev,
          previewImages: [...prev.previewImages, uploaded.url],
        }));
      }
    } catch (err: any) {
      setFormError(err?.message || "Failed to upload preview image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Template title is required");
      return;
    }
    if (!formData.category) {
      setFormError("Please select a category");
      return;
    }
    if (formData.previewImages.length === 0) {
      setFormError("Please add at least one preview image");
      return;
    }
    if (!formData.purchaseUrl) {
      setFormError("Please provide a purchase or download URL (e.g. Gumroad/GitHub)");
      return;
    }

    setFormError(null);

    const shortSummary =
      formData.shortSummary?.trim() ||
      formData.description?.slice(0, 160) ||
      formData.title;

    const submissionData = {
      ...formData,
      shortSummary,
      price: formData.isFree ? 0 : formData.price,
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate._id, data: submissionData });
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
            <div className="w-8 h-8 rounded-lg bg-theme-secondary-light text-theme-secondary flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-theme-fg">
              Templates & UI/UX Designs
            </h1>
            {isFetching && !isLoading && (
              <span title="Syncing...">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-theme-muted" />
              </span>
            )}
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Manage your developer kits, Next.js starters, and Figma UI/UX design systems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleOpenAdd("uiux")}
            className="btn-secondary text-xs py-2.5 px-3.5 inline-flex items-center gap-1.5 shadow-sm"
          >
            <Palette className="w-4 h-4" />
            <span>+ Add UI/UX Kit</span>
          </button>
          <button
            onClick={() => handleOpenAdd("template")}
            className="btn-primary text-xs py-2.5 px-3.5 inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Code Template</span>
          </button>
        </div>
      </div>

      {/* Quick Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => {
            setSelectedCategory("all");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
            selectedCategory === "all"
              ? "bg-theme-primary text-theme-primary-fg shadow-sm"
              : "card-surface text-theme-muted hover:text-theme-fg border border-theme-border"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Digital Assets</span>
        </button>

        {categories.map((cat: ICategory) => {
          const isSelected = selectedCategory === cat._id;
          const isUi = cat.slug.includes("ui") || cat.name.toLowerCase().includes("design");
          return (
            <button
              key={cat._id}
              onClick={() => {
                setSelectedCategory(cat._id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? "bg-theme-primary text-theme-primary-fg shadow-sm"
                  : "card-surface text-theme-muted hover:text-theme-fg border border-theme-border"
              }`}
            >
              {isUi ? <Palette className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
              <span>{cat.name}</span>
            </button>
          );
        })}
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
            placeholder="Search templates or tech stack..."
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

        {/* Category & Pricing Selectors */}
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

          {/* Pricing Dropdown */}
          <select
            value={pricingFilter}
            onChange={(e) => {
              setPricingFilter(e.target.value);
              setPage(1);
            }}
            className="input-theme text-xs py-2 px-3 cursor-pointer w-auto"
          >
            <option value="all">All Prices</option>
            <option value="free">Free Only</option>
            <option value="paid">Premium / Paid</option>
          </select>
        </div>
      </div>

      {/* Templates Table */}
      {isLoading ? (
        <div className="card-surface p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary mx-auto mb-3" />
          <p className="text-xs text-theme-muted">Loading templates catalog...</p>
        </div>
      ) : templates.length > 0 ? (
        <div className="card-surface rounded-2xl overflow-hidden border border-theme-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-theme-bg/60 border-b border-theme-border text-theme-muted uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Template</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Tech Stack</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Downloads</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {templates.map((tmpl: IDigitalProduct) => {
                  const catName =
                    typeof tmpl.category === "object" && tmpl.category?.name
                      ? tmpl.category.name
                      : "Templates";
                  const mainImg = tmpl.previewImages?.[0] || "/next.svg";

                  return (
                    <tr key={tmpl._id} className="hover:bg-theme-surface-hover/50 transition-colors">
                      {/* Name & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={mainImg}
                            alt={tmpl.title}
                            width={48}
                            height={36}
                            className="w-12 h-9 rounded-lg object-cover bg-theme-bg border border-theme-border shrink-0"
                          />
                          <div>
                            <p className="font-bold text-theme-fg line-clamp-1 max-w-xs">
                              {tmpl.title}
                            </p>
                            <span className="text-[11px] font-mono text-theme-muted">
                              /{tmpl.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-theme-muted">{catName}</span>
                      </td>

                      {/* Tech Stack Pills */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {tmpl.techStack?.slice(0, 3).map((tech, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-theme-bg border border-theme-border text-theme-muted"
                            >
                              {tech}
                            </span>
                          ))}
                          {tmpl.techStack && tmpl.techStack.length > 3 && (
                            <span className="text-[10px] text-theme-muted">
                              +{tmpl.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold">
                        {tmpl.isFree || tmpl.price === 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-theme-success border border-emerald-500/20">
                            Free
                          </span>
                        ) : (
                          <span className="text-theme-fg font-extrabold">${tmpl.price}</span>
                        )}
                      </td>

                      {/* Downloads */}
                      <td className="py-3.5 px-4 font-bold text-theme-secondary">
                        <div className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5" />
                          <span>{tmpl.downloadCount || 0}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            tmpl.status === "published"
                              ? "bg-theme-success/15 text-theme-success border-emerald-500/20"
                              : "bg-theme-bg text-theme-muted border-theme-border"
                          }`}
                        >
                          {tmpl.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {tmpl.liveDemoUrl && (
                            <a
                              href={tmpl.liveDemoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-surface-hover hover:text-theme-secondary text-theme-muted transition-colors"
                              title="Live Demo"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEdit(tmpl)}
                            className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-surface-hover hover:text-theme-primary text-theme-muted transition-colors"
                            title="Edit Template"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete template "${tmpl.title}"?`)) {
                                deleteMutation.mutate(tmpl._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-danger hover:text-white text-theme-muted transition-colors"
                            title="Delete Template"
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
          {pagination && ((pagination.totalPages || pagination.pages || 1) > 1) && (
            <div className="p-4 border-t border-theme-border flex items-center justify-between text-xs text-theme-muted">
              <span>
                Showing page {pagination.currentPage || pagination.page || 1} of{" "}
                {pagination.totalPages || pagination.pages || 1} (
                {pagination.totalItems ?? pagination.total ?? templates.length} templates)
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={(pagination.currentPage || pagination.page || 1) <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-outline text-xs py-1 px-3 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={
                    pagination.hasNextPage !== undefined
                      ? !pagination.hasNextPage
                      : (pagination.currentPage || pagination.page || 1) >=
                        (pagination.totalPages || pagination.pages || 1)
                  }
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
          <div className="w-12 h-12 rounded-xl bg-theme-secondary-light text-theme-secondary flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-theme-fg mb-1">No Templates Found</h3>
          <p className="text-xs text-theme-muted mb-5">
            {searchQuery
              ? `No templates matching "${searchQuery}".`
              : "Showcase your first developer boilerplate or freebie kit."}
          </p>
          <button onClick={() => handleOpenAdd("template")} className="btn-primary text-xs py-2 px-4 shadow-sm">
            Add First Template
          </button>
        </div>
      )}

      {/* Modal: Add / Edit Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="card-surface w-full max-w-4xl rounded-2xl p-6 sm:p-8 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-theme-border sticky top-0 bg-theme-surface z-10">
              <h2 className="text-base font-bold text-theme-fg flex items-center gap-2">
                <span>{editingTemplate ? "Edit Digital Template" : "Add New Template"}</span>
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
                    Template Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Modern SaaS Boilerplate Next.js 15"
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
                    placeholder="e.g. modern-saas-boilerplate-nextjs-15"
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

              {/* Pricing & Free Toggle */}
              <div className="p-3 rounded-xl bg-theme-bg border border-theme-border grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="w-4 h-4 rounded text-theme-primary cursor-pointer"
                  />
                  <label htmlFor="isFree" className="font-semibold text-theme-fg cursor-pointer">
                    100% Free Download / Open Source
                  </label>
                </div>

                {!formData.isFree && (
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                      Price ($ USD)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="e.g. 29"
                      className="input-theme text-xs py-1.5"
                    />
                  </div>
                )}
              </div>

              {/* Demo URL & Purchase URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Live Demo Preview URL
                  </label>
                  <input
                    type="url"
                    value={formData.liveDemoUrl}
                    onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                    placeholder="https://demo.techdadu.com"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Purchase / Download URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.purchaseUrl}
                    onChange={(e) => setFormData({ ...formData, purchaseUrl: e.target.value })}
                    placeholder="https://gumroad.com/l/yourkit or GitHub URL"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>
              </div>

              {/* Tech Stack Tags */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Tech Stack (Pills)
                </label>
                <div className="flex gap-1.5 mb-1.5">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="e.g. Next.js 15, Tailwind, Prisma (press Enter)"
                    className="input-theme text-xs py-1.5"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (techInput.trim()) {
                          setFormData((p) => ({ ...p, techStack: [...p.techStack, techInput.trim()] }));
                          setTechInput("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (techInput.trim()) {
                        setFormData((p) => ({ ...p, techStack: [...p.techStack, techInput.trim()] }));
                        setTechInput("");
                      }
                    }}
                    className="btn-outline text-xs px-2.5 py-1"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.techStack?.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-theme-secondary-light text-theme-secondary text-[10px] font-semibold inline-flex items-center gap-1"
                    >
                      {t}
                      <X
                        className="w-2.5 h-2.5 cursor-pointer"
                        onClick={() =>
                          setFormData((p) => ({ ...p, techStack: p.techStack.filter((_, idx) => idx !== i) }))
                        }
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview Images: Interactive Gallery & Main Thumbnail Manager */}
              <ImageGalleryManager
                images={formData.previewImages}
                onChange={(previewImages) => setFormData((p) => ({ ...p, previewImages }))}
                onUpload={async (file) => {
                  try {
                    const uploaded = await uploadApi.uploadSingle(file, token, "tech-dadu/templates");
                    return uploaded.url || null;
                  } catch (err: any) {
                    setFormError(err?.message || "Failed to upload preview image");
                    return null;
                  }
                }}
                isUploading={uploadingImage}
                label="Template Screenshots / Gallery"
                required
              />

              {/* Short Summary */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Short Summary / Tagline
                </label>
                <input
                  type="text"
                  value={formData.shortSummary || ""}
                  onChange={(e) => setFormData({ ...formData, shortSummary: e.target.value })}
                  placeholder="e.g. Modern fullstack SaaS starter built with Next.js 16 and Supabase..."
                  className="input-theme text-xs py-2"
                />
              </div>

              {/* Description / Features with Rich Text Editor */}
              <RichTextEditor
                label="Description & Features"
                required
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder="Explain what's included in this template kit, tech features, architecture, links or screenshots..."
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
                  <span>{editingTemplate ? "Update Template" : "Save Template"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
