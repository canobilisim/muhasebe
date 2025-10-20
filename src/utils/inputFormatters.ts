/**
 * Input formatters - Form alanları için standart formatlama fonksiyonları
 */

/**
 * Her kelimenin baş harfini büyük yapar (Title Case)
 * Örnek: "ahmet mehmet" -> "Ahmet Mehmet"
 */
export const formatNameToTitleCase = (value: string): string => {
  if (!value) return '';
  
  return value
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Telefon numarasını formatlar
 * - Başta 0 olmalı
 * - Maksimum 11 karakter (0 + 10 rakam)
 * - Sadece rakam kabul eder
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return '0';
  
  // Sadece rakamları al
  let numbers = value.replace(/\D/g, '');
  
  // Eğer 0 ile başlamıyorsa, başına 0 ekle
  if (!numbers.startsWith('0')) {
    numbers = '0' + numbers;
  }
  
  // Maksimum 11 karakter (0 + 10 rakam)
  return numbers.slice(0, 11);
};

/**
 * E-posta adresini formatlar
 * - Tüm harfleri küçük yapar
 * - Türkçe karakterleri İngilizce karşılıklarına çevirir
 */
export const formatEmail = (value: string): string => {
  if (!value) return '';
  
  const turkishToEnglish: Record<string, string> = {
    'ç': 'c',
    'ğ': 'g',
    'ı': 'i',
    'ö': 'o',
    'ş': 's',
    'ü': 'u',
    'Ç': 'c',
    'Ğ': 'g',
    'İ': 'i',
    'Ö': 'o',
    'Ş': 's',
    'Ü': 'u'
  };
  
  return value
    .toLowerCase()
    .split('')
    .map(char => turkishToEnglish[char] || char)
    .join('');
};


