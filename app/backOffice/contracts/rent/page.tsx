import RentContractsGrid from './ui/RentContractsGrid';
import { getRentContractsGrid } from '@/app/actions/contracts';

interface PageProps {
  searchParams: Promise<{
    sort?: 'asc' | 'desc';
    sortField?: string;
    search?: string;
    filters?: string;
    filtration?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function RentContractsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort === 'asc' ? 'asc' : (params.sort === 'desc' ? 'desc' : undefined);
  const sortField = typeof params.sortField === 'string' ? params.sortField : undefined;
  const search = typeof params.search === 'string' ? params.search : '';
  const filters = typeof params.filters === 'string' ? params.filters : '';
  const filtration = params.filtration === 'true' || filters !== '';
  const pageParam = typeof params.page === 'string' ? params.page : '1';
  const limitParam = typeof params.limit === 'string' ? params.limit : '25';
  const page = parseInt(pageParam) || 1;
  const limit = parseInt(limitParam) || 25;

  const rows = await getRentContractsGrid({
    sort,
    sortField,
    search,
    filters,
    filtration,
    page,
    limit,
    pagination: true
  });

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Contratos de Arriendo</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona todos los contratos de arriendo de propiedades
        </p>
      </div>
      <RentContractsGrid rows={rows} totalRows={rows.length} />
    </div>
  );
}