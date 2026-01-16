import { useEffect, useState, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { packageInfoState } from "../../state";
import util from "../../utils/util";
import Header from "../../components/Header/Header";
import { toast } from "../../utils/toast";
import OptimizedImage from "../../components/Common/OptimizedImage";
import OrderTimeline from "../../components/Order/OrderTimeline";

// 包裹状态常量
const PACKAGE_STATUS = {
  NOT_RECEIVED: 1,    // 待入库
  RECEIVED: 2,        // 已入库
  ON_SHELF: 3,        // 已上架
  PENDING_PACK: 4,    // 待打包
  PENDING_PAY: 5,     // 待支付
  PAID: 6,            // 已支付
  IN_BATCH: 7,        // 加入批次
  PACKED: 8,          // 已打包
  SHIPPED: 9,         // 已发货
  RECEIVED_USER: 10,  // 已收货
  COMPLETED: 11       // 已完成
};

// 判断是否为已发货或已完成状态
const isShippedOrCompleted = (status) => {
  return [PACKAGE_STATUS.SHIPPED, PACKAGE_STATUS.RECEIVED_USER, PACKAGE_STATUS.COMPLETED].includes(status);
};

const PackDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pack_info = useRecoilValue(packageInfoState);
  const [imageModal, setImageModal] = useState({ show: false, images: [], currentIndex: 0 });
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    util.setBarPageView("Package Detail");
  }, []);

  // 复制单号功能
  const handleCopyTrackingNo = useCallback(async (text) => {
    if (!text) return;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopySuccess(true);
      toast.success(t("common.copy_success", "คัดลอกสำเร็จ"));
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      toast.error(t("common.copy_failed", "คัดลอกไม่สำเร็จ"));
    }
  }, [t]);

  // 跳转到集运订单详情
  const handleNavigateToOrder = useCallback(() => {
    if (pack_info.inpack_id) {
      navigate(`/order/detail?id=${pack_info.inpack_id}`);
    }
  }, [pack_info.inpack_id, navigate]);

  // 图片查看
  const handleImageClick = (images, index) => {
    if (!images || images.length === 0) return;
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

  // 获取图片列表 - 支持两种数据格式
  // 1. outside API 返回的 images 数组 (简单 URL 字符串数组)
  // 2. details API 返回的 packageimage 数组 (对象数组，包含 file.file_path)
  const getImages = () => {
    // 优先使用 images 字段 (来自 outside API)
    if (pack_info.images && Array.isArray(pack_info.images) && pack_info.images.length > 0) {
      return pack_info.images;
    }
    // 兼容 packageimage 字段 (来自 details API)
    if (pack_info.packageimage && Array.isArray(pack_info.packageimage)) {
      return pack_info.packageimage
        .filter(img => img.file && (img.file.file_path || img.file.file_url))
        .map(img => img.file.file_path || img.file.file_url);
    }
    return [];
  };

  const images = getImages();
  const isShipped = isShippedOrCompleted(pack_info.status);

  // 格式化尺寸显示
  const formatDimensions = () => {
    const { length, width, height } = pack_info;
    if (length || width || height) {
      return `${length || 0} × ${width || 0} × ${height || 0} cm`;
    }
    return t("common.not_provided", "ไม่ระบุ");
  };

  // 格式化体积显示
  const formatVolume = () => {
    if (pack_info.volume) {
      return `${pack_info.volume} cm³`;
    }
    return t("common.not_provided", "ไม่ระบุ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-safe">
      <Header title={t("package.detail_title", "รายละเอียดพัสดุ")} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 space-y-4"
      >
        {/* 包裹单号卡片 - 突出显示 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-white/80 text-xs mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {t("package.form.tracking_no", "เลขพัสดุ")}
              </div>
              <div className="text-xl font-bold tracking-wide">
                {pack_info.express_num || t("common.not_provided", "ไม่ระบุ")}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopyTrackingNo(pack_info.express_num)}
              className={`ml-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                copySuccess 
                  ? 'bg-green-400 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
              }`}
            >
              <AnimatePresence mode="wait">
                {copySuccess ? (
                  <motion.span
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t("common.copied", "คัดลอกแล้ว")}
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {t("common.copy", "คัดลอก")}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* Status Timeline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <OrderTimeline status={pack_info.status} isPay={pack_info.is_pay} />
        </motion.div>

        {/* 唛头卡片 - 条件显示 */}
        {(pack_info.mark || pack_info.usermark) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
                <span className="text-xl">🏷️</span>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">
                  {t("package.mark", "唛头")}
                </div>
                <div className="font-bold text-gray-800 text-lg">
                  {pack_info.mark || pack_info.usermark}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 已发货/已完成状态 - 显示集运单号 */}
        {isShipped && pack_info.inpack_id && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNavigateToOrder}
            className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">
                    {t("package.inpack_order", "เลขคำสั่งรวมพัสดุ")}
                  </div>
                  <div className="font-semibold text-gray-800">
                    {pack_info.order_sn || `#${pack_info.inpack_id}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary-500">
                <span className="text-sm font-medium">{t("common.view_detail", "ดูรายละเอียด")}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        {/* 重量和尺寸信息 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
        >
          <div className="p-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              {t("package.weight_size", "น้ำหนักและขนาด")}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 divide-x divide-gray-50">
            {/* 重量 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div className="text-xs text-gray-500 mb-1">{t("package.weight", "น้ำหนัก")}</div>
              <div className="text-lg font-bold text-gray-800">
                {pack_info.weight ? `${pack_info.weight} kg` : t("common.not_provided", "ไม่ระบุ")}
              </div>
            </motion.div>
            
            {/* 体积 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-xs text-gray-500 mb-1">{t("package.volume", "ปริมาตร")}</div>
              <div className="text-lg font-bold text-gray-800">{formatVolume()}</div>
            </motion.div>
          </div>
          
          {/* 长宽高 */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{t("package.dimensions", "ขนาด (ยาว×กว้าง×สูง)")}</span>
              <span className="text-sm font-medium text-gray-700">{formatDimensions()}</span>
            </div>
          </div>
        </motion.div>

        {/* 寄送国家 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">
                {t("package.destination_country", "ประเทศปลายทาง")}
              </div>
              <div className="font-semibold text-gray-800">
                {pack_info.country?.title || pack_info.country_name || t("common.not_provided", "ไม่ระบุ")}
              </div>
            </div>
          </div>
        </div>

        {/* 集运仓库 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">
                {t("package.warehouse", "คลังสินค้า")}
              </div>
              <div className="font-semibold text-gray-800">
                {pack_info.storage?.shop_name || pack_info.storage_name || t("common.not_provided", "ไม่ระบุ")}
              </div>
            </div>
          </div>
        </div>

        {/* 已发货/已完成状态 - 显示选择线路 */}
        {isShipped && pack_info.line && (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">
                  {t("package.shipping_line", "เส้นทางขนส่ง")}
                </div>
                <div className="font-semibold text-gray-800">
                  {pack_info.line?.name || pack_info.line_name || t("common.not_provided", "ไม่ระบุ")}
                </div>
                {pack_info.line?.limitationofdelivery && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {t("package.delivery_time", "ระยะเวลาจัดส่ง")}: {pack_info.line.limitationofdelivery}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 商品图片 */}
        {images.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
          >
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t("package.product_images", "รูปภาพสินค้า")}
                <span className="ml-auto text-xs font-normal text-gray-400">
                  {images.length} {t("common.items", "รายการ")}
                </span>
              </h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleImageClick(images, index)}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer relative group"
                  >
                    <OptimizedImage
                      src={img}
                      alt={`${t("package.product_image", "รูปสินค้า")} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 无图片提示 */}
        {images.length === 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">{t("package.no_images", "ยังไม่มีรูปภาพสินค้า")}</p>
          </motion.div>
        )}
      </motion.div>

      {/* 图片查看模态框 */}
      <AnimatePresence>
        {imageModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeImageModal}
          >
            {/* 关闭按钮 */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* 图片计数 */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/20 text-white text-sm backdrop-blur-sm"
            >
              {imageModal.currentIndex + 1} / {imageModal.images.length}
            </motion.div>

            {/* 主图片 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-full max-h-full p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageModal.images[imageModal.currentIndex]}
                alt={`${t("package.product_image", "รูปสินค้า")} ${imageModal.currentIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </motion.div>

            {/* 上一张按钮 */}
            {imageModal.images.length > 1 && (
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            )}

            {/* 下一张按钮 */}
            {imageModal.images.length > 1 && (
              <motion.button
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            )}

            {/* 缩略图导航 */}
            {imageModal.images.length > 1 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-white/10 backdrop-blur-sm"
              >
                {imageModal.images.map((img, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setImageModal(prev => ({ ...prev, currentIndex: index }));
                    }}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      index === imageModal.currentIndex 
                        ? 'border-white scale-110' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PackDetailPage;
