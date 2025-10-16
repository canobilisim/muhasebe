import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { BarcodeInput } from '../BarcodeInput'
import { usePOSStore } from '@/stores/posStore'
import { ProductService } from '@/services/productService'

// Mock the POS store
vi.mock('@/stores/posStore')
const mockUsePOSStore = vi.mocked(usePOSStore)

// Mock the ProductService
vi.mock('@/services/productService')
const mockProductService = vi.mocked(ProductService)

describe('BarcodeInput', () => {
  const mockProduct = {
    id: 'product-1',
    name: 'Test Ürün',
    barcode: '1234567890',
    sale_price: 100,
    stock_quantity: 10,
    category: 'Test Kategori',
    branch_id: 'test-branch-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const mockStoreState = {
    barcodeInput: '',
    setBarcodeInput: vi.fn(),
    addToCart: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePOSStore.mockReturnValue(mockStoreState)
  })

  it('should render input field with placeholder', () => {
    render(<BarcodeInput />)
    
    const input = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    expect(input).toBeInTheDocument()
    expect(input).toHaveFocus()
  })

  it('should update barcode input when typing', () => {
    render(<BarcodeInput />)
    
    const input = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.change(input, { target: { value: '1234567890' } })
    
    expect(mockStoreState.setBarcodeInput).toHaveBeenCalledWith('1234567890')
  })

  it('should search product on Enter key press', async () => {
    mockProductService.searchByBarcode.mockResolvedValue({
      success: true,
      data: mockProduct
    })
    mockProductService.isOutOfStock.mockReturnValue(false)
    
    mockStoreState.barcodeInput = '1234567890'
    
    render(<BarcodeInput />)
    
    const input = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(mockProductService.searchByBarcode).toHaveBeenCalledWith('1234567890')
    })
  })

  it('should search product on button click', async () => {
    mockProductService.searchByBarcode.mockResolvedValue({
      success: true,
      data: mockProduct
    })
    mockProductService.isOutOfStock.mockReturnValue(false)
    
    mockStoreState.barcodeInput = '1234567890'
    
    render(<BarcodeInput />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockProductService.searchByBarcode).toHaveBeenCalledWith('1234567890')
    })
  })

  it('should add product to cart when found', async () => {
    mockProductService.searchByBarcode.mockResolvedValue({
      success: true,
      data: mockProduct
    })
    mockProductService.isOutOfStock.mockReturnValue(false)
    
    mockStoreState.barcodeInput = '1234567890'
    
    const onProductFound = vi.fn()
    render(<BarcodeInput onProductFound={onProductFound} />)
    
    const input = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(mockStoreState.addToCart).toHaveBeenCalledWith(mockProduct, 1)
      expect(mockStoreState.setBarcodeInput).toHaveBeenCalledWith('')
      expect(onProductFound).toHaveBeenCalledWith(mockProduct)
    })
  })

  it('should show error when product not found', async () => {
    mockProductService.searchByBarcode.mockResolvedValue({
      success: false,
      error: 'Ürün bulunamadı'
    })
    
    mockStoreState.barcodeInput = '9999999999'
    
    const onError = vi.fn()
    render(<BarcodeInput onError={onError} />)
    
    const input = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('Ürün bulunamadı')).toBeInTheDocument()
      expect(onError).toHaveBeenCalledWith('Ürün bulunamadı')
    })
  })

  it('should show error when product is out of stock', async () => {
    mockProductService.searchByBarcode.mockResolvedValue({
      success: true,
      data: { ...mockProduct, stock_quantity: 0 }
    })
    mockProductService.isOutOfStock.mockReturnValue(true)
    
    mockStoreState.barcodeInput = '1234567890'
    
    render(<BarcodeInput />)
    
    const input = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('Test Ürün stokta yok')).toBeInTheDocument()
    })
  })

  it('should clear input on Escape key press', () => {
    mockStoreState.barcodeInput = '1234567890'
    
    render(<BarcodeInput />)
    
    const input = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.keyDown(input, { key: 'Escape' })
    
    expect(mockStoreState.setBarcodeInput).toHaveBeenCalledWith('')
  })

  it('should clear error when clicking Tamam button', async () => {
    mockProductService.searchByBarcode.mockResolvedValue({
      success: false,
      error: 'Ürün bulunamadı'
    })
    
    mockStoreState.barcodeInput = '9999999999'
    
    render(<BarcodeInput />)
    
    const input = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('Ürün bulunamadı')).toBeInTheDocument()
    })
    
    const clearButton = screen.getByText('Tamam')
    fireEvent.click(clearButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Ürün bulunamadı')).not.toBeInTheDocument()
    })
  })

  it('should disable button when input is empty', () => {
    mockStoreState.barcodeInput = ''
    
    render(<BarcodeInput />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should show loading state when searching', async () => {
    mockProductService.searchByBarcode.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockProduct }), 100))
    )
    
    mockStoreState.barcodeInput = '1234567890'
    
    render(<BarcodeInput />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Should show loading spinner
    expect(button).toBeDisabled()
    expect(screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')).toBeDisabled()
  })

  it('should display keyboard shortcuts help text', () => {
    render(<BarcodeInput />)
    
    expect(screen.getByText('• Enter: Ürün ara ve sepete ekle')).toBeInTheDocument()
    expect(screen.getByText('• Escape: Temizle')).toBeInTheDocument()
    expect(screen.getByText('• Barkod okuyucu otomatik olarak algılanır')).toBeInTheDocument()
  })
})