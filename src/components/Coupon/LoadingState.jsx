import React from 'react';

/**
 * LoadingState Component
 * 加载状态骨架屏
 */
const LoadingState = () => {
  return (
    <div className="space-y-4 px-4">
      {[1, 2, 3, 4].map((item) => (
        <div 
          key={item} 
          className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse"
        >
          <div className="flex">
            {/* 左侧骨架 */}
            <div className="w-32 bg-gray-200 p-4">
              <div className="h-8 bg-gray-300 rounded mb-2" />
              <div className="h-4 bg-gray-300 rounded w-16 mx-auto" />
            </div>

            {/* 右侧骨架 */}
            <div className="flex-1 p-4">
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/2" />
              <div className="h-3 bg-gray-200 rounded mb-4 w-2/3" />
              <div className="flex justify-end">
                <div className="h-9 bg-gray-200 rounded-lg w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingState;
