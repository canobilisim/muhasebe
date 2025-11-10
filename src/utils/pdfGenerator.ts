import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Irsaliye, IrsaliyeUrunu } from '@/types/irsaliye';

// jsPDF için tip genişletme
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface IrsaliyePDFData {
  irsaliye: Irsaliye;
  urunler: IrsaliyeUrunu[];
  cari: {
    ad: string;
    adres: string;
    telefon: string;
    vergi_no: string;
  };
  firma: {
    ad: string;
    adres: string;
    telefon: string;
    vergi_no: string;
    logo?: string;
  };
}

export class IrsaliyePDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
  }

  generatePDF(data: IrsaliyePDFData): string {
    this.addHeader(data);
    this.addIrsaliyeInfo(data.irsaliye);
    this.addCariInfo(data.cari);
    this.addProductTable(data.urunler);
    this.addFooter(data.irsaliye);
    this.addSignatureArea();

    return this.doc.output('datauristring');
  }

  private addHeader(data: IrsaliyePDFData): void {
    // Logo (eğer varsa)
    if (data.firma.logo) {
      try {
        this.doc.addImage(data.firma.logo, 'PNG', this.margin, this.margin, 30, 20);
      } catch (error) {
        console.warn('Logo eklenemedi:', error);
      }
    }

    // Firma bilgileri
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.firma.ad, this.margin + 35, this.margin + 5);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(data.firma.adres, this.margin + 35, this.margin + 12);
    this.doc.text(`Tel: ${data.firma.telefon}`, this.margin + 35, this.margin + 18);
    this.doc.text(`Vergi No: ${data.firma.vergi_no}`, this.margin + 35, this.margin + 24);

    // İrsaliye başlığı
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    const title = 'İRSALİYE BELGESİ';
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, (this.pageWidth - titleWidth) / 2, this.margin + 50);

    // Çizgi
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.margin + 55, this.pageWidth - this.margin, this.margin + 55);
  }

  private addIrsaliyeInfo(irsaliye: Irsaliye): void {
    const startY = this.margin + 65;
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');

    // Sol kolon
    this.doc.text('İrsaliye No:', this.margin, startY);
    this.doc.text('İrsaliye Tarihi:', this.margin, startY + 8);
    this.doc.text('Sevk Tarihi:', this.margin, startY + 16);
    this.doc.text('İrsaliye Türü:', this.margin, startY + 24);

    // Sağ kolon - değerler
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(irsaliye.irsaliye_no, this.margin + 50, startY);
    this.doc.text(new Date(irsaliye.irsaliye_tarihi).toLocaleDateString('tr-TR'), this.margin + 50, startY + 8);
    this.doc.text(new Date(irsaliye.sevk_tarihi).toLocaleDateString('tr-TR'), this.margin + 50, startY + 16);
    this.doc.text(irsaliye.irsaliye_turu, this.margin + 50, startY + 24);

    // Durum badge
    const statusX = this.pageWidth - this.margin - 40;
    this.doc.setFillColor(irsaliye.durum === 'Tamamlandı' ? 34 : irsaliye.durum === 'Taslak' ? 255 : 156, 
                         irsaliye.durum === 'Tamamlandı' ? 197 : irsaliye.durum === 'Taslak' ? 193 : 39, 
                         irsaliye.durum === 'Tamamlandı' ? 94 : irsaliye.durum === 'Taslak' ? 7 : 176);
    this.doc.roundedRect(statusX, startY - 5, 35, 12, 2, 2, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(9);
    this.doc.text(irsaliye.durum, statusX + 17.5 - (this.doc.getTextWidth(irsaliye.durum) / 2), startY + 2);
    this.doc.setTextColor(0, 0, 0);
  }

  private addCariInfo(cari: any): void {
    const startY = this.margin + 105;
    
    // Cari bilgileri kutusu
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, startY, this.pageWidth - (2 * this.margin), 35);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ALICI BİLGİLERİ', this.margin + 5, startY + 8);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.text(`Ad/Ünvan: ${cari.ad}`, this.margin + 5, startY + 16);
    this.doc.text(`Adres: ${cari.adres}`, this.margin + 5, startY + 23);
    this.doc.text(`Telefon: ${cari.telefon}`, this.margin + 5, startY + 30);
    
    // Vergi no sağ tarafa
    this.doc.text(`Vergi No: ${cari.vergi_no}`, this.pageWidth - this.margin - 60, startY + 16);
  }

  private addProductTable(urunler: IrsaliyeUrunu[]): void {
    const startY = this.margin + 150;

    const tableData = urunler.map((urun, index) => [
      (index + 1).toString(),
      urun.urun_adi,
      urun.miktar.toString(),
      urun.birim,
      urun.birim_fiyat ? `${urun.birim_fiyat.toFixed(2)} ₺` : '-',
      urun.tutar ? `${urun.tutar.toFixed(2)} ₺` : '-',
      urun.seri_no || '-'
    ]);

    this.doc.autoTable({
      startY: startY,
      head: [['#', 'Ürün Adı', 'Miktar', 'Birim', 'Birim Fiyat', 'Tutar', 'Seri/Lot No']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 60 },
        2: { halign: 'right', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'right', cellWidth: 25 },
        6: { halign: 'center', cellWidth: 25 }
      },
      margin: { left: this.margin, right: this.margin }
    });

    // Toplamlar
    const finalY = (this.doc as any).lastAutoTable.finalY + 10;
    const totalMiktar = urunler.reduce((sum, urun) => sum + urun.miktar, 0);
    const totalTutar = urunler.reduce((sum, urun) => sum + (urun.tutar || 0), 0);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    const rightX = this.pageWidth - this.margin - 60;
    this.doc.text(`Toplam Kalem: ${urunler.length}`, rightX, finalY);
    this.doc.text(`Toplam Miktar: ${totalMiktar}`, rightX, finalY + 8);
    this.doc.text(`Toplam Tutar: ${totalTutar.toFixed(2)} ₺`, rightX, finalY + 16);
  }

  private addFooter(irsaliye: Irsaliye): void {
    const footerY = this.pageHeight - 60;

    // Açıklama
    if (irsaliye.aciklama) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Açıklama:', this.margin, footerY - 20);
      
      // Uzun açıklamaları böl
      const splitText = this.doc.splitTextToSize(irsaliye.aciklama, this.pageWidth - (2 * this.margin));
      this.doc.text(splitText, this.margin, footerY - 12);
    }

    // Uyarı metni
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(100, 100, 100);
    const warningText = 'Bu belge fatura yerine geçmez.';
    const warningWidth = this.doc.getTextWidth(warningText);
    this.doc.text(warningText, (this.pageWidth - warningWidth) / 2, footerY + 10);
    this.doc.setTextColor(0, 0, 0);

    // Tarih ve sayfa numarası
    this.doc.setFontSize(8);
    this.doc.text(`Oluşturulma: ${new Date().toLocaleString('tr-TR')}`, this.margin, this.pageHeight - 15);
    this.doc.text('Sayfa 1', this.pageWidth - this.margin - 20, this.pageHeight - 15);
  }

  private addSignatureArea(): void {
    const signatureY = this.pageHeight - 100;
    
    // Teslim eden
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TESLİM EDEN', this.margin + 20, signatureY);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, signatureY + 20, this.margin + 80, signatureY + 20);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.text('Ad Soyad:', this.margin, signatureY + 28);
    this.doc.text('İmza:', this.margin, signatureY + 35);

    // Teslim alan
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.text('TESLİM ALAN', this.pageWidth - this.margin - 60, signatureY);
    this.doc.line(this.pageWidth - this.margin - 80, signatureY + 20, this.pageWidth - this.margin, signatureY + 20);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.text('Ad Soyad:', this.pageWidth - this.margin - 80, signatureY + 28);
    this.doc.text('İmza:', this.pageWidth - this.margin - 80, signatureY + 35);
  }

  downloadPDF(filename: string): void {
    this.doc.save(filename);
  }

  getPDFBlob(): Blob {
    return this.doc.output('blob');
  }
}

// Kullanım kolaylığı için yardımcı fonksiyon
export const generateIrsaliyePDF = (data: IrsaliyePDFData): string => {
  const generator = new IrsaliyePDFGenerator();
  return generator.generatePDF(data);
};

export const downloadIrsaliyePDF = (data: IrsaliyePDFData, filename?: string): void => {
  const generator = new IrsaliyePDFGenerator();
  generator.generatePDF(data);
  generator.downloadPDF(filename || `irsaliye_${data.irsaliye.irsaliye_no}.pdf`);
};