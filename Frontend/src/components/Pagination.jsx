import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ pagination, onPageChange, color = "blue" }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const btnBase = "flex items-center px-3 py-2 border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed";
  const colorMap = {
    blue: {
      active: "border-blue-500 bg-blue-50 text-blue-600",
      normal: "border-gray-300 bg-white text-gray-500 hover:bg-gray-50",
    },
    green: {
      active: "border-green-500 bg-green-50 text-green-600",
      normal: "border-gray-300 bg-white text-gray-500 hover:bg-gray-50",
    },
  };
  const ui = colorMap[color] || colorMap.blue;

  const pageNumbers = (() => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [current - 2, current - 1, current, current + 1, current + 2];
  })();

  return (
    <div className="flex items-center justify-center mt-8 space-x-2">
      <button
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevPage}
        className={`${btnBase} ${ui.normal}`}
      >
        <FiChevronLeft className="mr-1" /> Previous
      </button>
      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`${btnBase} ${num === pagination.currentPage ? ui.active : ui.normal}`}
        >
          {num}
        </button>
      ))}
      <button
        onClick={() => onPageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNextPage}
        className={`${btnBase} ${ui.normal}`}
      >
        Next <FiChevronRight className="ml-1" />
      </button>
    </div>
  );
};

export default Pagination;
