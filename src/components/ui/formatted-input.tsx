import * as React from 'react';
import { Input } from '@/components/ui/input';
import { useFormattedInput, InputFormatterType } from '@/hooks/useFormattedInput';
import { cn } from '@/lib/utils';

export interface FormattedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  formatterType: InputFormatterType;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

/**
 * Otomatik formatlama özellikli Input bileşeni
 * React Hook Form ile kullanım için optimize edilmiştir
 */
export const FormattedInput = React.forwardRef<HTMLInputElement, FormattedInputProps>(
  ({ formatterType, value, onChange, onBlur, className, ...props }, ref) => {
    const { handleChange, handleBlur } = useFormattedInput(formatterType);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        handleChange(e, onChange);
      }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      handleBlur(e, onBlur);
    };

    // Telefon için özel props
    const phoneProps = formatterType === 'phone' ? {
      maxLength: 11,
      placeholder: '05XX XXX XX XX',
      type: 'tel'
    } : {};

    // Email için özel props
    const emailProps = formatterType === 'email' ? {
      type: 'email',
      placeholder: 'ornek@email.com'
    } : {};

    // İsim için özel props
    const nameProps = formatterType === 'name' ? {
      placeholder: 'Ad Soyad'
    } : {};

    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className={cn(className)}
        {...phoneProps}
        {...emailProps}
        {...nameProps}
        {...props}
      />
    );
  }
);

FormattedInput.displayName = 'FormattedInput';
