import React from 'react';
import { useTranslation } from "react-i18next";
import { InfoIcon, CheckIcon } from "../../../components/Icons";

const WarehouseProNotice = ({ filteredCount, onToggleSelection }) => {
    const { t } = useTranslation();

    return (
        <div className="px-4 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg mx-4 mt-4 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex items-start gap-3 relative z-10 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <InfoIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm mb-1 text-white">{t("package.warehouse_notice.title", "ข้อควรทราบ")}</p>
                    <p className="text-white/80 text-xs leading-relaxed">{t("package.warehouse_notice.message", "สามารถเลือกพัสดุจากคลังเดียวกันเท่านั้นเพื่อสมัครแพ็คร่วมกัน")}</p>
                </div>
            </div>

            <button
                onClick={onToggleSelection}
                className="w-full py-3 rounded-xl bg-white text-indigo-600 font-bold shadow-lg shadow-indigo-900/20 hover:bg-indigo-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative z-10"
            >
                <CheckIcon className="w-5 h-5" />
                <span>
                    {`${t("package.apply_packing", "สมัครแพ็คพัสดุ")} (${filteredCount})`}
                </span>
            </button>
        </div>
    );
};

export default WarehouseProNotice;
