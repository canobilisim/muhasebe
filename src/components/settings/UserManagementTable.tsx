import { useState } from 'react'
import { useUserManagement } from '@/hooks/useUserManagement'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Loader2 } from 'lucide-react'
import { UserForm } from './UserForm'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type UserRole = Database['public']['Enums']['user_role']

export const UserManagementTable = () => {
  const {
    users,
    isLoading,
    error,
    canManageUsers,
    canCreateUsers,
    toggleUserStatus,
    deleteUser,
    clearError,
  } = useUserManagement()

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Handle user status toggle
  const handleToggleStatus = async (user: User) => {
    setActionLoading(`toggle-${user.id}`)
    
    try {
      const result = await toggleUserStatus(user.id, !user.is_active)
      if (!result.success) {
        console.error('Status toggle failed:', result.error)
      }
    } catch (err) {
      console.error('Error toggling user status:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setActionLoading(`delete-${selectedUser.id}`)
    
    try {
      const result = await deleteUser(selectedUser.id)
      if (result.success) {
        setShowDeleteDialog(false)
        setSelectedUser(null)
      }
    } catch (err) {
      console.error('Error deleting user:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Get role badge variant
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'manager':
        return 'default'
      case 'cashier':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Get role label
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Yönetici'
      case 'manager':
        return 'Müdür'
      case 'cashier':
        return 'Kasiyer'
      default:
        return role
    }
  }

  if (!canManageUsers) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            Kullanıcı yönetimi için yetkiniz bulunmuyor.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Kullanıcı Yönetimi
            </CardTitle>
            {canCreateUsers && (
              <Button
                onClick={() => {
                  setSelectedUser(null)
                  setShowUserForm(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Yeni Kullanıcı
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-700 hover:text-red-900"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && users.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Kullanıcılar yükleniyor...</span>
            </div>
          ) : (
            /* Users Table */
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Şube</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Henüz kullanıcı bulunmuyor
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.branch?.name || 'Atanmamış'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowUserForm(true)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            {/* Toggle Status Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(user)}
                              disabled={actionLoading === `toggle-${user.id}`}
                              className="h-8 w-8 p-0"
                            >
                              {actionLoading === `toggle-${user.id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : user.is_active ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDeleteDialog(true)
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? 'Kullanıcı bilgilerini düzenleyin.' 
                : 'Yeni kullanıcı oluşturun.'
              }
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSuccess={() => {
              setShowUserForm(false)
              setSelectedUser(null)
            }}
            onCancel={() => {
              setShowUserForm(false)
              setSelectedUser(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Sil</DialogTitle>
            <DialogDescription>
              <strong>{selectedUser?.full_name}</strong> kullanıcısını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setSelectedUser(null)
              }}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={actionLoading?.startsWith('delete-')}
              className="flex items-center gap-2"
            >
              {actionLoading?.startsWith('delete-') ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}