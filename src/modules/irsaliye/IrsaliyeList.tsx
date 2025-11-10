import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileText, Eye, Edit } from 'lucide-react';
import { useIrsaliyeStore } from '@/stores/irsaliyeStore';
import { Irsaliye } from '@/types/irsaliye';
import { toast } from 'sonner';

const IrsaliyeList: React.FC = () => {
  const {
    irsaliyeList,
    isLoading,
    error,
    loadIrsaliyeList,
    generatePDF,
    clearError
  } = useIrsaliyeStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredList, setFilteredList] = useState<Irsaliye[]>([]);

  useEffect(() => {
    loadIrsaliyeList();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  // Arama filtresi
  useEffect(() => {
    if (!searchTerm) {
      setFilteredList(irsaliyeList);
    } else {
      const filtered = irsaliyeList.filter(irsaliye =>
        irsaliye.irsaliye_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        irsaliye.sevk_yeri?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        irsaliye.aciklama?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    }
  }, [irsaliyeList, searchTerm]);

  const handlePDFGenerate = async (irsaliye: Irsaliye) => {
    try {
      const pdfUrl = await generatePDF(irsaliye.id!);
      window.open(pdfUrl, '_blank');
      toast.success('PDF oluşturuldu');
    } catch (error) {
      toast.error('PDF oluşturma hatası');
    }
  };

  const getStatusBadge = (durum: string) => {
    const variants = {
      'Taslak': 'secondary',
      'Tamamlandı': 'default',
      'Faturalandı': 'destructive'
    } as const;

    return (
      <Badge variant={variants[durum as keyof typeof variants] || 'secondary'}>
        {durum}
      </Badge>
    );
  };

  const getTurBadge = (tur: string) => {
    const colors = {
      'Satış': 'bg-green-100 text-green-800',
      'Alış': 'bg-blue-100 text-blue-800',
      'İade': 'bg-red-100 text-red-800',
      'Transfer': 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={colors[tur as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {tur}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Başlık ve Arama */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">İrsaliye Listesi</h1>
        <Button onClick={() => window.location.href = '/irsaliye/yeni'}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni İrsaliye
        </Button>
      </div>

      {/* Arama ve Filtreler */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="İrsaliye no, sevk yeri veya açıklama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İrsaliye Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>
            İrsaliyeler ({filteredList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredList.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                {searchTerm ? 'Arama kriterlerine uygun irsaliye bulunamadı.' : 'Henüz irsaliye bulunmuyor.'}
              </div>
              {!searchTerm && (
                <Button 
                  className="mt-4" 
                  onClick={() => window.location.href = '/irsaliye/yeni'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  İlk İrsaliyeyi Oluştur
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İrsaliye No</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Cari</TableHead>
                    <TableHead>Sevk Yeri</TableHead>
                    <TableHead className="text-right">Toplam Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredList.map((irsaliye) => (
                    <TableRow key={irsaliye.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {irsaliye.irsaliye_no}
                      </TableCell>
                      <TableCell>
                        {new Date(irsaliye.irsaliye_tarihi).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        {getTurBadge(irsaliye.irsaliye_turu)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {irsaliye.cari_turu}
                          </Badge>
                          <span className="text-sm">
                            {/* Cari adı burada gösterilecek */}
                            Cari #{irsaliye.cari_id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        {irsaliye.sevk_yeri}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {irsaliye.toplam_tutar?.toFixed(2)} ₺
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(irsaliye.durum)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/irsaliye/${irsaliye.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/irsaliye/${irsaliye.id}/edit`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePDFGenerate(irsaliye)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Özet Kartları */}
      {filteredList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredList.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Toplam İrsaliye
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredList.filter(i => i.durum === 'Taslak').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Taslak
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredList.filter(i => i.durum === 'Tamamlandı').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tamamlandı
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredList.reduce((sum, i) => sum + (i.toplam_tutar || 0), 0).toFixed(0)} ₺
              </div>
              <p className="text-xs text-muted-foreground">
                Toplam Tutar
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IrsaliyeList;