import React from 'react';

type PaginationProps = {
  pageNo: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (newPage: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  pageNo,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}) => {
  return (
    <div className="flex items-center gap-2 mt-4" data-testid="pagination">
      <button
        onClick={() => onPageChange(pageNo - 1)}
        disabled={!hasPrev}
        className="px-2 py-1 border rounded"
        aria-label="Previous Page"
        data-testid="prev-page-button"
      >
        Prev
      </button>
      <span data-testid="page-info">
        Page {pageNo} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(pageNo + 1)}
        disabled={!hasNext}
        className="px-2 py-1 border rounded"
        aria-label="Next Page"
        data-testid="next-page-button"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
