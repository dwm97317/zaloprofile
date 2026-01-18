import React from "react";
import classNames from "classnames";

const MenuItem = ({ icon: IconComponent, text, onClick, gradient = "from-primary-400 to-primary-500", badge }) => (
    <div
        className="flex flex-col items-center gap-2 cursor-pointer group"
        onClick={onClick}
    >
        <div className={classNames(
            "relative w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-105 group-active:scale-95 transition-all duration-200",
            gradient
        )}>
            <IconComponent className="w-8 h-8 text-white" />

            {badge && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white
                      text-[10px] font-bold px-1.5 py-0.5 rounded-full
                      shadow-lg animate-pulse">
                    {badge}
                </div>
            )}
        </div>

        <span className="text-[11px] font-bold text-gray-700 text-center leading-tight
                   group-hover:text-primary-600 transition-colors">
            {text}
        </span>
    </div>
);

const NavigationMenu = ({ navData, onMenuClick }) => {
    return (
        <div className="px-4 -mt-8 relative z-10">
            <div className="bg-white p-5 rounded-3xl shadow-2xl border border-gray-50 mb-4">
                <div className="grid grid-cols-4 gap-4">
                    {navData.slice(0, 8).map((item) => (
                        <MenuItem
                            key={item.id}
                            icon={item.icon}
                            text={item.name}
                            gradient={item.gradient}
                            badge={item.badge}
                            onClick={() => onMenuClick(item.url, item.params)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-center">
                {navData[8] && (
                    <MenuItem
                        key={navData[8].id}
                        icon={navData[8].icon}
                        text={navData[8].name}
                        gradient={navData[8].gradient}
                        onClick={() => onMenuClick(navData[8].url, navData[8].params)}
                    />
                )}
            </div>
        </div>
    );
};

export default NavigationMenu;
