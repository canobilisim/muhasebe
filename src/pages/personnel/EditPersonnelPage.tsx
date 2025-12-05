import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, User, Briefcase, MapPin, Building2, FileText } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getPersonnelById, updatePersonnel } from '@/services/personnelService';
import { toast } from 'sonner';

const personnelSchema = z.object({
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  tc_kimlik: z.string().length(11, 'TC Kimlik No 11 haneli olmalıdır').optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  birth_date: z.string().optional(),
  hire_date: z.string().min(1, 'İşe başlama tarihi zorunludur'),
  termination_date: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  monthly_salary: z.number().min(0, 'Maaş 0 veya daha büyük olmalıdır'),
  salary_day: z.number().min(1, 'Maaş günü 1-31 arası olmalıdır').max(31, 'Maaş günü 1-31 arası olmalıdır').optional(),
  iban: z.string().optional(),
  bank_name: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
});

type PersonnelFormData = z.infer<typeof personnelSchema>;

export default function EditPersonnelPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema),
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (id) {
      loadPersonnel();
    }
  }, [id]);

  const loadPersonnel = async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
      const personnel = await getPersonnelById(id);
      
      reset({
        first_name: personnel.first_name,
        last_name: personnel.last_name,
        tc_kimlik: personnel.tc_kimlik || '',
        phone: personnel.phone || '',
        email: personnel.email || '',
        address: personnel.address || '',
        city: personnel.city || '',
        district: personnel.district || '',
        birth_date: personnel.birth_date || '',
        hire_date: personnel.hire_date,
        termination_date: personnel.termination_date || '',
        position: personnel.position || '',
        department: personnel.department || '',
        monthly_salary: personnel.monthly_salary,
        salary_day: personnel.salary_day || 1,
        iban: personnel.iban || '',
        bank_name: personnel.bank_name || '',
        notes: personnel.notes || '',
        is_active: personnel.is_active ?? true,
      });
    } catch (error: any) {
      toast.error('Personel bilgileri yüklenirken hata oluştu', {
        description: error.message,
      });
      navigate('/personnel');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: PersonnelFormData) => {
    if (!id) return;

    try {
      setLoading(true);

      await updatePersonnel(id, {
        ...data,
        tc_kimlik: data.tc_kimlik || null,
        email: data.email || null,
        birth_date: data.birth_date || null,
        termination_date: data.termination_date || null,
      });

      toast.success('Personel bilgileri güncellendi');
      navigate(`/personnel/${id}`);
    } catch (error: any) {
      toast.error('Personel güncellenirken hata oluştu', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Yükleniyor...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/personnel/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Personel Düzenle</h1>
          <p className="text-muted-foreground mt-1">Personel bilgilerini güncelleyiniz</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Durum */}
        <Card>
          <CardHeader>
            <CardTitle>Durum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label>Personel Aktif</Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Pasif personeller listede görünmez ve işlem yapılamaz
            </p>
          </CardContent>
        </Card>

        {/* Kişisel Bilgiler */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Ad *</Label>
                <Input {...register('first_name')} />
                {errors.first_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="last_name">Soyad *</Label>
                <Input {...register('last_name')} />
                {errors.last_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tc_kimlik">TC Kimlik No</Label>
                <Input {...register('tc_kimlik')} maxLength={11} />
                {errors.tc_kimlik && (
                  <p className="text-sm text-red-500 mt-1">{errors.tc_kimlik.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="birth_date">Doğum Tarihi</Label>
                <Input type="date" {...register('birth_date')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input {...register('phone')} />
              </div>

              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İş Bilgileri */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-500" />
              İş Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Pozisyon</Label>
                <Input {...register('position')} placeholder="Örn: Satış Danışmanı" />
              </div>

              <div>
                <Label htmlFor="department">Departman</Label>
                <Input {...register('department')} placeholder="Örn: Satış" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hire_date">İşe Başlama Tarihi *</Label>
                <Input type="date" {...register('hire_date')} />
                {errors.hire_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.hire_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="termination_date">İşten Ayrılma Tarihi</Label>
                <Input type="date" {...register('termination_date')} />
              </div>
            </div>

            <div>
              <Label htmlFor="monthly_salary">Aylık Maaş (TL) *</Label>
              <Input
                type="number"
                step="0.01"
                {...register('monthly_salary', { valueAsNumber: true })}
              />
              {errors.monthly_salary && (
                <p className="text-sm text-red-500 mt-1">{errors.monthly_salary.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="salary_day">Maaş Günü (Ayın Kaçı)</Label>
              <Input
                type="number"
                min="1"
                max="31"
                placeholder="1-31 arası"
                {...register('salary_day', { valueAsNumber: true })}
              />
              {errors.salary_day && (
                <p className="text-sm text-red-500 mt-1">{errors.salary_day.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Hesap hareketleri bu günden itibaren filtrelenecektir
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Adres Bilgileri */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              Adres Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">İl</Label>
                <Input {...register('city')} />
              </div>

              <div>
                <Label htmlFor="district">İlçe</Label>
                <Input {...register('district')} />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Adres</Label>
              <Textarea {...register('address')} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Banka Bilgileri */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-500" />
              Banka Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name">Banka Adı</Label>
                <Input {...register('bank_name')} />
              </div>

              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input {...register('iban')} maxLength={34} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        <Card className="border-l-4 border-l-slate-500">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              Notlar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Textarea {...register('notes')} rows={4} placeholder="Ek notlar..." className="resize-none" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate(`/personnel/${id}`)}
          >
            İptal
          </Button>
          <Button type="submit" disabled={loading} size="lg" className="min-w-[150px]">
            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
      </form>
      </div>
    </Layout>
  );
}
