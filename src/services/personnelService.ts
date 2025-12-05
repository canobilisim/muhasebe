import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Personnel = Database['public']['Tables']['personnel']['Row'];
type PersonnelInsert = Database['public']['Tables']['personnel']['Insert'];
type PersonnelUpdate = Database['public']['Tables']['personnel']['Update'];
type PersonnelSalaryInsert = Database['public']['Tables']['personnel_salaries']['Insert'];
type PersonnelAdvanceInsert = Database['public']['Tables']['personnel_advances']['Insert'];

// Return types
type PersonnelSalary = Database['public']['Tables']['personnel_salaries']['Row'];
type PersonnelAdvance = Database['public']['Tables']['personnel_advances']['Row'];

export interface PersonnelWithStats extends Personnel {
  total_advances: number;
  remaining_advances: number;
  last_salary_date: string | null;
  last_salary_amount: number | null;
}

// Personel listesi
export async function getPersonnel(branchId: string) {
  const { data, error } = await (supabase as any)
    .from('personnel')
    .select(`
      *,
      personnel_advances(amount),
      personnel_salaries(payment_date, net_amount, advance_deduction)
    `)
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // İstatistikleri hesapla
  const personnelWithStats: PersonnelWithStats[] = (data || []).map((person: any) => {
    const advances = person.personnel_advances || [];
    const salaries = person.personnel_salaries || [];

    const total_advances = advances.reduce((sum: number, adv: any) => sum + Number(adv.amount), 0);
    const total_deductions = salaries.reduce((sum: number, sal: any) => sum + Number(sal.advance_deduction || 0), 0);
    const remaining_advances = total_advances - total_deductions;

    const sortedSalaries = salaries.sort((a: any, b: any) => 
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );

    return {
      ...person,
      total_advances,
      remaining_advances,
      last_salary_date: sortedSalaries[0]?.payment_date || null,
      last_salary_amount: sortedSalaries[0]?.net_amount || null,
    };
  });

  return personnelWithStats;
}

// Tek personel detayı
export async function getPersonnelById(id: string) {
  const { data, error } = await (supabase as any)
    .from('personnel')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Personnel;
}

// Personel ekleme
export async function createPersonnel(personnel: PersonnelInsert) {
  const { data, error } = await (supabase as any)
    .from('personnel')
    .insert([personnel])
    .select()
    .single();

  if (error) throw error;
  return data as Personnel;
}

// Personel güncelleme
export async function updatePersonnel(id: string, personnel: PersonnelUpdate) {
  const { data, error } = await (supabase as any)
    .from('personnel')
    .update({ ...personnel, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Personnel;
}

// Personel silme
export async function deletePersonnel(id: string) {
  const { error } = await (supabase as any)
    .from('personnel')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Maaş ödemeleri listesi
export async function getPersonnelSalaries(personnelId: string) {
  const { data, error } = await (supabase as any)
    .from('personnel_salaries')
    .select('*')
    .eq('personnel_id', personnelId)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false });

  if (error) throw error;
  return data as PersonnelSalary[];
}

// Maaş ödeme numarası oluştur
async function generateSalaryPaymentNumber(branchId: string): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  const { data, error } = await (supabase as any)
    .from('personnel_salaries')
    .select('payment_number')
    .eq('branch_id', branchId)
    .like('payment_number', `MAAS-${dateStr}-%`)
    .order('payment_number', { ascending: false })
    .limit(1);

  if (error) throw error;

  let sequence = 1;
  if (data && data.length > 0 && data[0]?.payment_number) {
    const lastNumber = data[0].payment_number.split('-').pop();
    sequence = parseInt(lastNumber || '0') + 1;
  }

  return `MAAS-${dateStr}-${sequence.toString().padStart(6, '0')}`;
}

// Maaş ödeme
export async function createSalaryPayment(salary: PersonnelSalaryInsert) {
  // Ödeme numarası oluştur
  const payment_number = await generateSalaryPaymentNumber(salary.branch_id!);

  const { data, error } = await (supabase as any)
    .from('personnel_salaries')
    .insert([{ ...salary, payment_number }])
    .select()
    .single();

  if (error) throw error;
  return data as PersonnelSalary;
}

// Avans ödemeleri listesi
export async function getPersonnelAdvances(personnelId: string) {
  const { data, error } = await (supabase as any)
    .from('personnel_advances')
    .select('*')
    .eq('personnel_id', personnelId)
    .order('advance_date', { ascending: false });

  if (error) throw error;
  return data as PersonnelAdvance[];
}

