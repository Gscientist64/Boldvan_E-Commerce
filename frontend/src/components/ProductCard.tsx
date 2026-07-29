// frontend/src/components/ProductCard.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: any;
  onViewDetails: () => void;
  onAddToCart: (cartItem?: any) => void;
}


const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onAddToCart }) => {
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Transform the product to include productId
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      sku: product.sku,
      stock: product.stock
    };
    
    console.log('ProductCard - sending cartItem:', cartItem);
    onAddToCart(cartItem);
  };

  const handleCardClick = () => {
    onViewDetails(); // Navigate to product details when clicking the card
  };

  const isOutOfStock = product.stock === 0;

  // Format price in Naira
  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-48 sm:aspect-square overflow-hidden bg-gray-100 relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200">
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            Featured
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          {product.category?.name && (
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
              {product.category.name}
            </span>
          )}
        </div>
        
        <h3 className="font-bold text-base md:text-lg mb-1 line-clamp-1 overflow-hidden text-ellipsis">{product.name}</h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 overflow-hidden text-ellipsis min-h-[2.25rem] sm:min-h-[2.5rem]">
          {product.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg md:text-2xl font-bold text-gray-900 whitespace-nowrap">
              {formatNaira(product.price)}
            </span>
            {product.rating && (
              <div className="flex items-center mt-1">
                <div className="flex text-yellow-400">
                  {'★'.repeat(Math.floor(product.rating))}
                  {'☆'.repeat(5 - Math.floor(product.rating))}
                </div>
                <span className="text-gray-500 text-sm ml-2">
                  ({product.rating.toFixed(1)})
                </span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;