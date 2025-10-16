import { ReactNode } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  FileText, 
  Search,
  AlertCircle,
  Plus,
  Database
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon || <Database className="w-8 h-8 text-gray-400" />}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Predefined empty states for common scenarios
export const EmptyProducts = ({ onAddProduct }: { onAddProduct?: () => void }) => (
  <EmptyState
    icon={<Package className="w-8 h-8 text-gray-400" />}
    title="Henüz ürün bulunmuyor"
    description="İlk ürününüzü ekleyerek stok yönetimine başlayın."
    action={onAddProduct ? {
      label: 'Ürün Ekle',
      onClick: onAddProduct
    } : undefined}
  />
);

export const EmptyCustomers = ({ onAddCustomer }: { onAddCustomer?: () => void }) => (
  <EmptyState
    icon={<Users className="w-8 h-8 text-gray-400" />}
    title="Henüz müşteri bulunmuyor"
    description="İlk müşterinizi ekleyerek müşteri yönetimine başlayın."
    action={onAddCustomer ? {
      label: 'Müşteri Ekle',
      onClick: onAddCustomer
    } : undefined}
  />
);

export const EmptySales = () => (
  <EmptyState
    icon={<ShoppingCart className="w-8 h-8 text-gray-400" />}
    title="Henüz satış bulunmuyor"
    description="İlk satışınızı gerçekleştirdikten sonra burada görüntülenecek."
  />
);

export const EmptyReports = () => (
  <EmptyState
    icon={<FileText className="w-8 h-8 text-gray-400" />}
    title="Rapor verisi bulunmuyor"
    description="Seçilen tarih aralığında veri bulunamadı. Farklı bir tarih aralığı deneyin."
  />
);

export const EmptySearch = ({ 
  searchTerm, 
  onClearSearch 
}: { 
  searchTerm: string; 
  onClearSearch?: () => void; 
}) => (
  <EmptyState
    icon={<Search className="w-8 h-8 text-gray-400" />}
    title={`"${searchTerm}" için sonuç bulunamadı`}
    description="Arama kriterlerinizi değiştirerek tekrar deneyin."
    action={onClearSearch ? {
      label: 'Aramayı Temizle',
      onClick: onClearSearch,
      variant: 'outline'
    } : undefined}
  />
);

export const EmptyError = ({ 
  title = 'Bir hata oluştu',
  description = 'Veriler yüklenirken bir sorun oluştu.',
  onRetry 
}: { 
  title?: string;
  description?: string;
  onRetry?: () => void; 
}) => (
  <EmptyState
    icon={<AlertCircle className="w-8 h-8 text-red-400" />}
    title={title}
    description={description}
    action={onRetry ? {
      label: 'Tekrar Dene',
      onClick: onRetry,
      variant: 'outline'
    } : undefined}
  />
);

export const EmptyFilter = ({ 
  onClearFilters 
}: { 
  onClearFilters?: () => void; 
}) => (
  <EmptyState
    icon={<Search className="w-8 h-8 text-gray-400" />}
    title="Filtre kriterlerine uygun sonuç bulunamadı"
    description="Filtreleri temizleyerek tüm kayıtları görüntüleyebilirsiniz."
    action={onClearFilters ? {
      label: 'Filtreleri Temizle',
      onClick: onClearFilters,
      variant: 'outline'
    } : undefined}
  />
);