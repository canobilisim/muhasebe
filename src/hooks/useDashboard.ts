import { useState, useEffect } from 'react'
import { dashboardService } from '@/services/dashboardService'
import type { DashboardKPIs, SalesChartData, MonthlyChartData } from '@/services/dashboardService'
import { useAuth } from '@/hooks/useAuth'

export const useDashboard = () => {
  const { branchId } = useAuth()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [weeklySalesChart, setWeeklySalesChart] = useState<SalesChartData[]>([])
  const [monthlySalesChart, setMonthlySalesChart] = useState<MonthlyChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    if (!branchId) return

    try {
      setLoading(true)
      setError(null)

      const [kpisData, weeklyData, monthlyData] = await Promise.all([
        dashboardService.getDashboardKPIs(branchId),
        dashboardService.getWeeklySalesChart(branchId),
        dashboardService.getMonthlySalesChart(branchId)
      ])

      setKpis(kpisData)
      setWeeklySalesChart(weeklyData)
      setMonthlySalesChart(monthlyData)
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [branchId])

  const refreshData = () => {
    fetchDashboardData()
  }

  return {
    kpis,
    weeklySalesChart,
    monthlySalesChart,
    loading,
    error,
    refreshData
  }
}