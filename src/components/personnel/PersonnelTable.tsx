import { useState } from 'react';
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
import { MoreHorizontal, Eye, Edit, Trash2, DollarSign, CreditCard } from 'lucide-react';
import { PersonnelWithStats } from '@/services/personnelService';
import { formatCurrency } from '@/lib/utils';

interface PersonnelTableProps {
  personnel: PersonnelWithStats[];
  loading: boolean;
  onPersonnelClick: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function PersonnelTable({
  personnel,
  loading,
  onPersonnelClick,
  onEdit,
  onDelete,
  onRefresh,
}: PersonnelTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (personnel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">Personel bulunamadı</p>
        <p className="text-sm text-muted-foreground">
          Yeni personel eklemek için yukarıdaki butonu kullanın
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>Pozisyon</TableHead>
            <TableHead>Departman</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>İşe Başlama</TableHead>
            <TableHead className="text-right">Maaş</TableHead>
            <TableHead className="text-right">Kalan Avans</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {personnel.map((person) => (
            <TableRow
              key={person.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onPersonnelClick(person.id)}
            >
              <TableCell className="font-medium">
                {person.first_name} {person.last_name}
              </TableCell>
              <TableCell>{person.position || '-'}</TableCell>
              <TableCell>{person.department || '-'}</TableCell>
              <TableCell>{person.phone || '-'}</TableCell>
              <TableCell>
                {person.hire_date
                  ? new Date(person.hire_date).toLocaleDateString('tr-TR')
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(person.monthly_salary)}
              </TableCell>
              <TableCell className="text-right">
                {person.remaining_advances > 0 ? (
                  <span className="text-orange-600 font-medium">
                    {formatCurrency(person.remaining_advances)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={person.is_active ? 'default' : 'secondary'}>
                  {person.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                    <DropdownMenuItem onClick={() => onPersonnelClick(person.id)}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Maaş Öde
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPersonnelClick(person.id)}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Avans Ver
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(person.id)}
                      className="text-red-600"
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