// Avans numarası oluştur
async function generateAdvanceNumber(branchId: string): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  const { data, error } = await (supabase as any)
    .from('personnel_advances')
    .select('advance_number')
    .eq('branch_id', branchId)
    .like('advance_number', `AVANS-${dateStr}-%`)
    .order('advance_number', { ascending: false })
    .limit(1);

  if (error) throw error;

  let sequence = 1;
  if (data && data.length > 0 && data[0]?.advance_number) {
    const lastNumber = data[0].advance_number.split('-').pop();
    sequence = parseInt(lastNumber || '0') + 1;
  }

  return `AVANS-${dateStr}-${sequence.toString().padStart(6, '0')}`;
}

// Avans verme
export async function createAdvancePayment(advance: PersonnelAdvanceInsert) {
  // Avans numarası oluştur
  const advance_number = await generateAdvanceNumber(advance.branch_id!);

  const { data, error } = await (supabase as any)
    .from('personnel_advances')
    .insert([{ 
      ...advance, 
      advance_number
    }])
    .select()
    .single();

  if (error) throw error;
  return data as PersonnelAdvance;
}

// Personel için toplam avans ve kesinti hesapla
export async function getPersonnelAdvanceSummary(personnelId: string) {
  // Tüm avansları al
  const { data: advances, error: advError } = await (supabase as any)
    .from('personnel_advances')
    .select('*')
    .eq('personnel_id', personnelId);

  if (advError) throw advError;

  // Tüm maaş kesintilerini al
  const { data: salaries, error: salError } = await (supabase as any)
    .from('personnel_salaries')
    .select('advance_deduction, payment_date')
    .eq('personnel_id', personnelId);

  if (salError) throw salError;

  const totalAdvances = advances.reduce((sum: number, adv: any) => sum + Number(adv.amount), 0);
  const totalDeductions = salaries.reduce((sum: number, sal: any) => sum + Number(sal.advance_deduction), 0);
  const remainingAdvance = totalAdvances - totalDeductions;

  return {
    totalAdvances,
    totalDeductions,
    remainingAdvance,
    advances: advances as PersonnelAdvance[],
  };
}

// Maaş ödeme silme
export async function deleteSalaryPayment(id: string) {
  const { error } = await (supabase as any)
    .from('personnel_salaries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Avans ödeme silme
export async function deleteAdvancePayment(id: string) {
  const { error } = await (supabase as any)
    .from('personnel_advances')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// YENİ: Personnel Transactions (Cari Hesap)
// ============================================

type PersonnelTransaction = Database['public']['Tables']['personnel_transactions']['Row'];
type PersonnelTransactionInsert = Database['public']['Tables']['personnel_transactions']['Insert'];

// Personel hesap hareketleri listesi
export async function getPersonnelTransactions(personnelId: string) {
  const { data, error } = await (supabase as any)
    .from('personnel_transactions')
    .select('*')
    .eq('personnel_id', personnelId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PersonnelTransaction[];
}

// İşlem numarası oluştur
async function generateTransactionNumber(branchId: string, type: string): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  const prefix = type.toUpperCase();
  
  const { data, error } = await (supabase as any)
    .from('personnel_transactions')
    .select('transaction_number')
    .eq('branch_id', branchId)
    .eq('transaction_type', type)
    .like('transaction_number', `${prefix}-${dateStr}-%`)
    .order('transaction_number', { ascending: false })
    .limit(1);

  if (error) throw error;

  let sequence = 1;
  if (data && data.length > 0 && data[0]?.transaction_number) {
    const lastNumber = data[0].transaction_number.split('-').pop();
    sequence = parseInt(lastNumber || '0') + 1;
  }

  return `${prefix}-${dateStr}-${sequence.toString().padStart(6, '0')}`;
}

// Yeni işlem oluştur
export async function createTransaction(transaction: PersonnelTransactionInsert) {
  // İşlem numarası oluştur
  const transaction_number = await generateTransactionNumber(
    transaction.branch_id!,
    transaction.transaction_type
  );

  const { data, error } = await (supabase as any)
    .from('personnel_transactions')
    .insert([{ ...transaction, transaction_number }])
    .select()
    .single();

  if (error) throw error;
  return data as PersonnelTransaction;
}

// İşlem silme
export async function deleteTransaction(id: string) {
  const { error } = await (supabase as any)
    .from('personnel_transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
