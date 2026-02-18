import DocumentsDataGrid from '@/app/backOffice/contracts/documents/ui/DocumentsDataGrid';
import { listDocuments } from '@/app/actions/documents';
import { getDocumentTypes } from '@/app/actions/documentTypes';
import type { DocumentEntity } from '@/app/actions/documents';
import type { DocumentType } from '@/app/actions/documentTypes';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

function resolveDocumentsPayload(payload: unknown): {
  rows: DocumentEntity[];
  total: number;
} {
  if (!payload) {
    return { rows: [], total: 0 };
  }

  if (Array.isArray(payload)) {
    return { rows: payload as DocumentEntity[], total: payload.length };
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    const { data, total } = payload as { data: DocumentEntity[]; total?: number };
    return { rows: data, total: typeof total === 'number' ? total : data.length };
  }

  return { rows: [], total: 0 };
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = typeof params.search === 'string' ? params.search : '';
  const page = Number.parseInt(params.page ?? '1', 10) || 1;
  const limit = Number.parseInt(params.limit ?? '25', 10) || 25;

  const [documentsResult, documentTypes] = await Promise.all([
    listDocuments({ search, page, limit }),
    getDocumentTypes().catch(() => [] as DocumentType[]),
  ]);

  const { rows, total } = documentsResult.success && documentsResult.data
    ? resolveDocumentsPayload(documentsResult.data)
    : { rows: [], total: 0 };

  const errorMessage = documentsResult.success ? undefined : documentsResult.error;

  return (
    <div className="p-4">
      <DocumentsDataGrid
        rows={rows}
        totalRows={total}
        documentTypes={Array.isArray(documentTypes) ? documentTypes : []}
        errorMessage={errorMessage}
      />
    </div>
  );
}
