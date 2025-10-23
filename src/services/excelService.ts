import { Product } from '@/types'

export class ExcelService {
  /**
   * Export products to CSV file
   * Includes all columns: basic info, technical specs, and stock info
   */
  static exportProductsToCSV(products: Product[]): void {
    const headers = [
      'Barkod',
      'Ürün Adı',
      'Kategori',
      'Birim',
      'KDV Oranı (%)',
      'Alış Fiyatı',
      'Satış Fiyatı',
      'Stok Miktarı',
      'Kritik Seviye',
      'Marka',
      'Model',
      'Renk',
      'Seri No',
      'Durum',
      'Seri No Takibi',
      'Stok Takibi',
      'Durum (Aktif/Pasif)'
    ]

    const rows = products.map(product => [
      product.barcode || '',
      product.name || '',
      product.category || '',
      product.unit || 'Adet',
      product.vat_rate?.toString() || '20',
      product.purchase_price?.toString() || '0',
      product.sale_price?.toString() || '0',
      product.stock_quantity?.toString() || '0',
      product.critical_stock_level?.toString() || '0',
      product.brand || '',
      product.model || '',
      product.color || '',
      product.serial_number || '',
      product.condition || '',
      product.serial_number_tracking_enabled ? 'Evet' : 'Hayır',
      product.stock_tracking_enabled ? 'Evet' : 'Hayır',
      product.is_active ? 'Aktif' : 'Pasif'
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `urunler_${timestamp}.csv`
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Export products to Excel file (XLSX format)
   * Note: This requires xlsx library to be installed
   * For now, we'll use CSV as a fallback
   */
  static exportProductsToExcel(products: Product[]): void {
    // For now, use CSV export
    // In the future, this can be enhanced with xlsx library
    this.exportProductsToCSV(products)
  }
}
