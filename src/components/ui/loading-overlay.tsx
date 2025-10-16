import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: ReactNode;
  text?: string;
  className?: string;
  overlayClassName?: string;
}

export const LoadingOverlay = ({
  isLoading,
  children,
  text = 'Yükleniyor...',
  className,
  overlayClassName
}: LoadingOverlayProps) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      
      {isLoading && (
        <div className={cn(
          'absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50',
          overlayClassName
        )}>
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">{text}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const FormLoadingOverlay = ({
  isLoading,
  children,
  text = 'Kaydediliyor...'
}: {
  isLoading: boolean;
  children: ReactNode;
  text?: string;
}) => {
  return (
    <LoadingOverlay
      isLoading={isLoading}
      text={text}
      overlayClassName="bg-white/90 rounded-lg"
    >
      {children}
    </LoadingOverlay>
  );
};

export const TableLoadingOverlay = ({
  isLoading,
  children,
  text = 'Veriler yükleniyor...'
}: {
  isLoading: boolean;
  children: ReactNode;
  text?: string;
}) => {
  return (
    <LoadingOverlay
      isLoading={isLoading}
      text={text}
      overlayClassName="bg-white/75"
    >
      {children}
    </LoadingOverlay>
  );
};