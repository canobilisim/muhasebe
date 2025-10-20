import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormattedInput } from '@/components/ui/formatted-input';
import { InputFormatterType } from '@/hooks/useFormattedInput';

interface FormattedFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  formatterType: InputFormatterType;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * React Hook Form ile kullanım için hazır FormField bileşeni
 * Otomatik formatlama özelliği ile birlikte gelir
 */
export function FormattedFormField<T extends FieldValues>({
  control,
  name,
  label,
  formatterType,
  placeholder,
  disabled,
  required
}: FormattedFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <FormattedInput
              formatterType={formatterType}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              onChange={(value) => field.onChange(value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
