# Form Validation and Error Handling Implementation

## Overview

This document describes the comprehensive form validation and API error handling implementation for the HesapOnda application.

## Implemented Features

### 1. Centralized Validation Schemas (`src/utils/validationSchemas.ts`)

Created reusable Zod validation schemas for all forms:

#### Common Validators
- **TC Kimlik No**: 11-digit validation with regex
- **Vergi No**: 10-digit validation with regex
- **Email**: Email format validation with Turkish error messages
- **Phone**: Optional phone number validation
- **Price**: Positive number validation
- **VAT Rate**: 0-100 range validation
- **Barcode**: Required non-empty string validation

#### Form Schemas
- **Product Form Schema**: Complete product validation with price comparison
- **Quick Product Schema**: Simplified schema for ProductNotFoundModal
- **Customer Info Schema**: Discriminated union for Bireysel/Kurumsal customers
- **Invoice Info Schema**: Invoice form validation
- **API Settings Schema**: API configuration validation

### 2. Comprehensive Error Handling (`src/utils/errorHandling.ts`)

#### Error Types
- VALIDATION_ERROR
- DATABASE_ERROR
- API_ERROR
- NETWORK_ERROR
- NOT_FOUND
- DUPLICATE
- UNAUTHORIZED
- FORBIDDEN
- TIMEOUT
- UNKNOWN

#### Error Detection Functions
- `isNetworkError()`: Detects network connectivity issues
- `isTimeoutError()`: Detects timeout errors
- `isAuthError()`: Detects authentication errors (401)
- `isForbiddenError()`: Detects authorization errors (403)
- `isNotFoundError()`: Detects not found errors (404)
- `isDuplicateError()`: Detects duplicate record errors (409)
- `isValidationError()`: Detects validation errors (400)

#### Error Parsing
- `parseError()`: Generic error parser with user-friendly Turkish messages
- `parseTurkcellApiError()`: Specialized parser for Turkcell e-Fatura API errors

#### Toast Notifications
- `showErrorToast()`: Display error messages
- `showSuccessToast()`: Display success messages
- `showWarningToast()`: Display warning messages
- `showInfoToast()`: Display info messages
- `showTurkcellApiErrorToast()`: Display Turkcell API specific errors

#### Form Error Helpers
- `getFieldErrorClass()`: Returns CSS classes for error state (red border)
- `getFormErrorSummary()`: Extracts all error messages from form errors
- `showFormErrorSummary()`: Displays form validation errors as toast

#### Retry Logic
- `retryWithBackoff()`: Exponential backoff retry mechanism
- Configurable max retries, initial delay, and backoff multiplier
- Smart retry logic that skips auth and validation errors

#### Network Status
- `isOnline()`: Check online status
- `addNetworkListeners()`: Add online/offline event listeners

### 3. Axios Configuration with Interceptors (`src/lib/axios.ts`)

#### Features
- Centralized axios instance with 30-second timeout
- Request interceptor for logging (development mode)
- Response interceptor for global error handling
- Automatic error parsing and toast notifications for network errors

#### Helper Functions
- `get()`: GET request with error handling
- `post()`: POST request with error handling
- `put()`: PUT request with error handling
- `patch()`: PATCH request with error handling
- `del()`: DELETE request with error handling
- `requestWithRetry()`: Request with automatic retry logic

### 4. Updated Components

#### ProductForm
- Uses centralized `productFormSchema`
- Shows form error summary on validation failure
- Automatically switches to tab with errors
- Red border highlights on invalid fields

#### CustomerInfoForm
- Uses centralized `customerInfoSchema`
- Discriminated union validation for Bireysel/Kurumsal
- Field-level error messages
- Red border highlights using `getFieldErrorClass()`

#### InvoiceInfoForm
- Uses centralized `invoiceInfoSchema`
- Field-level validation
- Red border highlights on errors

#### ProductNotFoundModal
- Uses centralized `quickProductSchema`
- Enhanced error handling with `showErrorToast()` and `showSuccessToast()`
- Red border highlights on invalid fields

