import React, { useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { invoiceInfoSchema, type InvoiceInfoFormData } from '@/utils/validationSchemas';
import { getFieldErrorClass } from '@/utils/errorHandling';

interface InvoiceInfoFormProps {
  onSubmit?: (data: InvoiceInfoFormData) => void;
  onChange?: (data: InvoiceInfoFormData) => void;
  defaultValues?: Partial<InvoiceInfoFormData>;
}

export function InvoiceInfoForm({ onSubmit, onChange, defaultValues }: InvoiceInfoFormProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceInfoFormData>({
    resolver: zodResolver(invoiceInfoSchema),
    defaultValues: {
      invoiceType: 'E_ARSIV',
      invoiceDate: today,
      currency: 'TRY',
      paymentType: 'NAKIT',
      note: '',
      ...defaultValues,
    },
  });
  
  // Use ref to track previous values to prevent unnecessary calls
  const previousValidDataRef = useRef<string>('');
  
  // Watch all form values and trigger onChange
  const formValues = watch();
  
  // Memoized onChange callback to prevent infinite loops
  const handleFormChange = useCallback(async () => {
    try {
      const validData = await invoiceInfoSchema.parseAsync(formValues);
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

  const handleFormSubmit = (data: InvoiceInfoFormData) => {
    onSubmit?.(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fatura Bilgileri</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Fatura Tipi */}
          <div className="space-y-2">
            <Label htmlFor="invoiceType">Fatura Tipi *</Label>
            <Select
              defaultValue="E_ARSIV"
              onValueChange={(value) => setValue('invoiceType', value as 'E_FATURA' | 'E_ARSIV')}
            >
              <SelectTrigger id="invoiceType">
                <SelectValue placeholder="Fatura tipi seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="E_FATURA">e-Fatura (Kurumsal)</SelectItem>
                <SelectItem value="E_ARSIV">e-Arşiv (Bireysel)</SelectItem>
              </SelectContent>
            </Select>
            {errors.invoiceType && (
              <p className="text-sm text-red-500">{errors.invoiceType.message}</p>
            )}
          </div>

          {/* Fatura Tarihi */}
          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Fatura Tarihi *</Label>
            <Input
              id="invoiceDate"
              type="date"
              {...register('invoiceDate')}
              className={getFieldErrorClass(!!errors.invoiceDate)}
            />
            {errors.invoiceDate && (
              <p className="text-sm text-red-500">{errors.invoiceDate.message}</p>
            )}
          </div>

          {/* Para Birimi */}
          <div className="space-y-2">
            <Label htmlFor="currency">Para Birimi *</Label>
            <Input
              id="currency"
              {...register('currency')}
              readOnly
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              Şu anda sadece TRY (Türk Lirası) desteklenmektedir
            </p>
          </div>

          {/* Ödeme Türü */}
          <div className="space-y-2">
            <Label htmlFor="paymentType">Ödeme Türü *</Label>
            <Select
              defaultValue="NAKIT"
              onValueChange={(value) =>
                setValue('paymentType', value as 'NAKIT' | 'KREDI_KARTI' | 'HAVALE' | 'TAKSITLI')
              }
            >
              <SelectTrigger id="paymentType">
                <SelectValue placeholder="Ödeme türü seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NAKIT">Nakit</SelectItem>
                <SelectItem value="KREDI_KARTI">Kredi Kartı</SelectItem>
                <SelectItem value="HAVALE">Havale/EFT</SelectItem>
                <SelectItem value="TAKSITLI">Taksitli</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentType && (
              <p className="text-sm text-red-500">{errors.paymentType.message}</p>
            )}
          </div>

          {/* Not/Açıklama */}
          <div className="space-y-2">
            <Label htmlFor="note">Not / Açıklama</Label>
            <Textarea
              id="note"
              {...register('note')}
              placeholder="Fatura ile ilgili notlar (opsiyonel)"
              rows={3}
            />
            {errors.note && (
              <p className="text-sm text-red-500">{errors.note.message}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
