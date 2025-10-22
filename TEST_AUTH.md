# Authentication Test

## Kontrol Edilecekler

1. **Tarayıcı Console'da çalıştır:**
```javascript
// Supabase session kontrolü
const { data: { session } } = await window.supabase.auth.getSession()
console.log('Session:', session)
console.log('User ID:', session?.user?.id)
console.log('User Email:', session?.user?.email)
```

2. **LocalStorage kontrolü:**
```javascript
// LocalStorage'da token var mı?
console.log('Auth Token:', localStorage.getItem('supabase.auth.token'))
```

3. **Network tab kontrolü:**
- Request Headers'da `Authorization: Bearer ...` var mı?
- 406 hatası alıyorsanız, `Accept` header'ı kontrol edin

## Çözüm Adımları

Eğer session yoksa:
1. Logout yapın
2. Tekrar login yapın
3. Sayfayı yenileyin

Eğer session varsa ama 406 hatası alıyorsanız:
- RLS politikaları düzeltildi
- Sayfayı yenileyin (F5)
- Hard refresh yapın (Ctrl+Shift+R)
