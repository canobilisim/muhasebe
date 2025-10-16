import React, { useEffect, useState } from 'react'
import { X, Download, Printer, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SaleWithDetails } from '@/types'
import { PaymentTypeLabels, PaymentStatusLabels } from '@/types/enums'
import { 
  generateReceiptPDF, 
  generateWhatsAppMessage, 
  generateWhatsAppURL,
  downloadPDF,
  printPDF
} from '@/services/receiptService'
import { getSaleDetails } from '@/services/salesService'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  saleId: string
  saleNumber: string
}

const COMPANY_INFO = {
  name: 'Cano Ön Muhasebe',
  address: 'Örnek Mahallesi, Örnek Sokak No:1',
  phone: '0212 123 45 67',
  taxNumber: '1234567890'
}

export function ReceiptModal({ isOpen, onClose, saleId, saleNumber }: ReceiptModalProps) {
  const [sale, setSale] = useState<SaleWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && saleId) {
      loadSaleDetails()
    }
  }, [isOpen, saleId])

  const loadSaleDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const saleData = await getSaleDetails(saleId)
      setSale(saleData)
      
      // Pre-fill WhatsApp phone if customer has phone
      if (saleData.customer?.phone) {
        setWhatsappPhone(saleData.customer.phone)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fiş detayları yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!sale) return
    
    const pdf = generateReceiptPDF({
      sale,
      companyInfo: COMPANY_INFO
    })
    
    downloadPDF(pdf, `fis-${saleNumber}.pdf`)
  }

  const handlePrintPDF = () => {
    if (!sale) return
    
    const pdf = generateReceiptPDF({
      sale,
      companyInfo: COMPANY_INFO
    })
    
    printPDF(pdf)
  }

  const handleSendWhatsApp = () => {
    if (!sale || !whatsappPhone.trim()) return
    
    const message = generateWhatsAppMessage(sale, COMPANY_INFO)
    const whatsappUrl = generateWhatsAppURL(whatsappPhone, message)
    
    window.open(whatsappUrl, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Fiş İşlemleri</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Fiş detayları yükleniyor...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {sale && (
            <>
              {/* Receipt Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">{COMPANY_INFO.name}</h3>
                  <p className="text-sm text-gray-600">{COMPANY_INFO.address}</p>
                  <p className="text-sm text-gray-600">Tel: {COMPANY_INFO.phone}</p>
                  <p className="text-sm text-gray-600">Vergi No: {COMPANY_INFO.taxNumber}</p>
                </div>

                <div className="border-t border-b border-gray-300 py-2 mb-4">
                  <h4 className="font-semibold text-center">SATIŞ FİŞİ</h4>
                </div>

                <div className="space-y-1 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Fiş No:</span>
                    <span>{sale.sale_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarih:</span>
                    <span>{new Date(sale.sale_date).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasiyer:</span>
                    <span>{sale.user?.full_name || 'Bilinmiyor'}</span>
                  </div>
                  {sale.customer && (
                    <div className="flex justify-between">
                      <span>Müşteri:</span>
                      <span>{sale.customer.name}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-300 pt-2 mb-4">
                  <h5 className="font-medium mb-2">ÜRÜNLER</h5>
                  {sale.sale_items?.map((item, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.product?.name}</span>
                        <span>{item.total_amount.toFixed(2)} TL</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{item.quantity} x {item.unit_price.toFixed(2)} TL</span>
                        {item.discount_amount > 0 && (
                          <span>İndirim: -{item.discount_amount.toFixed(2)} TL</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-300 pt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Ara Toplam:</span>
                    <span>{sale.total_amount.toFixed(2)} TL</span>
                  </div>
                  {sale.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span>İndirim:</span>
                      <span>-{sale.discount_amount.toFixed(2)} TL</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>KDV:</span>
                    <span>{sale.tax_amount.toFixed(2)} TL</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>TOPLAM:</span>
                    <span>{sale.net_amount.toFixed(2)} TL</span>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-2 mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Ödeme Türü:</span>
                    <span>{PaymentTypeLabels[sale.payment_type as keyof typeof PaymentTypeLabels]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ödenen:</span>
                    <span>{sale.paid_amount.toFixed(2)} TL</span>
                  </div>
                  {sale.change_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Para Üstü:</span>
                      <span>{sale.change_amount.toFixed(2)} TL</span>
                    </div>
                  )}
                </div>

                <div className="text-center mt-4 pt-2 border-t border-gray-300">
                  <p className="font-semibold">Teşekkür Ederiz!</p>
                  <p className="text-sm text-gray-600">İyi Günler Dileriz</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Print and Download */}
                <div className="flex gap-2">
                  <Button
                    onClick={handlePrintPDF}
                    className="flex-1"
                    variant="outline"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Yazdır
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    className="flex-1"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF İndir
                  </Button>
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-phone">WhatsApp Gönder</Label>
                  <div className="flex gap-2">
                    <Input
                      id="whatsapp-phone"
                      placeholder="Telefon numarası (5xxxxxxxxx)"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendWhatsApp}
                      disabled={!whatsappPhone.trim()}
                      variant="outline"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Gönder
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}