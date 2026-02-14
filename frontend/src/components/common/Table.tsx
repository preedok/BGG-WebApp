import React from 'react';
import { TableColumn } from '../../types';

interface TableProps<T> {
  columns: TableColumn[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

function Table<T>({
  columns,
  data,
  renderRow,
  emptyMessage = 'No data available',
  className = ''
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-200">
            {columns.map((column) => (
              <th
                key={column.id}
                className={`px-6 py-4 text-${column.align || 'left'} text-sm font-bold text-slate-900 uppercase tracking-wider`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;