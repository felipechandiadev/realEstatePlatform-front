import SalesContractsGrid from './ui/SalesContractsGrid';
import { getSaleContractsGrid } from '@/app/actions/contracts';

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

export default async function SalesContractsPage({ searchParams }: PageProps) {
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

  const rows = await getSaleContractsGrid({
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
      <SalesContractsGrid rows={rows} totalRows={rows.length} />
    </div>
  );
}