### 5. Updated Services

#### turkcellApiService
- Integrated with `parseTurkcellApiError()` for specialized error parsing
- Uses `retryWithBackoff()` for automatic retry with exponential backoff
- Smart retry logic that doesn't retry auth or validation errors
- Enhanced error messages with status codes

### 6. Updated Pages

#### NewSalePage
- Replaced all `toast.*` calls with error handling utilities
- Uses `showErrorToast()`, `showSuccessToast()`
- Proper error handling for all operations
- Form validation with user-friendly messages

## Error Handling Flow

```
User Action
    ↓
Form Validation (Zod)
    ↓
API Request (Axios)
    ↓
Interceptor (Error Detection)
    ↓
Error Parser (parseError/parseTurkcellApiError)
    ↓
Retry Logic (if applicable)
    ↓
Toast Notification (User Feedback)
```

## Retry Strategy

### Automatic Retry
- Max 3 attempts
- Initial delay: 1000ms
- Backoff multiplier: 2x (1s → 2s → 4s)

### No Retry For
- Authentication errors (401)
- Forbidden errors (403)
- Validation errors (400)
- Errors with "gereklidir" (required field) messages

### Retry For
- Network errors
- Timeout errors
- Server errors (5xx)
- Transient errors

## User-Friendly Error Messages

All error messages are in Turkish and provide actionable information:

- **Network Error**: "Bağlantı hatası. İnternet bağlantınızı kontrol edin."
- **Timeout**: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin."
- **Auth Error**: "API Key geçersiz veya süresi dolmuş. Lütfen ayarları kontrol edin."
- **Forbidden**: "Bu işlem için yetkiniz bulunmamaktadır."
- **Not Found**: "İstenen kayıt bulunamadı."
- **Duplicate**: "Bu kayıt zaten mevcut."
- **Validation**: Field-specific messages from Zod schemas

## Form Validation Features

### Visual Feedback
- Red border on invalid fields (`border-red-500`)
- Error messages below fields
- Form error summary toast
- Automatic focus on first error field

### Validation Rules
- Required field validation
- Format validation (email, phone, TC Kimlik No, Vergi No)
- Range validation (VAT rate 0-100)
- Positive number validation (prices)
- Custom business rules (sale price >= purchase price)

### Real-time Validation
- Field-level validation on blur
- Form-level validation on submit
- Prevents submission with invalid data

## Benefits

1. **Consistency**: All forms use the same validation schemas and error handling
2. **Maintainability**: Centralized validation and error handling logic
3. **User Experience**: Clear, actionable error messages in Turkish
4. **Reliability**: Automatic retry for transient errors
5. **Developer Experience**: Easy to use helper functions and utilities
6. **Type Safety**: Full TypeScript support with type inference
7. **Accessibility**: Visual indicators for errors (red borders)
8. **Debugging**: Comprehensive logging in development mode

## Dependencies Added

- `axios`: HTTP client with interceptor support

## Files Created

1. `src/utils/validationSchemas.ts` - Centralized Zod schemas
2. `src/utils/errorHandling.ts` - Error handling utilities
3. `src/lib/axios.ts` - Axios configuration with interceptors

## Files Modified

1. `src/components/products/ProductForm.tsx`
2. `src/components/sales/CustomerInfoForm.tsx`
3. `src/components/sales/InvoiceInfoForm.tsx`
4. `src/components/sales/ProductNotFoundModal.tsx`
5. `src/services/turkcellApiService.ts`
6. `src/pages/sales/NewSalePage.tsx`

## Testing Recommendations

1. Test form validation with invalid inputs
2. Test network error handling (disconnect internet)
3. Test API error handling (invalid API key)
4. Test retry logic (simulate transient errors)
5. Test form error summary display
6. Test field-level error messages
7. Test red border highlights on errors

## Future Enhancements

1. Add form field error icons
2. Add loading states during retry
3. Add error boundary for React errors
4. Add Sentry integration for production error tracking
5. Add offline queue for failed requests
6. Add form auto-save functionality
7. Add validation debouncing for better UX
