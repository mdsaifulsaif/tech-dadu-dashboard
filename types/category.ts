export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  type: "product" | "blog" | "template" | "all";
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategoryInput {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  type: "product" | "blog" | "template" | "all";
  order?: number;
}
