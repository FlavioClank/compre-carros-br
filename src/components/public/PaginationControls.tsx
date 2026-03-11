import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Page info text */}
      <p className="text-sm text-muted-foreground">
        Página <span className="font-bold text-foreground">{currentPage + 1}</span> de{" "}
        <span className="font-bold text-foreground">{totalPages}</span>
      </p>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === 0 || isLoading}
          onClick={() => onPageChange(0)}
          className="h-10 w-10 sm:h-11 sm:w-11 border-border hidden sm:flex"
          aria-label="Primeira página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous */}
        <Button
          variant="outline"
          disabled={currentPage === 0 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-10 sm:h-11 px-3 sm:px-4 gap-1.5 font-semibold border-border"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              disabled={isLoading}
              onClick={() => onPageChange(page)}
              className={`h-10 w-10 sm:h-11 sm:w-11 font-bold text-sm ${
                page === currentPage
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {page + 1}
            </Button>
          ))}
        </div>

        {/* Next */}
        <Button
          variant="default"
          disabled={currentPage >= totalPages - 1 || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-10 sm:h-11 px-3 sm:px-5 gap-1.5 font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-md text-sm sm:text-base"
        >
          <span>Próxima</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage >= totalPages - 1 || isLoading}
          onClick={() => onPageChange(totalPages - 1)}
          className="h-10 w-10 sm:h-11 sm:w-11 border-border hidden sm:flex"
          aria-label="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Encouraging text */}
      {currentPage < totalPages - 1 && (
        <p className="text-xs text-muted-foreground animate-pulse">
          👆 Toque em <span className="font-semibold text-accent">"Próxima"</span> para ver mais veículos
        </p>
      )}
    </div>
  );
}
