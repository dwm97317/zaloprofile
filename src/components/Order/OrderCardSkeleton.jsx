/**
 * OrderCardSkeleton Component
 * 
 * Skeleton loading placeholder for OrderCard.
 * Matches the layout of OrderCard with pulse animation.
 */
const OrderCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 w-8 h-8 rounded-lg" />
          <div className="bg-gray-200 h-4 w-24 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 h-6 w-16 rounded" />
          <div className="bg-gray-200 h-6 w-20 rounded" />
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <div className="bg-gray-200 h-4 w-20 rounded" />
          <div className="bg-gray-200 h-4 w-32 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="bg-gray-200 h-4 w-16 rounded" />
          <div className="bg-gray-200 h-4 w-24 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="bg-gray-200 h-4 w-20 rounded" />
          <div className="bg-gray-200 h-4 w-28 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="bg-gray-200 h-4 w-24 rounded" />
          <div className="bg-gray-200 h-4 w-40 rounded" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 pb-4 border-b border-gray-50">
        <div className="bg-gray-200 h-2 w-full rounded-full" />
      </div>

      {/* Images */}
      <div className="mb-4 pb-4 border-b border-gray-50">
        <div className="bg-gray-200 h-3 w-16 rounded mb-2" />
        <div className="flex gap-2">
          <div className="bg-gray-200 w-20 h-20 rounded-lg flex-shrink-0" />
          <div className="bg-gray-200 w-20 h-20 rounded-lg flex-shrink-0" />
          <div className="bg-gray-200 w-20 h-20 rounded-lg flex-shrink-0" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t border-gray-50">
        <div className="flex-1 bg-gray-200 h-8 rounded-lg" />
        <div className="flex-1 bg-gray-200 h-8 rounded-lg" />
        <div className="flex-1 bg-gray-200 h-8 rounded-lg" />
      </div>
    </div>
  );
};

export default OrderCardSkeleton;
