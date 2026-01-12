import React from "react";

const NoticeBox = ({ type = "info", message, icon }) => {
  const typeStyles = {
    info: "bg-blue-100 border-blue-200 text-blue-800",
    warning: "bg-orange-100 border-orange-200 text-orange-800",
    success: "bg-green-100 border-green-200 text-green-800",
    error: "bg-red-100 border-red-200 text-red-800"
  };

  const iconColors = {
    info: "text-blue-600",
    warning: "text-orange-600",
    success: "text-green-600",
    error: "text-red-600"
  };

  const defaultIcons = {
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div className={`border rounded-lg p-3 ${typeStyles[type]}`}>
      <div className="flex items-start gap-2">
        <div className={`flex-shrink-0 mt-0.5 ${iconColors[type]}`}>
          {icon || defaultIcons[type]}
        </div>
        <p className="text-xs leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

export default NoticeBox;
