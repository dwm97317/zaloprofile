import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { packageInfoState, expressSnState, userState, packageIdsState, selectionModeState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";
import Button from "../../components/Button/Index";
import { toast } from "../../utils/toast";
import "./Index.scss";

const OrderPackagePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const setPackage = useSetRecoilState(packageInfoState);
  const setExpress = useSetRecoilState(expressSnState);
  const setPackageIds = useSetRecoilState(packageIdsState);
  const selectionMode = useRecoilValue(selectionModeState);
  const setSelectionMode = useSetRecoilState(selectionModeState);

  const [list, setList] = useState([]);
  const [tab, setTab] = useState(2);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState({
    nocount: 0,
    yescount: 0,
    yessend: 0,
    procount: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [imageModal, setImageModal] = useState({ show: false, images: [], currentIndex: 0 });

  useEffect(() => {
    util.checkLogin(fetchOrderList).then((res) => {
      if (res) {
        fetchToDoCount();
      } else {
        setTimeout(() => navigate("/mine"), 1000);
      }
    });
    util.setBarPageView("Package List");
  }, []);

  const fetchOrderList = async (params) => {
    setLoading(true);
    const url = "package/outside&wxapp_id=10001";
    let query = {
      status: params ? params.tab : tab,
    };
    if (params && params.keyword) query.keyword = params.keyword;
    else if (searchText) query.keyword = searchText;

    try {
      const res = await request.get(url, query);
      if (res.data && Array.isArray(res.data.data)) {
        setList(res.data.data);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchToDoCount = async () => {
    try {
      const res = await request.get("/package/countpack&wxapp_id=10001");
      setCount(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelectionMode(false);
    setSelectedPackages([]);
    fetchOrderList({ tab: newTab });
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
  };

  const togglePackageSelection = (packageId, item) => {
    // Only allow selection for received packages (status 2)
    if (item.status !== 2) {
      return;
    }
    
    setSelectedPackages((prev) => {
      if (prev.includes(packageId)) {
        return prev.filter((id) => id !== packageId);
      } else {
        return [...prev, packageId];
      }
    });
  };

  const handleSelectAll = () => {
    // Only select packages with status 2 (received)
    const selectableIds = list.filter(item => item.status === 2).map((item) => item.id);
    setSelectedPackages(selectableIds);
  };

  const handleDeselectAll = () => {
    setSelectedPackages([]);
  };

  const handleApplyPacking = () => {
    if (selectedPackages.length === 0) {
      toast.error(t("package.error.no_selection", "กรุณาเลือกพัสดุอย่างน้อย 1 รายการ"));
      return;
    }

    // 检查是否所有选中的包裹都来自同一个仓库
    const selectedItems = list.filter(item => selectedPackages.includes(item.id));
    const storageIds = [...new Set(selectedItems.map(item => item.storage_id))];
    
    if (storageIds.length > 1) {
      toast.error(t("package.error.different_warehouse", "กรุณาเลือกพัสดุจากคลังเดียวกันเท่านั้น"));
      return;
    }

    console.log("Setting packageIds:", selectedPackages);
    setPackageIds(selectedPackages);
    console.log("Navigating to /packages/pack");
    navigate("/packages/pack");
  };

  const handleSearch = () => {
    fetchOrderList({ tab: tab, keyword: searchText });
  };

  const handleDetail = (item) => {
    setPackage(item);
    navigate("/package/pack/detail");
  };

  const handleEdit = (item) => {
    setPackage(item);
    navigate("/package/pack/modify");
  };

  const handleLogistics = (expressSn) => {
    setExpress(expressSn);
    navigate("/query");
  };

  const confirmCancel = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleCancel = async () => {
    setShowConfirm(false);
    try {
      const res = await request.post("package/cancle&wxapp_id=10001", { id: selectedId });
      if (res.code === 1) {
        alert(t("package.success.cancel"));
        fetchOrderList();
        fetchToDoCount();
      } else {
        alert(res.msg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageClick = (images, index) => {
    setImageModal({ show: true, images, currentIndex: index });
  };

  const closeImageModal = () => {
    setImageModal({ show: false, images: [], currentIndex: 0 });
  };

  const nextImage = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }));
  };

  const prevImage = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
  };

  const getStatusText = (status) => {
    const statusMap = {
      1: t("package.status.not_received", "ยังไม่ได้รับ"),
      2: t("package.status.received", "ได้รับแล้ว"),
      3: t("package.status.pending_verify", "รอตรวจสอบ"),
      4: t("package.status.verified", "ตรวจสอบแล้ว"),
      5: t("package.status.pending_pack", "รอแพ็ค"),
      6: t("package.status.packed", "แพ็คแล้ว"),
      7: t("package.status.pending_payment", "รอชำระเงิน"),
      8: t("package.status.shipped", "จัดส่งแล้ว"),
      "-1": t("package.status.issue", "มีปัญหา")
    };
    return statusMap[status] || t("package.status.unknown", "ไม่ทราบสถานะ");
  };

  const getStatusColor = (status) => {
    const colorMap = {
      1: "bg-gray-100 text-gray-700",
      2: "bg-blue-100 text-blue-700",
      3: "bg-yellow-100 text-yellow-700",
      4: "bg-green-100 text-green-700",
      5: "bg-orange-100 text-orange-700",
      6: "bg-purple-100 text-purple-700",
      7: "bg-red-100 text-red-700",
      8: "bg-green-100 text-green-700",
      "-1": "bg-red-100 text-red-700"
    };
    return colorMap[status] || "bg-gray-100 text-gray-700";
  };

  const tabs = [
    { id: 2, label: t("package.tabs.received"), countKey: "yescount" },
    { id: 8, label: t("package.tabs.shipped"), countKey: "yessend" },
    { id: 1, label: t("package.tabs.not_received"), countKey: "nocount" },
    { id: -1, label: t("package.tabs.issue"), countKey: "procount" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("package.title")}</h1>
      </div>

      <div className="bg-white px-2 pt-2 border-b border-gray-100 flex overflow-x-auto no-scrollbar">
        {tabs.map((tItem) => (
          <div
            key={tItem.id}
            onClick={() => handleTabChange(tItem.id)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap
                  ${tab === tItem.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tItem.label} ({count[tItem.countKey] || 0})
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onBlur={handleSearch}
            placeholder={t("package.search_placeholder")}
            className="w-full bg-gray-100 text-gray-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {tab === 2 && list.length > 0 && !selectionMode && (
        <div className="px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/20">
            <div className="flex items-start gap-2 text-white text-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium mb-1">{t("package.warehouse_notice.title", "ข้อควรทราบ")}</p>
                <p className="text-white/90 text-xs">{t("package.warehouse_notice.message", "สามารถเลือกพัสดุจากคลังเดียวกันเท่านั้นเพื่อสมัครแพ็คร่วมกัน")}</p>
              </div>
            </div>
          </div>
          <button
            onClick={toggleSelectionMode}
            className="w-full py-3 rounded-xl bg-white text-primary-600 font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>
              {`${t("package.apply_packing", "สมัครแพ็คพัสดุ")} (${list.length})`}
            </span>
          </button>
        </div>
      )}

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="py-10 text-center"><Loading is={true} /></div>
        ) : list.length > 0 ? (
          <>
            {selectionMode && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPackages.length > 0 && selectedPackages.length === list.filter(item => item.status === 2).length}
                      onChange={selectedPackages.length === list.filter(item => item.status === 2).length ? handleDeselectAll : handleSelectAll}
                      className="w-6 h-6 rounded border-2 border-primary-500 text-primary-600 focus:ring-2 focus:ring-primary-200 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {selectedPackages.length === list.filter(item => item.status === 2).length && selectedPackages.length > 0
                        ? t("package.select_pack.deselect_all", "ยกเลิกทั้งหมด")
                        : t("package.select_pack.select_all", "เลือกทั้งหมด")
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-lg">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-bold text-primary-700">
                      {selectedPackages.length} / {list.filter(item => item.status === 2).length}
                    </span>
                  </div>
                </div>
                
                {selectedPackages.length > 0 && (() => {
                  const selectedItems = list.filter(item => selectedPackages.includes(item.id));
                  const storageIds = [...new Set(selectedItems.map(item => item.storage_id))];
                  const warehouseNames = [...new Set(selectedItems.map(item => item.storage?.shop_name).filter(Boolean))];
                  
                  if (storageIds.length > 1) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-xs text-red-700">
                          <p className="font-medium mb-1">{t("package.warehouse_notice.error", "ไม่สามารถแพ็คร่วมกันได้")}</p>
                          <p>{t("package.warehouse_notice.different_warehouse", "พัสดุที่เลือกมาจากคลังที่แตกต่างกัน กรุณาเลือกพัสดุจากคลังเดียวกัน")}</p>
                        </div>
                      </div>
                    );
                  } else if (warehouseNames.length > 0) {
                    return (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-xs text-green-700">
                          <p className="font-medium">{t("package.warehouse_notice.same_warehouse", "คลังเดียวกัน")}: {warehouseNames[0]}</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {list.map((item, index) => {
              const isSelectable = selectionMode && item.status === 2;
              const isSelected = selectedPackages.includes(item.id);
              
              return (
              <div
                key={index}
                onClick={() => isSelectable && togglePackageSelection(item.id, item)}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all relative ${
                  isSelectable && isSelected
                    ? 'border-primary-500 border-2 bg-primary-50'
                    : 'border-gray-100'
                } ${isSelectable ? 'cursor-pointer active:scale-[0.98]' : ''} ${selectionMode && !isSelectable ? 'opacity-50' : ''}`}
              >
                {selectionMode && (
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      disabled={!isSelectable}
                      className={`w-6 h-6 rounded border-2 text-primary-600 focus:ring-2 focus:ring-primary-200 pointer-events-none ${
                        isSelectable ? 'border-primary-500 cursor-pointer' : 'border-gray-300 cursor-not-allowed'
                      }`}
                      readOnly
                    />
                  </div>
                )}

                <div className={`flex justify-between items-start mb-3 pb-3 border-b border-gray-50 ${selectionMode ? 'ml-8' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-1.5 rounded-lg">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img24.png" className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">{item.storage?.shop_name || t("package.labels.warehouse")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                    {!selectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDetail(item);
                        }}
                        className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
                      >
                        {t("common.view_detail")}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <InfoItem label={t("package.labels.tracking_no", "เลขพัสดุ")} value={item.express_num} />
                  {item.mark && (
                    <InfoItem label={t("package.labels.mark", "唛头")} value={item.mark} />
                  )}
                  <InfoItem label={t("package.labels.country")} value={item.country?.title || t("package.labels.not_provided")} />
                  <InfoItem label={t("package.labels.items")} value={item.class_name} />
                  {(item.weight || item.length || item.width || item.height) && (
                    <InfoItem 
                      label={t("package.labels.dimensions", "ขนาด/น้ำหนัก")} 
                      value={`${item.length || '-'}×${item.width || '-'}×${item.height || '-'} cm / ${item.weight || '-'} kg`} 
                    />
                  )}
                  <InfoItem label={t("package.labels.report_time")} value={item.created_time} />
                </div>

                {item.images && item.images.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-gray-50">
                    <p className="text-xs text-gray-500 mb-2">{t("package.labels.goods_images", "รูปสินค้า")}:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {item.images.map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`Package ${idx + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(item.images, idx);
                          }}
                          className="w-20 h-20 object-cover rounded-lg bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!selectionMode && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                    {item.status != -1 && item.status != 3 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmCancel(item.id);
                          }}
                          className="flex-1 text-xs font-medium text-red-500 bg-red-50 py-2 rounded-lg hover:bg-red-100"
                        >
                          {t("package.cancel_report")}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="flex-1 text-xs font-medium text-gray-600 bg-gray-100 py-2 rounded-lg hover:bg-gray-200"
                        >
                          {t("package.edit_report")}
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogistics(item.express_num);
                      }}
                      className="flex-1 text-xs font-medium text-blue-600 bg-blue-50 py-2 rounded-lg hover:bg-blue-100"
                    >
                      {t("package.view_logistics")}
                    </button>
                  </div>
                )}
              </div>
            )})}
          </>
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">{t("common.no_data")}</div>
        )}
      </div>

      {selectionMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 border-t border-gray-200 p-4 pb-safe shadow-2xl z-20">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">
                  {t("package.select_pack.selected", "เลือกแล้ว")}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedPackages.length} <span className="text-gray-400 font-normal">/ {list.length}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleSelectionMode}
                className="flex-1 py-3.5 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                {t("common.cancel", "ยกเลิก")}
              </button>
              <button
                onClick={handleApplyPacking}
                className={`flex-1 py-3.5 rounded-xl font-bold transition-all shadow-lg ${
                  selectedPackages.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-xl active:scale-[0.98]'
                }`}
                disabled={selectedPackages.length === 0}
              >
                <span className="flex items-center justify-center gap-2">
                  {t("package.select_pack.next", "ถัดไป")}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5M6 12H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("common.confirm")}</h3>
            <p className="text-gray-600 mb-6">{t("package.confirm_cancel")}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200"
              >
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {imageModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={closeImageModal}>
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {imageModal.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={imageModal.images[imageModal.currentIndex]}
              alt={`Package ${imageModal.currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {imageModal.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {imageModal.currentIndex + 1} / {imageModal.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}:</span>
    <span className="text-gray-800 font-medium truncate max-w-[60%]">{value}</span>
  </div>
);

export default OrderPackagePage;
