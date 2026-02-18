import { Suspense } from 'react';
import PropertyFilterRent from '@/components/PropertyFilterRent/PropertyFilterRent';
import ListProperties from '../../ui/ListProperties';
import { getPublishedPropertiesFiltered } from '@/app/actions/portalProperties';

interface RentPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getRentProperties(searchParams: { [key: string]: string | string[] | undefined }) {
  console.log('🔍 [getRentProperties] Raw searchParams:', searchParams);

  const filters: any = {
    typeProperty: typeof searchParams.typeProperty === 'string' && searchParams.typeProperty ?
      decodeURIComponent(searchParams.typeProperty) : undefined,
    state: typeof searchParams.state === 'string' && searchParams.state ?
      decodeURIComponent(searchParams.state) : undefined,
    city: typeof searchParams.city === 'string' && searchParams.city ?
      decodeURIComponent(searchParams.city) : undefined,
    currency: typeof searchParams.currency === 'string' && searchParams.currency ?
      decodeURIComponent(searchParams.currency) : 'CLP',
    page: typeof searchParams.page === 'string' && searchParams.page ?
      parseInt(decodeURIComponent(searchParams.page)) : 1,
    limit: 9,
    operation: 'rent',
  };

  // Optional numeric/operator filters
  if (typeof searchParams.bedrooms === 'string' && searchParams.bedrooms) {
    const val = parseInt(decodeURIComponent(searchParams.bedrooms));
    if (!isNaN(val)) filters.bedrooms = val;
  }
  if (typeof searchParams.bedroomsOperator === 'string' && searchParams.bedroomsOperator) {
    filters.bedroomsOperator = decodeURIComponent(searchParams.bedroomsOperator as string);
  }

  if (typeof searchParams.bathrooms === 'string' && searchParams.bathrooms) {
    const val = parseInt(decodeURIComponent(searchParams.bathrooms));
    if (!isNaN(val)) filters.bathrooms = val;
  }
  if (typeof searchParams.bathroomsOperator === 'string' && searchParams.bathroomsOperator) {
    filters.bathroomsOperator = decodeURIComponent(searchParams.bathroomsOperator as string);
  }

  if (typeof searchParams.parkingSpaces === 'string' && searchParams.parkingSpaces) {
    const val = parseInt(decodeURIComponent(searchParams.parkingSpaces));
    if (!isNaN(val)) filters.parkingSpaces = val;
  }
  if (typeof searchParams.parkingSpacesOperator === 'string' && searchParams.parkingSpacesOperator) {
    filters.parkingSpacesOperator = decodeURIComponent(searchParams.parkingSpacesOperator as string);
  }

  console.log('🔍 [getRentProperties] Processed filters (rent):', filters);

  try {
    const raw = await getPublishedPropertiesFiltered(filters);
    const propertiesData = raw ? {
      data: raw.data,
      total: raw.pagination?.total || 0,
      page: raw.pagination?.page || 1,
      limit: raw.pagination?.limit || 9,
      totalPages: raw.pagination?.totalPages || 0,
    } : { data: [], total: 0, page: 1, limit: 9, totalPages: 0 };

    return { filters, propertiesData };
  } catch (error) {
    console.error('Error fetching rent properties:', error);
    return {
      filters,
      propertiesData: {
        data: [],
        total: 0,
        page: 1,
        limit: 9,
        totalPages: 0,
      }
    };
  }
} 

export default async function RentPage({ searchParams }: RentPageProps) {
  const params = await searchParams;
  const { filters, propertiesData } = await getRentProperties(params);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Propiedades en Arriendo
          </h1>
          <p className="text-muted-foreground">
            Encuentra la propiedad perfecta para arrendar en nuestra plataforma
          </p>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
            <PropertyFilterRent
              initialFilters={filters}
            />
          </Suspense>

          <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
            <ListProperties
              properties={propertiesData.data}
              pagination={{
                total: propertiesData.total,
                page: propertiesData.page,
                limit: propertiesData.limit,
                totalPages: propertiesData.totalPages,
                hasNextPage: propertiesData.page < propertiesData.totalPages,
                hasPrevPage: propertiesData.page > 1,
              }}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
