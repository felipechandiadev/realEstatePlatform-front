'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DocumentTypeCard from './DocumentTypeCard'
import { TextField } from '@/components/TextField/TextField'
import IconButton from '@/components/IconButton/IconButton'
import Dialog from '@/components/Dialog/Dialog'
import CircularProgress from '@/components/CircularProgress/CircularProgress'
import CreateDocumentTypeForm from './CreateDocumentTypeForm'
import { getDocumentTypes, type DocumentType } from '@/app/actions/documentTypes'

export default function DocumentTypeList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [filteredTypes, setFilteredTypes] = useState<DocumentType[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadDocumentTypes()
  }, [])

  useEffect(() => {
    const query = searchParams.get('search') || ''
    setSearchQuery(query)
  }, [searchParams])

  useEffect(() => {
    filterDocumentTypes()
  }, [documentTypes, searchQuery])

  const loadDocumentTypes = async () => {
    setIsLoading(true)
    const result = await getDocumentTypes()
    if (result && Array.isArray(result)) {
      setDocumentTypes(result)
    }
    setIsLoading(false)
  }

  const filterDocumentTypes = () => {
    if (!searchQuery.trim()) {
      setFilteredTypes(documentTypes)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = documentTypes.filter(
      (type) =>
        type.name.toLowerCase().includes(query) ||
        type.description?.toLowerCase().includes(query)
    )
    setFilteredTypes(filtered)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    router.push(`?${params.toString()}`)
  }

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    loadDocumentTypes()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Primera fila: botón agregar y búsqueda */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <IconButton
            aria-label="Agregar tipo de documento"
            variant="containedPrimary"
            onClick={() => setShowCreateDialog(true)}
            icon="add"
            size={'sm'}
          />
        </div>
        <div className="w-full max-w-sm">
          <TextField
            label="Buscar"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            startIcon="search"
            placeholder="Buscar tipos de documentos..."
          />
        </div>
      </div>
      {/* Grid de tarjetas: 3 por fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
        {filteredTypes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-secondary">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">
              description
            </span>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No se encontraron tipos de documentos'
                : 'No hay tipos de documentos registrados'}
            </p>
          </div>
        ) : (
          filteredTypes.map((documentType) => (
            <DocumentTypeCard
              key={documentType.id}
              documentType={documentType}
              onUpdate={loadDocumentTypes}
            />
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Crear Tipo de Documento"
        size="lg"
      >
        <CreateDocumentTypeForm onSuccess={handleCreateSuccess} />
      </Dialog>
    </div>
  )
}

