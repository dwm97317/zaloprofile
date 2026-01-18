import React from 'react';
import { useTranslation } from "react-i18next";
import { ChevronRightIcon } from "../../../components/Icons";

const PackageHeader = ({ onBack }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm sticky top-0 z-20 transition-all duration-200">
            <div className="relative flex items-center justify-center">
                <button
                    onClick={onBack}
                    className="absolute left-0 p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-90"
                >
                    <ChevronRightIcon className="w-6 h-6 rotate-180" />
                </button>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">{t("package.title")}</h1>
            </div>
        </div>
    );
};

export default PackageHeader;
