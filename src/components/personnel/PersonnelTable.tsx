import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, Users } from 'lucide-react';
import { PersonnelWithStats } from '@/services/personnelService';
import { formatCurrency } from '@/lib/utils';

interface PersonnelTableProps {
  personnel: PersonnelWithStats[];
  loading: boolean;
  onPersonnelClick: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PersonnelTable({
  personnel,
  loading,
  onPersonnelClick,
  onEdit,
  onDelete,
}: PersonnelTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (personnel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium text-muted-foreground mb-2">Personel bulunamadı</p>
        <p className="text-sm text-muted-foreground">
          Yeni personel eklemek için yukarıdaki butonu kullanın
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Ad Soyad</TableHead>
            <TableHead className="font-semibold">Pozisyon</TableHead>
            <TableHead className="font-semibold">Departman</TableHead>
            <TableHead className="font-semibold">Telefon</TableHead>
            <TableHead className="font-semibold">İşe Başlama</TableHead>
            <TableHead className="text-right font-semibold">Maaş</TableHead>
            <TableHead className="font-semibold">Durum</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {personnel.map((person, index) => (
            <TableRow
              key={person.id}
              className={`cursor-pointer hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
              onClick={() => onPersonnelClick(person.id)}
            >
              <TableCell className="font-semibold">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 rounded-full bg-primary/20" />
                  {person.first_name} {person.last_name}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{person.position || '-'}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{person.department || '-'}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-mono">{person.phone || '-'}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {person.hire_date
                    ? new Date(person.hire_date).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '-'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/30">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {formatCurrency(person.monthly_salary || 0)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={person.is_active ? 'default' : 'secondary'}
                  className={person.is_active ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {person.is_active ? '✓ Aktif' : 'Pasif'}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onPersonnelClick(person.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Detaylar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(person.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(person.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
