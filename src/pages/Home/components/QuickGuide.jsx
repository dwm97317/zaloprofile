import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import util from "../../../utils/util";
import copy from "copy-to-clipboard";
import { toast } from "../../../utils/toast";
import CustomerContact from "../../../components/CustomerContact/Index";

const QuickGuide = ({ warehouse, isLoggedIn, customerContact }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const getFormattedAddress = (address) => {
        if (!address) return '';
        return address.replace(/(\d+)/g, (match) => {
            // 只转换4-6位数字（用户ID格式）
            if (match.length >= 4 && match.length <= 6) {
                return util.convertNumberToChinese(match);
            }
            return match;
        }).replace(/UID:/g, '用户ID:').replace(/UID /g, '用户ID ');
    };

    const handleCopyAddress = (type) => {
        if (!warehouse) return;

        // 后端返回的字段：linkman, phone, address, post
        let name = warehouse.linkman || warehouse.name || '';
        const phone = warehouse.phone || '';
        let address = warehouse.address || '';
        const postCode = warehouse.post || warehouse.code || '';

        // 只转换地址中的数字ID为中文，联系人保持原样
        const convertIdToChinese = (text) => {
            return text.replace(/(\d+)/g, (match) => {
                // 只转换4-6位数字（用户ID格式）
                if (match.length >= 4 && match.length <= 6) {
                    return util.convertNumberToChinese(match);
                }
                return match;
            });
        };

        // 只转换地址，不转换联系人
        address = convertIdToChinese(address);

        // 将地址中的"UID"替换为中文"用户ID"
        address = address.replace(/UID:/g, '用户ID:').replace(/UID /g, '用户ID ');

        const addressText = type === 'sea'
            ? `${name}|${phone}|${address} SEA|${postCode}`
            : `${name}|${phone}|${address}|${postCode}`;

        copy(addressText);
        toast.success(t("common.copy_success", "คัดลอกสำเร็จ"));
    };

    return (
        <div className="mt-8 px-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-800">{t("home.quick_guide", "คู่มือด่วน")}</h2>
            </div>

            <div className="space-y-3">
                {/* Step 1 */}
                <div
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600
                            flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                            📦
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                                flex items-center justify-center text-white font-bold text-xs">
                                    1
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">{t("guide.step1.title")}</h3>
                            </div>
                            <p className="text-gray-600 text-xs mb-3">{t("guide.step1.description")}</p>

                            {/* 仓库地址信息 - 只在登录后显示 */}
                            {isLoggedIn ? (
                                warehouse ? (
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4 mt-2">
                                        {/* 基本信息网格 */}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                            {/* 姓名 */}
                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                                                    {t("guide.step1.name", "ชื่อ")}
                                                </span>
                                                <div className="text-sm font-bold text-slate-800 break-words leading-tight">
                                                    {warehouse.linkman || warehouse.name || '-'}
                                                </div>
                                            </div>

                                            {/* 电话 */}
                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                                                    {t("guide.step1.phone", "โทร")}
                                                </span>
                                                <div className="text-sm font-bold text-slate-800 break-words leading-tight font-mono">
                                                    {warehouse.phone || '-'}
                                                </div>
                                            </div>

                                            {/* 邮编 */}
                                            <div className="col-span-2">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                                                    {t("guide.step1.zipcode", "รหัสไปรษณีย์")}
                                                </span>
                                                <div className="text-sm font-bold text-slate-800 font-mono">
                                                    {warehouse.post || warehouse.code || '-'}
                                                </div>
                                            </div>

                                            {/* 地址 (占据整行) */}
                                            <div className="col-span-2">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                                                    {t("guide.step1.address", "ที่อยู่")}
                                                </span>
                                                <div className="text-sm font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm leading-relaxed break-all">
                                                    {getFormattedAddress(warehouse.address || '')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 复制操作区 */}
                                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCopyAddress('land'); }}
                                                className="flex-1 py-2.5 px-3 bg-white border border-slate-200 text-slate-700 
                                   rounded-xl text-xs font-bold shadow-sm
                                   hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-all
                                   flex items-center justify-center gap-2 group"
                                            >
                                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                {t("guide.step1.copy_land", "คัดลอกที่อยู่ทางบก")}
                                            </button>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCopyAddress('sea'); }}
                                                className="flex-1 py-2.5 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 
                                   rounded-xl text-xs font-bold shadow-sm
                                   hover:bg-indigo-100 hover:border-indigo-300 active:bg-indigo-50 transition-all
                                   flex items-center justify-center gap-2 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-indigo-100/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <svg className="w-4 h-4 text-indigo-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <span className="relative z-10">{t("guide.step1.copy_sea", "คัดลอกที่อยู่ทางเรือ")}</span>
                                                <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-bl-lg"></span>
                                            </button>
                                        </div>

                                        {/* 提示信息 */}
                                        <div className="flex items-start gap-2 bg-blue-50/50 rounded-lg p-2.5 border border-blue-100/50">
                                            <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-[10px] font-bold">i</span>
                                            </div>
                                            <p className="text-[11px] text-blue-600/90 leading-snug">
                                                {t("guide.step1.notice", "ที่อยู่ทางเรือจะมีคำว่า 'SEA' ต่อท้าย")}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2 text-center py-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                        <span className="text-slate-400 text-xs">{t("common.loading", "กำลังโหลดข้อมูล...")}</span>
                                    </div>
                                )
                            ) : (
                                <div className="mt-3 bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs text-amber-800 font-medium">
                                        {t("guide.step1.login_required", "กรุณาเข้าสู่ระบบเพื่อดูที่อยู่คลังสินค้า")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div
                    onClick={() => navigate('/guide/quick-start')}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100
                     hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600
                            flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                            📋
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600
                                flex items-center justify-center text-white font-bold text-xs">
                                    2
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">{t("guide.step2.title")}</h3>
                            </div>
                            <p className="text-gray-600 text-xs">{t("guide.step2.description")}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Step 3 */}
                <div
                    onClick={() => navigate('/guide/quick-start')}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100
                     hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600
                            flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                            📦
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600
                                flex items-center justify-center text-white font-bold text-xs">
                                    3
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">{t("guide.step3.title")}</h3>
                            </div>
                            <p className="text-gray-600 text-xs">{t("guide.step3.description")}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Step 4 */}
                <div
                    onClick={() => navigate('/guide/quick-start')}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100
                     hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600
                            flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                            💳
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600
                                flex items-center justify-center text-white font-bold text-xs">
                                    4
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">{t("guide.step4.title")}</h3>
                            </div>
                            <p className="text-gray-600 text-xs">{t("guide.step4.description")}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Customer Service - LINE 主题优化 
            I also included Customer Service section in the original split plan, 
            but it was outside the QuickGuide div in QuickGuide steps.
            However, keeping it here makes sense for grouping. 
            Or I can make a separate component since QuickGuide specifically says "Quick Guide".
            The original file structure:
            1. Quick Guide Steps
            2. Customer Service
            
            I will include Customer Service here in "QuickGuide" file but maybe renaming the file or component would be better.
            But "QuickGuide" is inclusive enough for "Home Content below Banner".
            Actually let's just make it purely QuickGuide, and put CustomerService back in Index or a new component.
            Wait, I already put `customerContact` as prop.
            I will include it at the bottom.
        */}
            <div className="mt-8 pb-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                    <h2 className="text-lg font-bold text-gray-800">{t("home.labels.service", "ฝ่ายบริการลูกค้า")}</h2>
                </div>
                <CustomerContact config={customerContact} />
            </div>
        </div>
    );
};

export default QuickGuide;
