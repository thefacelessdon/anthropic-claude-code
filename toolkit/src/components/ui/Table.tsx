interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data",
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-dim">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left text-xs text-muted font-medium py-2 pr-4 ${
                  col.className || ""
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border/50 ${
                onRowClick
                  ? "cursor-pointer hover:bg-surface/50 transition-colors"
                  : ""
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 pr-4 text-text ${col.className || ""}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
