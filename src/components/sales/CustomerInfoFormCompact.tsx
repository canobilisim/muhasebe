import React, { useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { customerInfoSchema, type CustomerInfoFormData } from '@/utils/validationSchemas';
import { getFieldErrorClass } from '@/utils/errorHandling';

interface CustomerInfoFormCompactProps {
  onSubmit?: (data: CustomerInfoFormData) => void;
  onChange?: (data: CustomerInfoFormData) => void;
  defaultValues?: Partial<CustomerInfoFormData>;
}

export function CustomerInfoFormCompact({ onSubmit, onChange, defaultValues }: CustomerInfoFormCompactProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerInfoFormData>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      customerType: 'Bireysel',
      email: '',
      phone: '',
      address: '',
      customerName: '',
      vknTckn: '',
      taxOffice: '',
      ...defaultValues,
    },
  });

  const customerType = watch('customerType');
  
  // Use ref to track previous values to prevent unnecessary calls
  const previousValidDataRef = useRef<string>('');
  
  // Watch all form values and trigger onChange
  const formValues = watch();
  
  // Memoized onChange callback to prevent infinite loops
  const handleFormChange = useCallback(async () => {
    try {
      const validData = await customerInfoSchema.parseAsync(formValues);
      const serializedData = JSON.stringify(validData);
      
      // Only call onChange if data actually changed
      if (serializedData !== previousValidDataRef.current) {
        previousValidDataRef.current = serializedData;
        onChange?.(validData);
      }
    } catch {
      // Invalid data, don't call onChange
      // Reset previous data if current data is invalid
      previousValidDataRef.current = '';
    }
  }, [formValues, onChange]);
  
  // Debounced effect to prevent excessive calls
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFormChange();
    }, 100); // 100ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [handleFormChange]);

  const handleFormSubmit = (data: CustomerInfoFormData) => {
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      {/* Müşteri Tipi */}
      <div className="space-y-1">
        <Label htmlFor="customerType" className="text-sm">Müşteri Tipi *</Label>
        <Select
          value={customerType}
          onValueChange={(value) => setValue('customerType', value as 'Bireysel' | 'Kurumsal')}
        >
          <SelectTrigger id="customerType" className="h-9">
            <SelectValue placeholder="Müşteri tipi seçiniz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bireysel">Bireysel</SelectItem>
            <SelectItem value="Kurumsal">Kurumsal</SelectItem>
          </SelectContent>
        </Select>
        {errors.customerType && (
          <p className="text-xs text-red-500">{errors.customerType.message}</p>
        )}
      </div>

      {/* Conditional Fields Based on Customer Type */}
      <div className="grid grid-cols-1 gap-3">
        {customerType === 'Bireysel' ? (
          <>
            {/* Ad Soyad */}
            <div className="space-y-1">
              <Label htmlFor="customerName" className="text-sm">Ad Soyad *</Label>
              <Input
                id="customerName"
                {...register('customerName')}
                placeholder="Müşteri adı soyadı"
                className={`h-9 ${getFieldErrorClass(!!errors.customerName)}`}
              />
              {errors.customerName && (
                <p className="text-xs text-red-500">{errors.customerName.message}</p>
              )}
            </div>

            {/* TC Kimlik No */}
            <div className="space-y-1">
              <Label htmlFor="vknTckn" className="text-sm">TC Kimlik No *</Label>
              <Input
                id="vknTckn"
                {...register('vknTckn')}
                placeholder="11 haneli TC Kimlik No"
                maxLength={11}
                className={`h-9 ${getFieldErrorClass(!!errors.vknTckn)}`}
              />
              {errors.vknTckn && (
                <p className="text-xs text-red-500">{errors.vknTckn.message}</p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Ünvan */}
            <div className="space-y-1">
              <Label htmlFor="customerName" className="text-sm">Ünvan *</Label>
              <Input
                id="customerName"
                {...register('customerName')}
                placeholder="Şirket ünvanı"
                className={`h-9 ${getFieldErrorClass(!!errors.customerName)}`}
              />
              {errors.customerName && (
                <p className="text-xs text-red-500">{errors.customerName.message}</p>
              )}
            </div>

            {/* Vergi No */}
            <div className="space-y-1">
              <Label htmlFor="vknTckn" className="text-sm">Vergi No *</Label>
              <Input
                id="vknTckn"
                {...register('vknTckn')}
                placeholder="10 haneli Vergi No"
                maxLength={10}
                className={`h-9 ${getFieldErrorClass(!!errors.vknTckn)}`}
              />
              {errors.vknTckn && (
                <p className="text-xs text-red-500">{errors.vknTckn.message}</p>
              )}
            </div>

            {/* Vergi Dairesi */}
            <div className="space-y-1">
              <Label htmlFor="taxOffice" className="text-sm">Vergi Dairesi *</Label>
              <Input
                id="taxOffice"
                {...register('taxOffice')}
                placeholder="Vergi dairesi adı"
                className={`h-9 ${getFieldErrorClass(!!errors.taxOffice)}`}
              />
              {errors.taxOffice && (
                <p className="text-xs text-red-500">{errors.taxOffice.message}</p>
              )}
            </div>
          </>
        )}

        {/* E-posta */}
        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm">E-posta *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="ornek@email.com"
            className={`h-9 ${getFieldErrorClass(!!errors.email)}`}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Telefon */}
        <div className="space-y-1">
          <Label htmlFor="phone" className="text-sm">Telefon</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="0555 123 45 67"
            className="h-9"
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Adres */}
        <div className="space-y-1">
          <Label htmlFor="address" className="text-sm">Adres *</Label>
          <Textarea
            id="address"
            {...register('address')}
            placeholder="Müşteri adresi"
            rows={2}
            className={`resize-none ${getFieldErrorClass(!!errors.address)}`}
          />
          {errors.address && (
            <p className="text-xs text-red-500">{errors.address.message}</p>
          )}
        </div>
      </div>
    </form>
  );
}