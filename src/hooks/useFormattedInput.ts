import { useCallback } from 'react';
import {
  formatNameToTitleCase,
  formatPhoneNumber,
  formatEmail
} from '@/utils/inputFormatters';

export type InputFormatterType = 
  | 'name' 
  | 'phone' 
  | 'email';

/**
 * Form input'ları için otomatik formatlama hook'u
 * React Hook Form ile kullanım için optimize edilmiştir
 */
export const useFormattedInput = (type: InputFormatterType) => {
  const formatValue = useCallback((value: string): string => {
    switch (type) {
      case 'name':
        return formatNameToTitleCase(value);
      case 'phone':
        return formatPhoneNumber(value);
      case 'email':
        return formatEmail(value);
      default:
        return value;
    }
  }, [type]);

  /**
   * onChange handler - React Hook Form ile kullanım için
   */
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const formatted = formatValue(e.target.value);
    onChange(formatted);
  }, [formatValue]);

  /**
   * onBlur handler - Kullanıcı alanı terk ettiğinde formatlama
   */
  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement>,
    onBlur?: () => void
  ) => {
    const formatted = formatValue(e.target.value);
    e.target.value = formatted;
    onBlur?.();
  }, [formatValue]);

  return {
    formatValue,
    handleChange,
    handleBlur
  };
};
