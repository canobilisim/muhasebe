import { describe, it, expect } from 'vitest';
import {
  formatNameToTitleCase,
  formatPhoneNumber,
  formatEmail
} from '../inputFormatters';

describe('inputFormatters', () => {
  describe('formatNameToTitleCase', () => {
    it('her kelimenin baş harfini büyük yapar', () => {
      expect(formatNameToTitleCase('ahmet yılmaz')).toBe('Ahmet Yılmaz');
      expect(formatNameToTitleCase('MEHMET ALİ')).toBe('Mehmet Ali');
      expect(formatNameToTitleCase('ayşe fatma zeynep')).toBe('Ayşe Fatma Zeynep');
    });

    it('boş string için boş string döner', () => {
      expect(formatNameToTitleCase('')).toBe('');
    });

    it('tek kelime için çalışır', () => {
      expect(formatNameToTitleCase('ahmet')).toBe('Ahmet');
    });
  });

  describe('formatPhoneNumber', () => {
    it('başına 0 ekler', () => {
      expect(formatPhoneNumber('5321234567')).toBe('05321234567');
    });

    it('zaten 0 ile başlıyorsa değiştirmez', () => {
      expect(formatPhoneNumber('05321234567')).toBe('05321234567');
    });

    it('sadece rakamları alır', () => {
      expect(formatPhoneNumber('0532 123 45 67')).toBe('05321234567');
      expect(formatPhoneNumber('0532-123-45-67')).toBe('05321234567');
      expect(formatPhoneNumber('(0532) 123 45 67')).toBe('05321234567');
    });

    it('maksimum 11 karakter kabul eder', () => {
      expect(formatPhoneNumber('053212345678999')).toBe('05321234567');
    });

    it('boş string için 0 döner', () => {
      expect(formatPhoneNumber('')).toBe('0');
    });
  });

  describe('formatEmail', () => {
    it('tüm harfleri küçük yapar', () => {
      expect(formatEmail('AHMET@EMAIL.COM')).toBe('ahmet@email.com');
      expect(formatEmail('Ahmet.Yilmaz@Email.COM')).toBe('ahmet.yilmaz@email.com');
    });

    it('türkçe karakterleri ingilizce karşılıklarına çevirir', () => {
      expect(formatEmail('ahmet.şahin@email.com')).toBe('ahmet.sahin@email.com');
      expect(formatEmail('çağlar.öztürk@email.com')).toBe('caglar.ozturk@email.com');
      expect(formatEmail('İĞÜŞÇÖ@email.com')).toBe('igusco@email.com');
    });

    it('boş string için boş string döner', () => {
      expect(formatEmail('')).toBe('');
    });

    it('karmaşık e-posta adreslerini formatlar', () => {
      expect(formatEmail('Ahmet.Şahin+Test@Email.COM')).toBe('ahmet.sahin+test@email.com');
    });
  });

});
