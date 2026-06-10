// frontend/src/types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;  // Changed from stockQuantity
  sku: string;    // Added
  categoryId: string;
  image: string;  // Changed from imageUrl
  images: string[];
  features: Record<string, any>;
  specifications: Record<string, any>;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    name: string;
  };
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;  // Changed from stockQuantity
  sku: string;    // Added
  categoryId: string;
  image: string;  // Changed from imageUrl
  isFeatured: boolean;
  isActive: boolean;
}