import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { User, Briefcase, MapPin, Building2, Calendar, Phone, Mail, CreditCard, FileText } from 'lucide-react';
import type { Database } from '@/types/database';

type Personnel = Database['public']['Tables']['personnel']['Row'];

interface PersonnelInfoTabProps {
  personnel: Personnel;
}

const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
    <div className="mt-0.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  </div>
);

export function PersonnelInfoTab({ personnel }: PersonnelInfoTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Kişisel Bilgiler */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-lg">Kişisel Bilgiler</h3>
          </div>
          <div className="space-y-1">
            <InfoItem 
              icon={User} 
              label="Ad Soyad" 
              value={`${personnel.first_name} ${personnel.last_name}`} 
            />
            <InfoItem 
              icon={CreditCard} 
              label="TC Kimlik No" 
              value={personnel.tc_kimlik || '-'} 
            />
            <InfoItem 
              icon={Calendar} 
              label="Doğum Tarihi" 
              value={personnel.birth_date ? new Date(personnel.birth_date).toLocaleDateString('tr-TR') : '-'} 
            />
            <InfoItem 
              icon={Phone} 
              label="Telefon" 
              value={personnel.phone || '-'} 
            />
            <InfoItem 
              icon={Mail} 
              label="E-posta" 
              value={personnel.email || '-'} 
            />
          </div>
        </CardContent>
      </Card>

      {/* İş Bilgileri */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-lg">İş Bilgileri</h3>
          </div>
          <div className="space-y-1">
            <InfoItem 
              icon={Briefcase} 
              label="Pozisyon" 
              value={personnel.position || '-'} 
            />
            <InfoItem 
              icon={Building2} 
              label="Departman" 
              value={personnel.department || '-'} 
            />
            <InfoItem 
              icon={Calendar} 
              label="İşe Başlama" 
              value={new Date(personnel.hire_date).toLocaleDateString('tr-TR')} 
            />
            {personnel.termination_date && (
              <InfoItem 
                icon={Calendar} 
                label="İşten Ayrılma" 
                value={new Date(personnel.termination_date).toLocaleDateString('tr-TR')} 
              />
            )}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="mt-0.5">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-green-600 mb-0.5">Aylık Maaş</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(personnel.monthly_salary)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adres ve Banka Bilgileri */}
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-lg">İletişim & Banka</h3>
          </div>
          <div className="space-y-1">
            <InfoItem 
              icon={MapPin} 
              label="İl" 
              value={personnel.city || '-'} 
            />
            <InfoItem 
              icon={MapPin} 
              label="İlçe" 
              value={personnel.district || '-'} 
            />
            {personnel.address && (
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mt-0.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Adres</p>
                  <p className="text-sm font-medium">{personnel.address}</p>
                </div>
              </div>
            )}
            <div className="h-px bg-border my-2" />
            <InfoItem 
              icon={Building2} 
              label="Banka" 
              value={personnel.bank_name || '-'} 
            />
            {personnel.iban && (
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mt-0.5">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">IBAN</p>
                  <p className="text-xs font-mono font-medium break-all">{personnel.iban}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notlar */}
      {personnel.notes && (
        <Card className="md:col-span-2 lg:col-span-3 border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-lg">Notlar</h3>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{personnel.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
