import React, { useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerInfoSchema, type CustomerInfoFormData } from '@/utils/validationSchemas';
import { getFieldErrorClass } from '@/utils/errorHandling';

interface CustomerInfoFormProps {
  onSubmit?: (data: CustomerInfoFormData) => void;
  onChange?: (data: CustomerInfoFormData) => void;
  defaultValues?: Partial<CustomerInfoFormData>;
}

export function CustomerInfoForm({ onSubmit, onChange, defaultValues }: CustomerInfoFormProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Müşteri Bilgileri</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Müşteri Tipi */}
          <div className="space-y-2">
            <Label htmlFor="customerType">Müşteri Tipi *</Label>
            <Select
              value={customerType}
              onValueChange={(value) => setValue('customerType', value as 'Bireysel' | 'Kurumsal')}
            >
              <SelectTrigger id="customerType">
                <SelectValue placeholder="Müşteri tipi seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bireysel">Bireysel</SelectItem>
                <SelectItem value="Kurumsal">Kurumsal</SelectItem>
              </SelectContent>
            </Select>
            {errors.customerType && (
              <p className="text-sm text-red-500">{errors.customerType.message}</p>
            )}
          </div>

          {/* Conditional Fields Based on Customer Type */}
          {customerType === 'Bireysel' ? (
            <>
              {/* Ad Soyad */}
              <div className="space-y-2">
                <Label htmlFor="customerName">Ad Soyad *</Label>
                <Input
                  id="customerName"
                  {...register('customerName')}
                  placeholder="Müşteri adı soyadı"
                  className={getFieldErrorClass(!!errors.customerName)}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">{errors.customerName.message}</p>
                )}
              </div>

              {/* TC Kimlik No */}
              <div className="space-y-2">
                <Label htmlFor="vknTckn">TC Kimlik No *</Label>
                <Input
                  id="vknTckn"
                  {...register('vknTckn')}
                  placeholder="11 haneli TC Kimlik No"
                  maxLength={11}
                  className={getFieldErrorClass(!!errors.vknTckn)}
                />
                {errors.vknTckn && (
                  <p className="text-sm text-red-500">{errors.vknTckn.message}</p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Ünvan */}
              <div className="space-y-2">
                <Label htmlFor="customerName">Ünvan *</Label>
                <Input
                  id="customerName"
                  {...register('customerName')}
                  placeholder="Şirket ünvanı"
                  className={getFieldErrorClass(!!errors.customerName)}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">{errors.customerName.message}</p>
                )}
              </div>

              {/* Vergi No */}
              <div className="space-y-2">
                <Label htmlFor="vknTckn">Vergi No *</Label>
                <Input
                  id="vknTckn"
                  {...register('vknTckn')}
                  placeholder="10 haneli Vergi No"
                  maxLength={10}
                  className={getFieldErrorClass(!!errors.vknTckn)}
                />
                {errors.vknTckn && (
                  <p className="text-sm text-red-500">{errors.vknTckn.message}</p>
                )}
              </div>

              {/* Vergi Dairesi */}
              <div className="space-y-2">
                <Label htmlFor="taxOffice">Vergi Dairesi *</Label>
                <Input
                  id="taxOffice"
                  {...register('taxOffice')}
                  placeholder="Vergi dairesi adı"
                  className={getFieldErrorClass(!!errors.taxOffice)}
                />
                {errors.taxOffice && (
                  <p className="text-sm text-red-500">{errors.taxOffice.message}</p>
                )}
              </div>
            </>
          )}

          {/* E-posta */}
          <div className="space-y-2">
            <Label htmlFor="email">E-posta *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="ornek@email.com"
              className={getFieldErrorClass(!!errors.email)}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Telefon */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="0555 123 45 67"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Adres */}
          <div className="space-y-2">
            <Label htmlFor="address">Adres *</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Müşteri adresi"
              rows={3}
              className={getFieldErrorClass(!!errors.address)}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
