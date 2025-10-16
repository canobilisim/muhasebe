import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CashOpenCloseModal, 
  IncomeExpenseModal, 
  CashMovementsTable, 
  CashSummary,
  CashReports,
  DailyCashReport
} from '@/components/cash'
import { useCash } from '@/hooks/useCash'
import { Wallet, Plus, Minus, Calendar, RefreshCw, FileText, BarChart3 } from 'lucide-react'

export const CashPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [openModal, setOpenModal] = useState<'open' | 'close' | 'income' | 'expense' | null>(null)
  const [activeTab, setActiveTab] = useState<'operations' | 'daily-report' | 'reports'>('operations')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    movements,
    summary,
    isLoading,
    error,
    isCashOpened,
    isCashClosed,
    openDailyCash,
    closeDailyCash,
    addIncome,
    addExpense,
    refetch
  } = useCash(selectedDate)

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  const handleOpenCash = async (amount: number, description?: string) => {
    setIsSubmitting(true)
    try {
      await openDailyCash(amount, description)
      setOpenModal(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseCash = async (amount: number, description?: string) => {
    setIsSubmitting(true)
    try {
      await closeDailyCash(amount, description)
      setOpenModal(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddIncome = async (amount: number, description: string, referenceNumber?: string) => {
    setIsSubmitting(true)
    try {
      await addIncome(amount, description, referenceNumber)
      setOpenModal(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddExpense = async (amount: number, description: string, referenceNumber?: string) => {
    setIsSubmitting(true)
    try {
      await addExpense(amount, description, referenceNumber)
      setOpenModal(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout 
      title="Kasa Yönetimi" 
      subtitle="Günlük kasa işlemleri ve raporlama"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === 'operations' ? 'default' : 'outline'}
                onClick={() => setActiveTab('operations')}
                className="flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Kasa İşlemleri
              </Button>
              <Button
                variant={activeTab === 'daily-report' ? 'default' : 'outline'}
                onClick={() => setActiveTab('daily-report')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Günlük Rapor
              </Button>
              <Button
                variant={activeTab === 'reports' ? 'default' : 'outline'}
                onClick={() => setActiveTab('reports')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Detaylı Raporlar
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Kasa İşlemleri Tab */}
        {activeTab === 'operations' && (
          <>
            {/* Tarih Seçici ve Kontroller */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Kasa Kontrolü
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="date">Tarih</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {isToday && !isCashOpened && (
                  <Button
                    onClick={() => setOpenModal('open')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Kasa Aç
                  </Button>
                )}

                {isToday && isCashOpened && !isCashClosed && (
                  <>
                    <Button
                      onClick={() => setOpenModal('income')}
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Gelir Ekle
                    </Button>

                    <Button
                      onClick={() => setOpenModal('expense')}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Gider Ekle
                    </Button>

                    <Button
                      onClick={() => setOpenModal('close')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Kasa Kapat
                    </Button>
                  </>
                )}

                <Button
                  onClick={refetch}
                  variant="outline"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Yenile
                </Button>
              </div>
            </div>

            {/* Durum Mesajları */}
            {isToday && (
              <div className="mt-4 space-y-2">
                {!isCashOpened && (
                  <Alert>
                    <Wallet className="h-4 w-4" />
                    <AlertDescription>
                      Bugün için kasa henüz açılmamış. Kasa işlemlerine başlamak için kasayı açın.
                    </AlertDescription>
                  </Alert>
                )}

                {isCashOpened && !isCashClosed && (
                  <Alert className="border-green-200 bg-green-50">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Kasa açık. Gelir/gider işlemleri yapabilir ve günün sonunda kasayı kapatabilirsiniz.
                    </AlertDescription>
                  </Alert>
                )}

                {isCashClosed && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Wallet className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Kasa kapatılmış. Günlük işlemler tamamlanmış.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hata Mesajı */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Kasa Özeti */}
        <CashSummary summary={summary} isLoading={isLoading} />

            {/* Kasa Hareketleri */}
            <CashMovementsTable movements={movements} isLoading={isLoading} />
          </>
        )}

        {/* Günlük Rapor Tab */}
        {activeTab === 'daily-report' && (
          <DailyCashReport selectedDate={selectedDate} />
        )}

        {/* Detaylı Raporlar Tab */}
        {activeTab === 'reports' && (
          <CashReports />
        )}

        {/* Modaller */}
        <CashOpenCloseModal
          isOpen={openModal === 'open'}
          onClose={() => setOpenModal(null)}
          onSubmit={handleOpenCash}
          type="open"
          isLoading={isSubmitting}
        />

        <CashOpenCloseModal
          isOpen={openModal === 'close'}
          onClose={() => setOpenModal(null)}
          onSubmit={handleCloseCash}
          type="close"
          isLoading={isSubmitting}
        />

        <IncomeExpenseModal
          isOpen={openModal === 'income'}
          onClose={() => setOpenModal(null)}
          onSubmit={handleAddIncome}
          type="income"
          isLoading={isSubmitting}
        />

        <IncomeExpenseModal
          isOpen={openModal === 'expense'}
          onClose={() => setOpenModal(null)}
          onSubmit={handleAddExpense}
          type="expense"
          isLoading={isSubmitting}
        />
      </div>
    </Layout>
  )
}