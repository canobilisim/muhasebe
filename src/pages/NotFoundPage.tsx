import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-red-600">404</span>
          </div>
          <CardTitle className="text-2xl">Sayfa Bulunamadı</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Ana Sayfa
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotFoundPage
