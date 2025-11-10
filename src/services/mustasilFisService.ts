import { supabase } from '@/lib/supabase';
import type { 
    MustasilFis, 
    CreateMustasilFisInput,
    MustasilItem 
} from '@/types/mustasilFis';

export class MustasilFisService {
    // Müstasil fişi oluştur
    static async createMustasilFis(data: CreateMustasilFisInput): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            // Fiş numarası oluştur
            const fisNo = await this.generateFisNo(data.branch_id);

            const mustasilFisData = {
                ...data,
                fis_no: fisNo,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Şimdilik console.log ile test edelim
            console.log('Müstasil Fişi Verisi:', mustasilFisData);

            // Geçici olarak başarılı sonuç döndür
            return { 
                success: true, 
                data: { 
                    id: Date.now(), 
                    ...mustasilFisData 
                } 
            };

            // TODO: Supabase migration çalıştırıldıktan sonra aktif edilecek
            /*
            const { data: result, error } = await supabase
                .from('mustasil_fis')
                .insert([mustasilFisData])
                .select()
                .single();

            if (error) {
                console.error('Error creating mustasil fis:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: result };
            */
        } catch (error) {
            console.error('Error in createMustasilFis:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu' 
            };
        }
    }

    // Müstasil fişi listesi getir (şimdilik mock)
    static async getMustasilFisList(branchId: string, page = 1, limit = 20): Promise<{
        success: boolean;
        data?: any[];
        total?: number;
        error?: string;
    }> {
        try {
            // TODO: Supabase migration sonrası aktif edilecek
            return { 
                success: true, 
                data: [], 
                total: 0 
            };
        } catch (error) {
            console.error('Error in getMustasilFisList:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu' 
            };
        }
    }

    // Müstasil fişi detayı getir (şimdilik mock)
    static async getMustasilFis(id: number): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            // TODO: Supabase migration sonrası aktif edilecek
            return { success: true, data: null };
        } catch (error) {
            console.error('Error in getMustasilFis:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu' 
            };
        }
    }

    // Müstasil fişi güncelle (şimdilik mock)
    static async updateMustasilFis(id: number, data: Partial<CreateMustasilFisInput>): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            // TODO: Supabase migration sonrası aktif edilecek
            return { success: true, data: null };
        } catch (error) {
            console.error('Error in updateMustasilFis:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu' 
            };
        }
    }

    // Müstasil fişi sil (şimdilik mock)
    static async deleteMustasilFis(id: number): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            // TODO: Supabase migration sonrası aktif edilecek
            return { success: true };
        } catch (error) {
            console.error('Error in deleteMustasilFis:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu' 
            };
        }
    }

    // Fiş numarası oluştur
    private static async generateFisNo(branchId: string): Promise<string> {
        try {
            // Şimdilik basit numara oluştur
            const currentYear = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 9999) + 1;
            return `MF-${currentYear}-${randomNum.toString().padStart(4, '0')}`;
        } catch (error) {
            console.error('Error in generateFisNo:', error);
            return `MF-${new Date().getFullYear()}-0001`;
        }
    }

    // PDF oluştur (şimdilik mock)
    static async generatePDF(mustasilFisId: number): Promise<{
        success: boolean;
        pdfUrl?: string;
        error?: string;
    }> {
        try {
            // TODO: PDF oluşturma servisi entegrasyonu
            const pdfUrl = `/api/mustasil-fis/${mustasilFisId}/pdf`;
            console.log('PDF oluşturuldu:', pdfUrl);
            return { success: true, pdfUrl };
        } catch (error) {
            console.error('Error in generatePDF:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'PDF oluşturulamadı' 
            };
        }
    }

    // Müstasil fişi istatistikleri (şimdilik mock)
    static async getMustasilFisStats(branchId: string, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data?: {
            totalCount: number;
            totalBrutTutar: number;
            totalStopajTutar: number;
            totalNetTutar: number;
        };
        error?: string;
    }> {
        try {
            // TODO: Supabase migration sonrası aktif edilecek
            const stats = {
                totalCount: 0,
                totalBrutTutar: 0,
                totalStopajTutar: 0,
                totalNetTutar: 0,
            };

            return { success: true, data: stats };
        } catch (error) {
            console.error('Error in getMustasilFisStats:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'İstatistikler alınamadı' 
            };
        }
    }
}