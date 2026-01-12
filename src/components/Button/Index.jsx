import React from "react";

const Button = ({ children, onClick, className = "", type = "primary", disabled = false, ...props }) => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 active:scale-95",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:scale-95",
        danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95",
    };

    const disabledStyles = "opacity-50 cursor-not-allowed transform-none scale-100";

    return (
        <button
            className={`${baseStyles} ${variants[type]} ${disabled ? disabledStyles : ""} ${className}`}
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
