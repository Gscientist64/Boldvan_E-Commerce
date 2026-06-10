import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Search,
  Package,
  AlertCircle,
  X,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

const CategoryManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    image: '',
  });

  // Get auth token
  const getAuthToken = () => localStorage.getItem('token') || '';

  // Fetch categories
  const { 
    data: categories, 
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    },
  });

  // Fetch product counts for categories
  const { data: productCounts } = useQuery({
    queryKey: ['category-product-counts'],
    queryFn: async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/admin/categories/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          return {};
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching product counts:', error);
        return {};
      }
    },
  });

  // Create/Update category mutation
  const categoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getAuthToken();
      const url = selectedCategory
        ? `${API_BASE_URL}/admin/categories/${selectedCategory.id}`
        : `${API_BASE_URL}/admin/categories`;
      const method = selectedCategory ? 'PUT' : 'POST';

      // Generate slug from name if not provided
      const slug = data.slug || data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const requestData = {
        name: data.name,
        description: data.description || '',
        slug,
        image: data.image || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-product-counts'] });
      resetForm();
      setIsDialogOpen(false);
      toast({
        title: selectedCategory ? 'Category updated' : 'Category created',
        description: selectedCategory
          ? 'Category has been updated successfully.'
          : 'Category has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-product-counts'] });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: 'Category deleted',
        description: 'Category has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      image: '',
    });
    setSelectedCategory(null);
    setSelectedFile(null);
    setUploadMethod('url');
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      image: category.image || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a category name.',
        variant: 'destructive',
      });
      return;
    }
    
    let finalImageUrl = formData.image;
    
    // If file is selected, handle upload
    if (uploadMethod === 'file' && selectedFile) {
      // For now, create object URL
      // In production, implement actual file upload
      const reader = new FileReader();
      reader.onloadend = () => {
        finalImageUrl = reader.result as string;
        categoryMutation.mutate({
          ...formData,
          image: finalImageUrl
        });
      };
      reader.readAsDataURL(selectedFile);
    } else {
      categoryMutation.mutate(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Auto-generate slug from name when creating new category
    if (name === 'name' && !selectedCategory && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a JPEG, PNG, WebP, or GIF image.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB.',
          variant: 'destructive',
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

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!categories) return [];
    if (!searchTerm) return categories;
    
    return categories.filter((category: Category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>
                Manage your product categories and organize your inventory
              </CardDescription>
            </div>
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
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCategory ? 'Edit Category' : 'Create New Category'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedCategory
                      ? 'Update the category details below.'
                      : 'Fill in the details to create a new product category.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Category Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Solar Panels"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="solar-panels"
                      />
                      <p className="text-xs text-gray-500">
                        Used in URLs. Auto-generated from name if left empty.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Brief description of the category"
                        rows={3}
                      />
                    </div>
                    
                    {/* Image Upload Section */}
                    <div className="space-y-2">
                      <Label>Category Image</Label>
                      <Tabs defaultValue="url" value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'url' | 'file')}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="url">Image URL</TabsTrigger>
                          <TabsTrigger value="file">Upload File</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="url" className="space-y-2">
                          <Input
                            type="url"
                            placeholder="https://example.com/category-image.jpg"
                            value={formData.image}
                            onChange={(e) => handleInputChange(e)}
                            name="image"
                          />
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
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded bg-gray-100 mr-3 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={URL.createObjectURL(selectedFile)} 
                                      alt="Preview" 
                                      className="w-full h-full object-cover"
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
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
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
                          <p className="text-sm font-medium mb-2">Preview:</p>
                          <div className="w-20 h-20 border rounded-lg overflow-hidden">
                            <img 
                              src={formData.image} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Error';
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
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={categoryMutation.isPending || isUploading}
                    >
                      {categoryMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {selectedCategory ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        selectedCategory ? 'Update Category' : 'Create Category'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search categories by name, description, or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Error State */}
          {categoriesError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Categories</AlertTitle>
              <AlertDescription>
                {(categoriesError as Error).message}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {categoriesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-indigo-500" />
                <p className="text-gray-500">Loading categories...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Categories Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center">
                            <Package className="h-12 w-12 text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              No categories found
                            </h3>
                            <p className="text-gray-500 mb-4">
                              {searchTerm 
                                ? 'Try adjusting your search terms'
                                : 'Get started by creating your first category'}
                            </p>
                            {!searchTerm && (
                              <Button onClick={() => setIsDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category: Category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="w-10 h-10 rounded-md overflow-hidden border bg-gray-50">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {category.slug}
                            </code>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-gray-600 truncate">
                              {category.description || '-'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {productCounts?.[category.id] || 0} products
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(category.createdAt).toLocaleDateString('en-NG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(category)}
                                disabled={(productCounts?.[category.id] || 0) > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {(productCounts?.[category.id] || 0) > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Can't delete - has products
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Summary Stats */}
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredCategories.length} of {categories?.length || 0} categories
              </div>
            </>
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
                  This action cannot be undone. This will permanently delete the
                  category "{selectedCategory?.name}".
                  {selectedCategory && productCounts?.[selectedCategory.id] > 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                      <strong>Warning:</strong> This category has {productCounts[selectedCategory.id]} products.
                      You must reassign or delete these products first.
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => selectedCategory && deleteMutation.mutate(selectedCategory.id)}
                  disabled={deleteMutation.isPending || (selectedCategory ? productCounts?.[selectedCategory.id] > 0 : false)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
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

export default CategoryManagement;