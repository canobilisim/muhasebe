import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PersonnelTransactionPDF {
  id: string;
  personnel_id: string;
  transaction_date: string;
  transaction_type: string;
  description: string | null;
  debit_amount: number | null;
  credit_amount: number | null;
  balance: number | null;
  payment_type: string | null;
  notes: string | null;
  transaction_number: string | null;
  created_at: string | null;
}

export interface PersonnelPDF {
  id: string;
  first_name: string;
  last_name: string;
  position?: string | null;
  department?: string | null;
  phone?: string | null;
  salary_day?: number | null;
  is_active?: boolean | null;
}

export interface PersonnelTransactionsPDFData {
  personnel: PersonnelPDF;
  transactions: PersonnelTransactionPDF[];
  dateRange: { startDate: string; endDate: string };
  summary: { currentBalance: number; totalCredit: number; totalDebit: number; transactionCount: number };
  companyInfo?: { name: string };
}

// Turkce karakter donusumu
const tr = (text: string): string => {
  const map: Record<string, string> = { 'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U' };
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, c => map[c] || c);
};

const TYPE_LABELS: Record<string, string> = { hakedis: 'Hakedis', odeme: 'Odeme' };

const formatCurrency = (n: number): string => 
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' TL';

export const downloadPersonnelTransactionsPDF = (data: PersonnelTransactionsPDFData): void => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const w = doc.internal.pageSize.width;
  const h = doc.internal.pageSize.height;
  const m = 20;

  // Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, w, 8, 'F');

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(data.companyInfo?.name || 'HesapOnda', m, 18);

  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.text('PERSONEL HESAP HAREKETLERI', w / 2, 30, { align: 'center' });

  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.5);
  doc.line(m, 35, w - m, 35);

  // Personel
  doc.setFontSize(10);
  doc.setTextColor(44, 62, 80);
  doc.text('Personel:', m, 45);
  doc.setFontSize(12);
  doc.text(tr(`${data.personnel.first_name} ${data.personnel.last_name}`), m, 51);
  
  if (data.personnel.position) {
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141);
    doc.text(tr(data.personnel.position), m, 57);
  }

  // Donem
  doc.setFontSize(10);
  doc.setTextColor(44, 62, 80);
  doc.text('Donem:', w - m - 50, 45);
  const dateStr = `${new Date(data.dateRange.startDate).toLocaleDateString('tr-TR')} - ${new Date(data.dateRange.endDate).toLocaleDateString('tr-TR')}`;
  doc.text(dateStr, w - m - 50, 51);

  // Tablo
  if (data.transactions.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(127, 140, 141);
    doc.text('Bu donemde hesap hareketi bulunmamaktadir.', m, 75);
  } else {
    const tableData = data.transactions.map((t, i) => [
      (i + 1).toString(),
      new Date(t.transaction_date).toLocaleDateString('tr-TR'),
      TYPE_LABELS[t.transaction_type] || t.transaction_type,
      tr(t.description || '-'),
      (t.debit_amount || 0) > 0 ? formatCurrency(t.debit_amount || 0) : '',
      (t.credit_amount || 0) > 0 ? formatCurrency(t.credit_amount || 0) : '',
      formatCurrency(t.balance || 0)
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['#', 'Tarih', 'Islem', 'Aciklama', 'Borc', 'Alacak', 'Bakiye']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'left' },
        4: { halign: 'right', cellWidth: 28 },
        5: { halign: 'right', cellWidth: 28 },
        6: { halign: 'right', cellWidth: 28, fontStyle: 'bold' }
      },
      margin: { left: m, right: m },
      didParseCell: (d) => {
        if (d.section === 'body') {
          if (d.column.index === 4 && d.cell.raw) d.cell.styles.textColor = [192, 57, 43];
          if (d.column.index === 5 && d.cell.raw) d.cell.styles.textColor = [39, 174, 96];
          if (d.column.index === 6) {
            const bal = data.transactions[d.row.index]?.balance || 0;
            d.cell.styles.textColor = bal >= 0 ? [39, 174, 96] : [192, 57, 43];
          }
        }
      }
    });
  }

  // Ozet
  const finalY = (doc as any).lastAutoTable?.finalY || 100;
  const boxY = finalY + 10;
  
  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.5);
  doc.roundedRect(m, boxY, w - (2 * m), 20, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setTextColor(127, 140, 141);
  doc.text('Toplam Borc', m + 15, boxY + 8);
  doc.setFontSize(11);
  doc.setTextColor(192, 57, 43);
  doc.text(formatCurrency(data.summary.totalDebit), m + 15, boxY + 15);

  doc.setFontSize(9);
  doc.setTextColor(127, 140, 141);
  doc.text('Toplam Alacak', w / 2 - 20, boxY + 8);
  doc.setFontSize(11);
  doc.setTextColor(39, 174, 96);
  doc.text(formatCurrency(data.summary.totalCredit), w / 2 - 20, boxY + 15);

  doc.setFontSize(9);
  doc.setTextColor(127, 140, 141);
  doc.text('Guncel Bakiye', w - m - 50, boxY + 8);
  doc.setFontSize(12);
  const bc = data.summary.currentBalance;
  doc.setTextColor(bc >= 0 ? 39 : 192, bc >= 0 ? 174 : 57, bc >= 0 ? 96 : 43);
  const suffix = bc > 0 ? ' (A)' : bc < 0 ? ' (B)' : '';
  doc.text(formatCurrency(Math.abs(bc)) + suffix, w - m - 50, boxY + 15);

  // Footer
  const footerY = h - 15;
  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.3);
  doc.line(m, footerY - 5, w - m, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(127, 140, 141);
  const now = new Date();
  doc.text(`Olusturulma: ${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')}`, m, footerY);
  doc.text('HesapOnda', w / 2, footerY, { align: 'center' });
  doc.text('Sayfa 1', w - m, footerY, { align: 'right' });

  // Kaydet
  const filename = `${tr(data.personnel.first_name)}_${tr(data.personnel.last_name)}_hesap_hareketleri_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
