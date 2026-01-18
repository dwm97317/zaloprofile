import React from 'react';
import { useTranslation } from "react-i18next";

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 transition-transform">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{t("common.confirm")}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{t("package.confirm_cancel")}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                    >
                        {t("common.confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
