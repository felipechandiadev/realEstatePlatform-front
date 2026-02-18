'use client'

import React, { useState, useEffect } from 'react'
import { TextField } from '@/components/TextField/TextField'
import Select from '@/components/Select/Select'
import CircularProgress from '@/components/CircularProgress/CircularProgress'
import Alert from '@/components/Alert/Alert'
import { Button } from '@/components/Button/Button'
import dynamic from 'next/dynamic'

const LocationPicker = dynamic(() => import('@/components/LocationPicker/LocationPicker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Cargando mapa...</div>
})

import { getPropertyLocation, updatePropertyLocation } from '@/app/actions/properties'
import { getRegions, getCommunesByRegion } from '@/app/actions/locations'
import { useAlert } from '@/app/hooks/useAlert'

interface LocationSectionProps {
  propertyId: string
  title?: string
}

interface LocationData {
  state?: string
  city?: string
  address?: string
  latitude?: number
  longitude?: number
}

interface Option {
  id: string | number
  label: string
}

const LocationSection: React.FC<LocationSectionProps> = ({
  propertyId,
  title = 'Ubicación',
}) => {
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<LocationData>({
    state: '',
    city: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
  })
  const [regions, setRegions] = useState<Option[]>([])
  const [communes, setCommunes] = useState<Option[]>([])
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  // Load location data
  useEffect(() => {
    const loadLocation = async () => {
      try {
        setLoading(true)
        console.log('📍 [LocationSection] Loading location for property:', propertyId)
        const response = await getPropertyLocation(propertyId)
        console.log('📍 [LocationSection] Response received:', {
          success: response.success,
          error: response.error,
          data: response.data,
        })
        
        if (response.success && response.data) {
          console.log('📍 [LocationSection] Setting form data:', response.data)
          setFormData({
            state: response.data.state || '',
            city: response.data.city || '',
            address: response.data.address || '',
            latitude: response.data.latitude,
            longitude: response.data.longitude,
          })
          setInitialDataLoaded(true)
        } else {
          const errorMsg = response.error || 'Failed to load location'
          console.error('📍 [LocationSection] Error:', errorMsg)
          setError(errorMsg)
          setInitialDataLoaded(true)
        }
      } catch (err) {
        console.error('❌ [LocationSection] Exception:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setInitialDataLoaded(true)
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      loadLocation()
    }
  }, [propertyId])

  // Load regions
  useEffect(() => {
    const loadRegions = async () => {
      try {
        console.log('📍 [LocationSection] Loading regions...')
        const regionList = await getRegions()
        console.log('📍 [LocationSection] Regions loaded:', regionList)
        const options: Option[] = regionList.map((region) => ({
          id: region.id,
          label: region.name,
        }))
        console.log('📍 [LocationSection] Region options created:', options)
        setRegions(options)
        
        // If we have initial data, try to match the state with region ID by name
        if (initialDataLoaded && formData.state) {
          const matchedRegion = regionList.find(r => r.name === formData.state)
          if (matchedRegion) {
            console.log('📍 [LocationSection] Matched region by name:', formData.state, '-> ID:', matchedRegion.id)
            setFormData(prev => ({ ...prev, state: matchedRegion.id }))
          }
        }
      } catch (err) {
        console.error('❌ [LocationSection] Error loading regions:', err)
      }
    }
    loadRegions()
  }, [initialDataLoaded])

  // Load communes based on selected region
  useEffect(() => {
    const loadCommunes = async () => {
      if (formData.state) {
        try {
          console.log('📍 [LocationSection] Loading communes for state:', formData.state)
          const communeList = await getCommunesByRegion(formData.state)
          console.log('📍 [LocationSection] Communes loaded:', communeList)
          const options: Option[] = communeList.map((commune) => ({
            id: commune.id,
            label: commune.name,
          }))
          console.log('📍 [LocationSection] Commune options created:', options)
          console.log('📍 [LocationSection] Looking for city match:', formData.city, 'in', options)
          
          // If we have a city name, find and set its ID
          if (formData.city) {
            const matchedCommune = communeList.find(c => c.name === formData.city)
            if (matchedCommune) {
              console.log('📍 [LocationSection] Matched commune by name:', formData.city, '-> ID:', matchedCommune.id)
              setFormData(prev => ({ ...prev, city: matchedCommune.id }))
            }
          }
          
          setCommunes(options)
        } catch (err) {
          console.error('❌ [LocationSection] Error loading communes:', err)
        }
      } else {
        console.log('📍 [LocationSection] No state selected, clearing communes')
        setCommunes([])
      }
    }
    loadCommunes()
  }, [formData.state, initialDataLoaded])

  const handleLocationChange = (coordinates: { lat: number; lng: number } | null) => {
    if (coordinates) {
      // Use functional update to avoid overwriting state/city when map changes
      setFormData(prev => ({ ...prev, latitude: coordinates.lat, longitude: coordinates.lng }))
      console.log('📍 [LocationSection] Marker placed, coords:', coordinates, 'prev state preserved')
    }
  }

  const handleUpdateLocation = async () => {
    try {
      setUpdating(true)
      
      const response = await updatePropertyLocation(propertyId, formData)
      
      if (response.success) {
        showAlert({
          message: 'Ubicación actualizada exitosamente',
          type: 'success',
          duration: 3000,
        })
      } else {
        showAlert({
          message: response.error || 'Error al actualizar ubicación',
          type: 'error',
          duration: 3000,
        })
      }
    } catch (err) {
      console.error('Error updating location:', err)
      showAlert({
        message: err instanceof Error ? err.message : 'Error desconocido',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <section className="flex items-center justify-center py-8">
        <CircularProgress />
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
          <p className="text-sm text-red-500">Error: {error}</p>
        </header>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      </header>

      <div className="space-y-4">
        {/* Region */}
        <Select
          options={regions}
          placeholder="Seleccione una región"
          value={formData.state || null}
          onChange={(id) => setFormData(prev => ({ ...prev, state: id?.toString() || '', city: '' }))}
        />

        {/* Commune */}
        <Select
          options={communes}
          placeholder="Seleccione una comuna"
          value={formData.city || null}
          onChange={(id) => setFormData(prev => ({ ...prev, city: id?.toString() || '' }))}
        />

        {/* Address */}
        <TextField
          label="Dirección"
          value={formData.address || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          type="text"
          placeholder="Ingrese la dirección"
          className="w-full"
        />

        {/* Coordinates Display */}
        {formData.latitude && formData.longitude && (
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Latitud"
              value={formData.latitude?.toString() || ''}
              onChange={() => {}}
              readOnly
              type="number"
              className="w-full"
            />
            <TextField
              label="Longitud"
              value={formData.longitude?.toString() || ''}
              onChange={() => {}}
              readOnly
              type="number"
              className="w-full"
            />
          </div>
        )}

        {/* Location Picker */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-foreground mb-2">Ubicar en mapa</p>
          <LocationPicker
            onChange={handleLocationChange}
            initialLat={formData.latitude || -33.45}  // Santiago por defecto si no hay coordenadas
            initialLng={formData.longitude || -70.6667} // Santiago por defecto si no hay coordenadas
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          variant="outlined"
          onClick={handleUpdateLocation}
          disabled={updating}
        >
          Actualizar
        </Button>
      </div>
    </section>
  )
}

export default LocationSection

