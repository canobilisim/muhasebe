export type PersonnelStatus = 'Aday' | 'Aktif Çalışan' | 'İstifa Etti' | 'İşten Çıkarıldı'

export interface Personnel {
  id: string
  name: string
  surname: string
  tcNo: string
  phone?: string
  email?: string
  address?: string
  branch: string
  position: string
  status: PersonnelStatus
  startDate: string
  endDate?: string
  salary: number
  currency: 'Türk Lirası' | 'USD' | 'EUR'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PersonnelFormData {
  name: string
  surname: string
  tcNo: string
  phone: string
  email: string
  address: string
  branch: string
  position: string
  status: PersonnelStatus
  startDate: string
  endDate: string
  salary: string
  currency: string
  notes: string
}

export interface PersonnelDocument {
  id: string
  personnelId: string
  documentType: string
  fileName: string
  fileUrl: string
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
}