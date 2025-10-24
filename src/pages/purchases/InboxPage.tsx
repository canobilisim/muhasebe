import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, Mail, FileText, Clock } from 'lucide-react';

export default function InboxPage() {
  return (
    <Layout
      title="Gelen Kutusu"
      subtitle="Tedarikçilerden gelen fatura ve belgeler"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Yeni Belgeler</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bekleyen</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">İşlenen</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Archive className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Arşivlenen</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inbox Content */}
        <Card>
          <CardHeader>
            <CardTitle>Gelen Belgeler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Archive className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Gelen kutusu boş
              </h3>
              <p className="text-gray-500">
                Tedarikçilerden gelen fatura ve belgeler burada görünecek.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}