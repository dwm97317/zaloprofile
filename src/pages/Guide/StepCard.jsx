import React from "react";

const StepCard = ({ step, index, children }) => {
  return (
    <div
      className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100
                 hover:shadow-xl transition-all duration-200
                 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Step Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient}
                        flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
          {step.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient}
                            flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {step.id}
            </div>
            <h3 className="font-bold text-gray-900 text-base">{step.title}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* Custom Content */}
      {children}

      {/* Default Action Button (if no children and onClick exists) */}
      {!children && step.onClick && step.action && (
        <button
          onClick={step.onClick}
          className={`w-full py-3 rounded-xl bg-gradient-to-r ${step.gradient}
                     text-white font-bold shadow-lg
                     hover:shadow-xl hover:scale-105 active:scale-95
                     transition-all duration-200
                     flex items-center justify-center gap-2`}
        >
          <span>{step.action}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default StepCard;
