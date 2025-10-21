import jsPDF from 'jspdf'
import { SaleWithDetails, Customer, User } from '@/types'
import { PaymentTypeLabels } from '@/types/enums'

export interface ReceiptData {
  sale: SaleWithDetails
  companyInfo: {
    name: string
    address: string
    phone: string
    taxNumber: string
  }
}

/**
 * Generate PDF receipt from sale data
 */
export function generateReceiptPDF(receiptData: ReceiptData): jsPDF {
  const { sale, companyInfo } = receiptData
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Thermal printer format (80mm width)
  })

  let yPosition = 10
  const lineHeight = 4
  const pageWidth = 80

  // Helper function to add centered text
  const addCenteredText = (text: string, fontSize = 10, isBold = false) => {
    doc.setFontSize(fontSize)
    if (isBold) {
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setFont('helvetica', 'normal')
    }
    const textWidth = doc.getTextWidth(text)
    const x = (pageWidth - textWidth) / 2
    doc.text(text, x, yPosition)
    yPosition += lineHeight
  }

  // Helper function to add left-aligned text
  const addLeftText = (text: string, fontSize = 8) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', 'normal')
    doc.text(text, 2, yPosition)
    yPosition += lineHeight
  }

  // Helper function to add line with left and right text
  const addLineWithRightText = (leftText: string, rightText: string, fontSize = 8) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', 'normal')
    doc.text(leftText, 2, yPosition)
    const rightTextWidth = doc.getTextWidth(rightText)
    doc.text(rightText, pageWidth - rightTextWidth - 2, yPosition)
    yPosition += lineHeight
  }

  // Helper function to add separator line
  const addSeparatorLine = () => {
    doc.line(2, yPosition, pageWidth - 2, yPosition)
    yPosition += lineHeight
  }

  // Company header
  addCenteredText(companyInfo.name, 12, true)
  addCenteredText(companyInfo.address, 8)
  addCenteredText(`Tel: ${companyInfo.phone}`, 8)
  addCenteredText(`Vergi No: ${companyInfo.taxNumber}`, 8)
  
  yPosition += 2
  addSeparatorLine()

  // Receipt title and info
  addCenteredText('SATIŞ FİŞİ', 10, true)
  addLeftText(`Fiş No: ${sale.sale_number}`)
  addLeftText(`Tarih: ${new Date(sale.sale_date).toLocaleString('tr-TR')}`)
  addLeftText(`Kasiyer: ${sale.user?.full_name || 'Bilinmiyor'}`)
  
  if (sale.customer) {
    addLeftText(`Müşteri: ${sale.customer.name}`)
    if (sale.customer.phone) {
      addLeftText(`Tel: ${sale.customer.phone}`)
    }
  }

  yPosition += 2
  addSeparatorLine()

  // Items header
  addLeftText('ÜRÜNLER', 9)
  addSeparatorLine()

  // Items list
  sale.sale_items?.forEach((item) => {
    const product = item.product
    if (product) {
      // Product name
      addLeftText(product.name, 8)
      
      // Quantity, price, total
      const qtyPriceText = `${item.quantity} x ${item.unit_price.toFixed(2)} TL`
      const totalText = `${item.total_amount.toFixed(2)} TL`
      addLineWithRightText(qtyPriceText, totalText, 8)
      
      // Discount if any
      if (item.discount_amount > 0) {
        addLineWithRightText(`İndirim:`, `-${item.discount_amount.toFixed(2)} TL`, 8)
      }
      
      yPosition += 1 // Small gap between items
    }
  })

  addSeparatorLine()

  // Totals
  addLineWithRightText('Ara Toplam:', `${sale.total_amount.toFixed(2)} TL`)
  
  if (sale.discount_amount > 0) {
    addLineWithRightText('İndirim:', `-${sale.discount_amount.toFixed(2)} TL`)
  }
  
  addLineWithRightText('KDV:', `${sale.tax_amount.toFixed(2)} TL`)
  addLineWithRightText('TOPLAM:', `${sale.net_amount.toFixed(2)} TL`, 10)

  addSeparatorLine()

  // Payment info
  addLeftText('ÖDEME BİLGİLERİ', 9)
  addLineWithRightText('Ödeme Türü:', PaymentTypeLabels[sale.payment_type as keyof typeof PaymentTypeLabels])
  addLineWithRightText('Ödenen:', `${sale.paid_amount.toFixed(2)} TL`)
  
  if (sale.change_amount > 0) {
    addLineWithRightText('Para Üstü:', `${sale.change_amount.toFixed(2)} TL`)
  }
  


  yPosition += 4
  addSeparatorLine()

  // Footer
  addCenteredText('Teşekkür Ederiz!', 10, true)
  addCenteredText('İyi Günler Dileriz', 8)

  return doc
}

/**
 * Generate WhatsApp message text for receipt
 */
export function generateWhatsAppMessage(sale: SaleWithDetails, companyInfo: { name: string }): string {
  const items = sale.sale_items?.map(item => {
    const product = item.product
    if (!product) return ''
    
    let itemText = `• ${product.name}\n  ${item.quantity} x ${item.unit_price.toFixed(2)} TL = ${item.total_amount.toFixed(2)} TL`
    
    if (item.discount_amount > 0) {
      itemText += `\n  İndirim: -${item.discount_amount.toFixed(2)} TL`
    }
    
    return itemText
  }).filter(Boolean).join('\n\n')

  const message = `
🧾 *${companyInfo.name}*
📋 *SATIŞ FİŞİ*

🔢 Fiş No: ${sale.sale_number}
📅 Tarih: ${new Date(sale.sale_date).toLocaleString('tr-TR')}
${sale.customer ? `👤 Müşteri: ${sale.customer.name}` : ''}

📦 *ÜRÜNLER:*
${items}

💰 *TOPLAM:*
Ara Toplam: ${sale.total_amount.toFixed(2)} TL
${sale.discount_amount > 0 ? `İndirim: -${sale.discount_amount.toFixed(2)} TL\n` : ''}KDV: ${sale.tax_amount.toFixed(2)} TL
*TOPLAM: ${sale.net_amount.toFixed(2)} TL*

💳 *ÖDEME:*
Tür: ${PaymentTypeLabels[sale.payment_type as keyof typeof PaymentTypeLabels]}
Ödenen: ${sale.paid_amount.toFixed(2)} TL
${sale.change_amount > 0 ? `Para Üstü: ${sale.change_amount.toFixed(2)} TL\n` : ''}
Teşekkür ederiz! 🙏
  `.trim()

  return message
}

/**
 * Generate WhatsApp URL for sending receipt
 */
export function generateWhatsAppURL(phoneNumber: string, message: string): string {
  // Clean phone number (remove spaces, dashes, parentheses)
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
  
  // Add country code if not present (assuming Turkey +90)
  const formattedPhone = cleanPhone.startsWith('90') ? cleanPhone : `90${cleanPhone}`
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}

/**
 * Download PDF file
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}

/**
 * Print PDF directly (if browser supports it)
 */
export function printPDF(doc: jsPDF) {
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  
  const printWindow = window.open(pdfUrl)
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
      printWindow.onafterprint = () => {
        printWindow.close()
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }
}