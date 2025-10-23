import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductService } from '@/services/productService';
import { Product } from '@/types';

interface ProductSearchInputProps {
  onProductSelect: (product: Product) => void;
  onProductNotFound: (barcode: string) => void;
  autoFocus?: boolean;
}

export function ProductSearchInput({
  onProductSelect,
  onProductNotFound,
  autoFocus = true,
}: ProductSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search (300ms)
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      
      // First try exact barcode match
      const barcodeResult = await ProductService.searchByBarcode(searchQuery.trim());
      
      if (barcodeResult.success && barcodeResult.data) {
        // Exact barcode match found
        handleProductSelect(barcodeResult.data);
        setIsSearching(false);
        return;
      }

      // If no exact match, search by name or partial barcode
      const searchResult = await ProductService.searchProducts(searchQuery.trim(), 10);
      
      if (searchResult.success && searchResult.data) {
        if (searchResult.data.length === 0) {
          // No products found - trigger not found callback
          onProductNotFound(searchQuery.trim());
          setSearchResults([]);
          setShowDropdown(false);
        } else {
          setSearchResults(searchResult.data);
          setShowDropdown(true);
        }
      }
      
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle barcode scanner input (typically ends with Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's exactly one result, select it
      if (searchResults.length === 1) {
        handleProductSelect(searchResults[0]);
      } else if (searchResults.length === 0 && searchQuery.trim()) {
        // No results found
        onProductNotFound(searchQuery.trim());
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    } else if (e.key === 'ArrowDown' && searchResults.length > 0) {
      e.preventDefault();
      // Focus first dropdown item
      const firstItem = dropdownRef.current?.querySelector('button');
      firstItem?.focus();
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    
    // Refocus input for next scan
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Barkod okutun veya ürün adı yazın..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className="pl-10"
        />
      </div>

      {/* Dropdown Results */}
      {showDropdown && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto"
        >
          {searchResults.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleProductSelect(product)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const nextButton = e.currentTarget.nextElementSibling as HTMLButtonElement;
                  nextButton?.focus();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  if (index === 0) {
                    inputRef.current?.focus();
                  } else {
                    const prevButton = e.currentTarget.previousElementSibling as HTMLButtonElement;
                    prevButton?.focus();
                  }
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  handleProductSelect(product);
                }
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">Barkod: {product.barcode}</p>
                  {product.category && (
                    <p className="text-xs text-gray-400">{product.category}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-900">
                    {product.sale_price?.toFixed(2)} ₺
                  </p>
                  {product.stock_tracking_enabled && (
                    <p className="text-xs text-gray-500">
                      Stok: {product.stock_quantity || 0}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}
