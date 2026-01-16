import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { packageIdsState } from "../../state";
import request from "../../utils/request";
import { toast } from "../../utils/toast";
import Loading from "../../components/Loading/Index";
import OptimizedImage from "../../components/Common/OptimizedImage";
import PackHeroSection from "../../components/Pack/PackHeroSection";
import EnhancedPackageCard from "../../components/Pack/EnhancedPackageCard";
import ShippingRouteSelector from "../../components/Pack/ShippingRouteSelector";
import DestinationSelector from "../../components/Pack/DestinationSelector";
import PackingServiceCard from "../../components/Pack/PackingServiceCard";
import CostSummaryBar from "../../components/Pack/CostSummaryBar";

const PackingApplicationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const packageIds = useRecoilValue(packageIdsState);
  const setPackageIds = useSetRecoilState(packageIdsState);
  
  const [packages, setPackages] = useState([]);
  const [lines, setLines] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [packServices, setPackServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    line_id: "",
    address_id: "",
    pack_ids: [],
    remark: "",
    waitreceivedmoney: 0
  });
  
  // Image modal state
  const [imageModal, setImageModal] = useState({ show: false, images: [], currentIndex: 0 });
  
  useEffect(() => {
    console.log('Pack page loaded, packageIds:', packageIds);
    if (!packageIds || packageIds.length === 0) {
      toast.error(t("package.error.no_packages", "ไม่พบพัสดุที่เลือก"));
      navigate("/order/package");
      return;
    }
    
    fetchAllData();
  }, [packageIds]); // Add packageIds as dependency
  
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPackageDetails(),
        fetchLines(),
        fetchAddresses(),
        fetchPackServices()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPackageDetails = async () => {
    try {
      // Get packages with status=2 (received/已入库)
      const res = await request.get("package/outside&wxapp_id=10001", { status: 2 });
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        // Filter only selected packages - ensure ID comparison works with both string and number
        const selectedPacks = res.data.data.filter(pkg => 
          packageIds.includes(pkg.id) || packageIds.includes(String(pkg.id))
        );
        setPackages(selectedPacks);
        console.log('Selected packages:', selectedPacks.length, 'out of', packageIds.length);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error(t("package.error.fetch_failed", "ไม่สามารถโหลดข้อมูลพัสดุได้"));
    }
  };
  
  const fetchLines = async () => {
    try {
      const res = await request.get("page/getAllline&wxapp_id=10001");
      console.log('Lines API response:', res);
      if (res.data && Array.isArray(res.data)) {
        setLines(res.data);
      } else if (res.data && res.data.list && Array.isArray(res.data.list)) {
        setLines(res.data.list);
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        setLines(res.data.data);
      } else {
        console.log('No valid lines data found in response');
        setLines([]);
      }
    } catch (error) {
      console.error("Error fetching lines:", error);
      setLines([]);
    }
  };
  
  const fetchAddresses = async () => {
    try {
      const res = await request.get("address/lists&wxapp_id=10001");
      console.log('Addresses API response:', res);
      if (res.data && res.data.list && Array.isArray(res.data.list)) {
        setAddresses(res.data.list);
      } else if (res.data && Array.isArray(res.data)) {
        setAddresses(res.data);
      } else {
        console.log('No valid addresses data found in response');
        setAddresses([]);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    }
  };
  
  const fetchPackServices = async () => {
    try {
      const res = await request.get("package/postservice&wxapp_id=10001");
      if (res.data && Array.isArray(res.data)) {
        setPackServices(res.data);
      }
    } catch (error) {
      console.error("Error fetching pack services:", error);
    }
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validation
    if (!form.line_id) {
      toast.error(t("package.error.select_line", "กรุณาเลือกเส้นทางการจัดส่ง"));
      return;
    }

    if (!form.address_id) {
      toast.error(t("package.error.select_address", "กรุณาเลือกที่อยู่จัดส่ง"));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        packids: packageIds.join(","),
        line_id: form.line_id,
        address_id: form.address_id,
        pack_ids: Array.isArray(form.pack_ids) && form.pack_ids.length > 0 ? form.pack_ids.join(",") : "",
        remark: form.remark || "",
        waitreceivedmoney: form.waitreceivedmoney || 0
      };

      console.log('Submitting pack request:', payload);

      const res = await request.post("package/postPack&wxapp_id=10001", payload);

      if (res.code === 1) {
        toast.success(t("package.success.packing_applied", "สมัครแพ็คพัสดุสำเร็จ"));
        // Clear selected packages
        setPackageIds([]);
        setTimeout(() => navigate("/order/index"), 1500);
      } else {
        console.error('API returned error:', res);
        toast.error(res.msg || t("common.error", "เกิดข้อผิดพลาด"));
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(t("common.error_network", "เกิดข้อผิดพลาดในการเชื่อมต่อ"));
    } finally {
      setSubmitting(false);
    }
  };
  
  const togglePackService = (serviceId) => {
    setForm(prev => ({
      ...prev,
      pack_ids: prev.pack_ids.includes(serviceId)
        ? prev.pack_ids.filter(id => id !== serviceId)
        : [...prev.pack_ids, serviceId]
    }));
  };
  
  // Image modal handlers
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
  
  // Calculate current step based on form completion
  const getCurrentStep = () => {
    if (!form.line_id) return 2; // On route selection
    if (!form.address_id) return 3; // On destination selection
    return 4; // Ready to confirm
  };

  // Calculate costs
  const calculateCosts = () => {
    const shippingCost = 0; // Would come from selected line
    const serviceCost = packServices
      .filter(s => form.pack_ids.includes(s.id))
      .reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
    return {
      shippingCost,
      serviceCost,
      totalCost: shippingCost + serviceCost
    };
  };

  const costs = calculateCosts();
  const canSubmit = form.line_id && form.address_id && !submitting;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading is={true} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Hero Section with Progress */}
      <PackHeroSection 
        currentStep={getCurrentStep()}
        packageCount={packages.length}
      />
      
      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Selected Packages - Compact Cards */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>📦</span>
            <span>{t("package.selected_packages", "พัสดุที่เลือก")} ({packages.length})</span>
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {packages.map((pkg) => (
              <EnhancedPackageCard
                key={pkg.id}
                pkg={pkg}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        </div>

        {/* Shipping Route Selection */}
        <ShippingRouteSelector
          lines={lines}
          selectedLineId={form.line_id}
          onSelect={(lineId) => setForm({...form, line_id: lineId})}
        />

        {/* Destination Selection */}
        <DestinationSelector
          addresses={addresses}
          selectedAddressId={form.address_id}
          onSelect={(addressId) => setForm({...form, address_id: addressId})}
          onAddNew={() => navigate('/address/add')}
        />

        {/* Packing Services */}
        <PackingServiceCard
          services={packServices}
          selectedServiceIds={form.pack_ids}
          onToggle={togglePackService}
        />

        {/* Remarks */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              📝
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-base">
                {t("package.remarks", "หมายเหตุ")}
              </h3>
              <p className="text-xs text-gray-500">
                ข้อความเพิ่มเติม (ไม่บังคับ)
              </p>
            </div>
          </div>
          <textarea
            value={form.remark}
            onChange={(e) => setForm({...form, remark: e.target.value})}
            placeholder={t("package.remarks_placeholder", "กรอกหมายเหตุ (ไม่บังคับ)")}
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 min-h-[100px] transition-all"
            rows="4"
          />
        </div>
      </div>

      {/* Cost Summary Bar */}
      <CostSummaryBar
        visible={true}
        shippingCost={costs.shippingCost}
        serviceCost={costs.serviceCost}
        totalCost={costs.totalCost}
        onSubmit={handleSubmit}
        disabled={!canSubmit}
        loading={submitting}
      />
      
      {/* Image Modal */}
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
            <OptimizedImage
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

export default PackingApplicationPage;
