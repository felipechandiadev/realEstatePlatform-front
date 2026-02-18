'use client'

import React, { useState } from 'react'
import IconButton from '@/components/IconButton/IconButton'
import Dialog from '@/components/Dialog/Dialog'
import DeleteBaseForm from '@/components/BaseForm/DeleteBaseForm'
import { deleteProperty } from '@/app/actions/properties'
import { useAlert } from '@/app/hooks/useAlert'
import { useRouter } from 'next/navigation'

interface DeletePropertyButtonProps {
  propertyId: string
  propertyTitle?: string
  onSuccess?: () => void
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export default function DeletePropertyButton({
  propertyId,
  propertyTitle,
  onSuccess,
  className,
  size = 'xs',
}: DeletePropertyButtonProps) {
  const { showAlert } = useAlert()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)
      const result = await deleteProperty(propertyId)
      
      if (result.success) {
        showAlert({
          type: 'success',
          message: 'Propiedad eliminada correctamente',
        })
        setOpen(false)
        if (onSuccess) {
          onSuccess()
        } else {
          router.refresh()
        }
      } else {
        throw new Error(result.error || 'Error al eliminar la propiedad')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar la propiedad'
      setError(errorMsg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <IconButton
        icon="delete"
        variant="text"
        size={size}
        ariaLabel="Eliminar propiedad"
        onClick={() => setOpen(true)}
        className={`text-secondary ${className || ''}`}
      />

      <Dialog
        open={open}
        onClose={() => !isDeleting && setOpen(false)}
        title="Eliminar Propiedad"
        size="sm"
      >
        <DeleteBaseForm
          message={`¿Estás seguro de que deseas eliminar la propiedad "${propertyTitle || 'seleccionada'}"? Esta acción no se puede deshacer.`}
          onSubmit={handleDelete}
          isSubmitting={isDeleting}
          cancelButton={true}
          onCancel={() => setOpen(false)}
          errors={error ? [error] : []}
          title=""
        />
      </Dialog>
    </>
  )
}
