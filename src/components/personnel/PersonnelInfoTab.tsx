import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Database } from '@/types/database';

type Personnel = Database['public']['Tables']['personnel']['Row'];

interface PersonnelInfoTabProps {
  personnel: Personnel;
}

export function PersonnelInfoTab({ personnel }: PersonnelInfoTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Kişisel Bilgiler */}
      <Card>
        <CardHeader>
          <CardTitle>Kişisel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Ad Soyad</label>
            <p className="text-base">
              {personnel.first_name} {personnel.last_name}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">TC Kimlik No</label>
            <p className="text-base">{personnel.tc_kimlik || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Doğum Tarihi</label>
            <p className="text-base">
              {personnel.birth_date
                ? new Date(personnel.birth_date).toLocaleDateString('tr-TR')
                : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Telefon</label>
            <p className="text-base">{personnel.phone || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">E-posta</label>
            <p className="text-base">{personnel.email || '-'}</p>
          </div>
        </CardContent>
      </Card>

      {/* İş Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>İş Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Pozisyon</label>
            <p className="text-base">{personnel.position || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Departman</label>
            <p className="text-base">{personnel.department || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">İşe Başlama Tarihi</label>
            <p className="text-base">
              {new Date(personnel.hire_date).toLocaleDateString('tr-TR')}
            </p>
          </div>
          {personnel.termination_date && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                İşten Ayrılma Tarihi
              </label>
              <p className="text-base">
                {new Date(personnel.termination_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Aylık Maaş</label>
            <p className="text-base font-semibold">{formatCurrency(personnel.monthly_salary)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Adres Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Adres Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">İl</label>
            <p className="text-base">{personnel.city || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">İlçe</label>
            <p className="text-base">{personnel.district || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Adres</label>
            <p className="text-base">{personnel.address || '-'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Banka Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Banka Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Banka Adı</label>
            <p className="text-base">{personnel.bank_name || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">IBAN</label>
            <p className="text-base font-mono">{personnel.iban || '-'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Notlar */}
      {personnel.notes && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{personnel.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
