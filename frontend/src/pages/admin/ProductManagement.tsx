import React, { useState, useEffect, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Filter, Loader2, Upload, X, AlertCircle, Package, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Product,
  ProductFormData,
  Category,
} from "@/types/product";

// Use the correct environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:7000/api";

// Format price in Naira
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const ProductManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategoryFile, setSelectedCategoryFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ 
    name: "", 
    description: "",
    image: "" 
  });
  const [categoryUploadMethod, setCategoryUploadMethod] = useState<"url" | "file">("url");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
    image: "",
    sku: "",
    isFeatured: false,
    isActive: true
  });

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  // Fetch products
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Authentication required. Please login.");
        }

        const response = await fetch(`${API_BASE_URL}/admin/products?limit=100`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        
        const data = await response.json();
        return data.products || [];
      } catch (error: any) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },
    retry: 1,
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          return [];
        }

        const response = await fetch(`${API_BASE_URL}/categories`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        if (!response.ok) {
          console.warn("Failed to fetch categories");
          return [];
        }
        
        const data = await response.json();
        console.log("Categories fetched:", data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
    retry: 1,
  });

  // Create category mutation - updated for your schema
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: { 
      name: string; 
      description: string;
      image: string;
    }) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Generate slug from name
      const slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const requestData = {
        name: categoryData.name,
        description: categoryData.description || '',
        slug: slug,
        image: categoryData.image || null
      };

      console.log("Creating category with data:", requestData);

      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create category: ${response.status} ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCategory({ name: "", description: "", image: "" });
      setSelectedCategoryFile(null);
      setCategoryUploadMethod("url");
      setShowCategoryDialog(false);
      toast({
        title: "Category created",
        description: "New category has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ensure categories is always an array
  const categories: Category[] = Array.isArray(categoriesData) ? categoriesData : [];

  // Ensure products is always an array
  const products: Product[] = Array.isArray(productsData) ? productsData : [];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      product.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.categoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Generate SKU
  const generateSKU = () => {
    const prefix = 'SOLAR';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${randomNum}-${timestamp}`;
  };

  // Add/Edit product mutation
  const productMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const url = selectedProduct
        ? `${API_BASE_URL}/admin/products/${selectedProduct.id}`
        : `${API_BASE_URL}/admin/products`;
      const method = selectedProduct ? "PUT" : "POST";

      // Validate required fields
      if (!data.categoryId) {
        throw new Error("Category is required");
      }

      // Transform data to match backend expectations
      const requestData = {
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price.toString()),
        sku: data.sku || generateSKU(),
        stock: parseInt(data.stock.toString()) || 0,
        categoryId: data.categoryId,
        image: data.image || null,
        images: [],
        features: {},
        specifications: {},
        isFeatured: Boolean(data.isFeatured),
        isActive: Boolean(data.isActive !== false)
      };

      console.log("Sending product data:", requestData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to save product: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorText;
        } catch {
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setIsDialogOpen(false);
      toast({
        title: selectedProduct ? "Product updated" : "Product added",
        description: selectedProduct
          ? "Product has been updated successfully."
          : "Product has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete: ${response.status} ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      image: "",
      sku: "",
      isFeatured: false,
      isActive: true
    });
    setSelectedProduct(null);
    setSelectedFile(null);
    setUploadMethod("url");
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock || 0,
      categoryId: product.categoryId || "",
      image: product.image || "",
      sku: product.sku || "",
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.categoryId) {
      toast({
        title: "Category required",
        description: "Please select a category for the product.",
        variant: "destructive",
      });
      return;
    }
    
    let finalImageUrl = formData.image;
    
    // If file is selected, handle upload
    if (uploadMethod === "file" && selectedFile) {
      try {
        setIsUploading(true);
        // For now, use a placeholder - you need to implement actual file upload
        const reader = new FileReader();
        reader.onloadend = () => {
          finalImageUrl = reader.result as string;
          submitProductData(finalImageUrl);
        };
        reader.readAsDataURL(selectedFile);
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try URL method.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
    } else {
      submitProductData(finalImageUrl);
    }
  };

  const submitProductData = (imageUrl: string) => {
    productMutation.mutate({
      ...formData,
      image: imageUrl,
      sku: formData.sku || generateSKU()
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, WebP, or GIF image.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, WebP, or GIF image.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedCategoryFile(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCategory(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedCategoryFile = () => {
    setSelectedCategoryFile(null);
    setNewCategory(prev => ({ ...prev, image: "" }));
    if (categoryFileInputRef.current) {
      categoryFileInputRef.current.value = "";
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast({
        title: "Category name required",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    let finalCategoryImage = newCategory.image;
    
    // If file is selected for category, handle it
    if (categoryUploadMethod === "file" && selectedCategoryFile) {
      try {
        setIsCreatingCategory(true);
        // For now, use a placeholder - you need to implement actual file upload
        const reader = new FileReader();
        reader.onloadend = () => {
          finalCategoryImage = reader.result as string;
          submitCategoryData(finalCategoryImage);
        };
        reader.readAsDataURL(selectedCategoryFile);
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload category image. Please try URL method.",
          variant: "destructive",
        });
        setIsCreatingCategory(false);
        return;
      }
    } else {
      submitCategoryData(finalCategoryImage);
    }
  };

  const submitCategoryData = (imageUrl: string) => {
    createCategoryMutation.mutate({
      ...newCategory,
      image: imageUrl
    });
  };

  // Check authentication on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to access product management.",
        variant: "destructive",
      });
    }
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage your solar products inventory
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  refetchProducts();
                  refetchCategories();
                }}
                disabled={isLoadingProducts || isLoadingCategories}
              >
                <Loader2 className={`mr-2 h-4 w-4 ${(isLoadingProducts || isLoadingCategories) ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Tag className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                      Add a new product category to organize your products.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCategory}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryName">Category Name *</Label>
                        <Input
                          id="categoryName"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Solar Panels"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoryDescription">Description</Label>
                        <Textarea
                          id="categoryDescription"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of the category"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category Image</Label>
                        <Tabs 
                          defaultValue="url" 
                          value={categoryUploadMethod} 
                          onValueChange={(v) => setCategoryUploadMethod(v as "url" | "file")}
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="url">Image URL</TabsTrigger>
                            <TabsTrigger value="file">Upload File</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="url" className="space-y-2">
                            <Input
                              type="url"
                              placeholder="https://example.com/category-image.jpg"
                              value={newCategory.image}
                              onChange={(e) => setNewCategory(prev => ({ ...prev, image: e.target.value }))}
                            />
                          </TabsContent>
                          
                          <TabsContent value="file" className="space-y-4">
                            <input
                              ref={categoryFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleCategoryFileSelect}
                              className="hidden"
                            />
                            
                            {selectedCategoryFile ? (
                              <div className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 rounded bg-gray-100 mr-3 flex items-center justify-center">
                                      <img 
                                        src={URL.createObjectURL(selectedCategoryFile)} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover rounded"
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{selectedCategoryFile.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {(selectedCategoryFile.size / 1024).toFixed(1)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeSelectedCategoryFile}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                onClick={() => categoryFileInputRef.current?.click()}
                              >
                                <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm font-medium">Click to upload category image</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Optional - helps identify the category
                                </p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                        
                        {newCategory.image && !selectedCategoryFile && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-2">Image Preview:</p>
                            <div className="w-20 h-20 border rounded-lg overflow-hidden">
                              <img 
                                src={newCategory.image} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' dy='.3em' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCategoryDialog(false)}
                        disabled={createCategoryMutation.isPending || isCreatingCategory}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createCategoryMutation.isPending || isCreatingCategory}
                      >
                        {createCategoryMutation.isPending || isCreatingCategory ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Category"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedProduct
                        ? "Update the product details below."
                        : "Fill in the details for the new product."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="col-span-3"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sku" className="text-right">
                          SKU *
                        </Label>
                        <div className="col-span-3 flex gap-2">
                          <Input
                            id="sku"
                            name="sku"
                            value={formData.sku}
                            onChange={handleInputChange}
                            placeholder="SOLAR-1234-5678"
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const generatedSKU = generateSKU();
                              setFormData(prev => ({ ...prev, sku: generatedSKU }));
                            }}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="col-span-3"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                          Price *
                        </Label>
                        <div className="col-span-3 relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ₦
                          </span>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="1"
                            min="0"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="pl-8"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">
                          Stock *
                        </Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={handleInputChange}
                          className="col-span-3"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                          Category *
                        </Label>
                        <div className="col-span-3 space-y-2">
                          <Select
                            value={formData.categoryId}
                            onValueChange={(value) => handleSelectChange("categoryId", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingCategories ? (
                                <SelectItem value="loading" disabled>
                                  <div className="flex items-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading categories...
                                  </div>
                                </SelectItem>
                              ) : categories.length === 0 ? (
                                <div className="p-2 text-center">
                                  <p className="text-sm text-gray-500">No categories found</p>
                                  <Button
                                    type="button"
                                    variant="link"
                                    className="text-blue-600"
                                    onClick={() => setShowCategoryDialog(true)}
                                  >
                                    Create your first category
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  {categories.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                  <div className="border-t pt-2 mt-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-blue-600"
                                      onClick={() => setShowCategoryDialog(true)}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add New Category
                                    </Button>
                                  </div>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          {!formData.categoryId && categories.length > 0 && (
                            <p className="text-sm text-red-500">Category is required</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Image Upload Section */}
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Image</Label>
                        <div className="col-span-3 space-y-4">
                          <Tabs defaultValue="url" value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "url" | "file")}>
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="url">Image URL</TabsTrigger>
                              <TabsTrigger value="file">Upload File</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="url" className="space-y-2">
                              <Input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={formData.image}
                                onChange={(e) => handleInputChange(e)}
                                name="image"
                              />
                              <p className="text-sm text-gray-500">
                                Enter a direct image URL
                              </p>
                            </TabsContent>
                            
                            <TabsContent value="file" className="space-y-4">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                              
                              {selectedFile ? (
                                <div className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 rounded bg-gray-100 mr-3 flex items-center justify-center">
                                        <img 
                                          src={URL.createObjectURL(selectedFile)} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover rounded"
                                        />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={removeSelectedFile}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                  <p className="text-sm font-medium">Click to upload image</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    JPEG, PNG, WebP or GIF (Max 5MB)
                                  </p>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                          
                          {formData.image && !selectedFile && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-2">Image Preview:</p>
                              <div className="w-32 h-32 border rounded-lg overflow-hidden">
                                <img 
                                  src={formData.image} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' dy='.3em' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Status</Label>
                        <div className="col-span-3 flex gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isFeatured"
                              checked={formData.isFeatured}
                              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="isFeatured" className="text-sm">
                              Featured Product
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isActive"
                              checked={formData.isActive}
                              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="isActive" className="text-sm">
                              Active
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={productMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={productMutation.isPending || !formData.categoryId}
                      >
                        {productMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {selectedProduct ? "Updating..." : "Adding..."}
                          </>
                        ) : selectedProduct ? (
                          "Update Product"
                        ) : (
                          "Add Product"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Categories Empty State */}
          {categories.length === 0 && !isLoadingCategories && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <Package className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">No Categories Found</AlertTitle>
              <AlertDescription className="text-blue-700">
                <p>You need to create categories before adding products.</p>
                <div className="mt-2">
                  <Button
                    onClick={() => setShowCategoryDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Create First Category
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={!getAuthToken()}
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                disabled={!getAuthToken() || categories.length === 0}
              >
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Table */}
          {isLoadingProducts ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Loading products...</p>
              </div>
            </div>
          ) : productsError ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Products</AlertTitle>
              <AlertDescription>
                {productsError.message}
              </AlertDescription>
            </Alert>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || categoryFilter !== "all"
                    ? "No products found"
                    : "No products yet"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm || categoryFilter !== "all"
                    ? "No products match your search criteria. Try different keywords or filters."
                    : categories.length === 0
                    ? "Create categories first, then add your first product."
                    : "Get started by adding your first product to the inventory."}
                </p>
                {categories.length === 0 && (
                  <div className="mt-4">
                    <Button onClick={() => setShowCategoryDialog(true)}>
                      <Tag className="mr-2 h-4 w-4" />
                      Create Categories First
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const category = categories.find(
                      (cat) => cat.id === product.categoryId
                    );
                    const isLowStock = (product.stock || 0) < 10;
                    const isOutOfStock = (product.stock || 0) === 0;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-md overflow-hidden border">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' dy='.3em' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {product.sku || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell>
                          {category ? (
                            <Badge variant="secondary">
                              {category.name}
                            </Badge>
                          ) : product.category?.name ? (
                            <Badge variant="secondary">
                              {product.category.name}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Uncategorized
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell>{product.stock || 0}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {!product.isActive ? (
                              <Badge variant="destructive">Inactive</Badge>
                            ) : isOutOfStock ? (
                              <Badge variant="destructive">Out of Stock</Badge>
                            ) : isLowStock ? (
                              <Badge variant="warning">Low Stock</Badge>
                            ) : (
                              <Badge variant="success">In Stock</Badge>
                            )}
                            {product.isFeatured && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              disabled={!getAuthToken()}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product)}
                              disabled={!getAuthToken()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  the product "{selectedProduct?.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    selectedProduct &&
                    deleteMutation.mutate(selectedProduct.id)
                  }
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;