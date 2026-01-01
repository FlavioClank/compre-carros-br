import React, { useRef, memo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

interface VirtualizedTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: React.ReactNode;
    width?: string;
    render: (item: T, index: number) => React.ReactNode;
  }[];
  rowHeight?: number;
  maxHeight?: number;
  className?: string;
  onRowClick?: (item: T) => void;
}

function VirtualizedTableComponent<T>({
  data,
  columns,
  rowHeight = 64,
  maxHeight = 600,
  className,
  onRowClick,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className={cn("w-full overflow-auto rounded-md border", className)}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-muted/50 border-b">
        <div className="flex">
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn(
                "h-12 px-4 flex items-center font-medium text-muted-foreground text-sm",
                col.width
              )}
            >
              {col.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ maxHeight: maxHeight - 48 }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                className={cn(
                  "absolute left-0 w-full flex border-b transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/50"
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={cn(
                      "px-4 flex items-center",
                      col.width
                    )}
                  >
                    {col.render(item, virtualRow.index)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {data.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          Nenhum registro encontrado
        </div>
      )}
    </div>
  );
}

export const VirtualizedTable = memo(VirtualizedTableComponent) as typeof VirtualizedTableComponent;
