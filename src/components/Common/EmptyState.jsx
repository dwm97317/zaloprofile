/**
 * EmptyState Component
 * 
 * Displays a friendly empty state with icon, message, and optional action.
 */
const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {/* Icon */}
      {icon ? (
        <div className="mb-4">
          {icon}
        </div>
      ) : (
        <svg 
          className="w-20 h-20 text-gray-300 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
          />
        </svg>
      )}

      {/* Title */}
      {title && (
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          {description}
        </p>
      )}

      {/* Action button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
