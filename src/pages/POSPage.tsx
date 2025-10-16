import { Layout } from '@/components/layout/Layout'
import { POSLayout } from '@/components/pos'

export const POSPage = () => {
  return (
    <Layout 
      title="POS Satış" 
      subtitle="Satış işlemleri ve ödeme yönetimi"
    >
      <POSLayout />
    </Layout>
  )
}