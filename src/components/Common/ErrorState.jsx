/**
 * ErrorState Component
 * 
 * Displays a friendly error state with retry functionality.
 */
const ErrorState = ({ 
  message, 
  onRetry,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {/* Error icon */}
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="w-10 h-10 text-red-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        เกิดข้อผิดพลาด
      </h3>

      {/* Error message */}
      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        {message || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง'}
      </p>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>ลองอีกครั้ง</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
