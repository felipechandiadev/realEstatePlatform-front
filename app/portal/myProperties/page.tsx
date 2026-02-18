'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { getUserProperties } from '@/app/actions/properties';
import CircularProgress from '@/components/CircularProgress/CircularProgress';
import Alert from '@/components/Alert/Alert';
import Card from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import Link from 'next/link';
import { env } from '@/lib/env';
import { getStatusInSpanish, getStatusChipClasses } from '@/app/backOffice/properties/utils/statusTranslation';

export default function MyPropertiesPage() {
  const { user, status } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper para normalizar URLs de imágenes
  const normalizeImageUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Si la URL absoluta apunta al puerto 3000 pero estamos en otro puerto, 
      // asegurarnos de que use la URL base del backend configurada
      if (url.includes('localhost:3000') || url.includes('127.0.0.1:3000')) {
        return url.replace(/https?:\/\/[^\/]+/, env.backendApiUrl);
      }
      return url;
    }
    // Si es relativa, prepend backend URL
    const baseUrl = env.backendApiUrl.replace(/\/$/, '');
    const relativePath = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${relativePath}`;
  };

  useEffect(() => {
    async function loadProperties() {
      if (user?.id) {
        try {
          const result = await getUserProperties(user.id, { limit: 50 });
          setProperties(Array.isArray(result) ? result : (result as any).data || []);
        } catch (err) {
          setError('No pudimos cargar tus propiedades. Por favor, intenta de nuevo más tarde.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }

    if (status === 'authenticated') {
      loadProperties();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [user?.id, status]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress size={40} />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="warning">Debes iniciar sesión para ver tus propiedades.</Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mis Propiedades</h1>
        <p className="text-muted-foreground mt-2">Gestiona las propiedades que has publicado o tienes asignadas.</p>
      </div>

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {properties.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">home_work</span>
          <h3 className="text-xl font-medium text-foreground mb-2">No tienes propiedades aún</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Aquí aparecerán las propiedades que publiques para venta o arriendo.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-muted">
                {property.mainImageUrl ? (
                  <img 
                    src={normalizeImageUrl(property.mainImageUrl) || ''} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="material-symbols-outlined text-4xl">image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${getStatusChipClasses(property.status)}`}>
                    {getStatusInSpanish(property.status)}
                  </span>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full uppercase">
                    {property.operationType === 'SALE' ? 'Venta' : 'Arriendo'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2">
                  <span className="text-xs text-muted-foreground font-mono">{property.code}</span>
                  <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {property.city}, {property.state}
                  </p>
                </div>
                
                <div className="mt-auto pt-4 border-t flex justify-between items-center">
                  <span className="text-primary font-bold">{property.priceDisplay}</span>
                  <Link href={`/portal/properties/property/${property.id}`}>
                    <Button variant="text" size="sm">Ver detalle</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
