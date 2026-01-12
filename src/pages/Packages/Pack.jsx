import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { packageIdsState } from "../../state";
import request from "../../utils/request";
import { handleApiError } from "../../utils/errorHandler";
import { toast } from "../../utils/toast";
import Loading from "../../components/Loading/Index";
import LineButton from "../../components/LineButton/Index";
import LineInput from "../../components/LineInput/Index";

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
    e.preventDefault();

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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading is={true} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">
          {t("package.packing_application", "สมัครแพ็คพัสดุ")}
        </h1>
      </div>
      
      {/* Selected Packages Section */}
      <div className="p-4 bg-white border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-3">
          {t("package.selected_packages", "พัสดุที่เลือก")} ({packages.length})
        </h2>
        <div className="space-y-2">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{pkg.order_sn}</p>
                  <p className="text-xs text-gray-500 mt-1">{pkg.express_num}</p>
                </div>
                {pkg.weight && (
                  <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                    {pkg.weight} kg
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Line Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {t("package.shipping_line", "เส้นทางการจัดส่ง")} <span className="text-red-500">*</span>
          </label>
          <select
            value={form.line_id}
            onChange={(e) => setForm({...form, line_id: e.target.value})}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          >
            <option value="">{t("package.select_line", "เลือกเส้นทางการจัดส่ง")}</option>
            {lines.map((line, index) => (
              <option key={`line-${line.id || line.line_id}-${index}`} value={line.id || line.line_id}>
                {line.name || line.line_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Address Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {t("package.delivery_address", "ที่อยู่จัดส่ง")} <span className="text-red-500">*</span>
          </label>
          <select
            value={form.address_id}
            onChange={(e) => setForm({...form, address_id: e.target.value})}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          >
            <option value="">{t("package.select_address", "เลือกที่อยู่จัดส่ง")}</option>
            {addresses.map((addr, index) => (
              <option key={`addr-${addr.address_id}-${index}`} value={addr.address_id}>
                {addr.name} - {addr.detail}
              </option>
            ))}
          </select>
        </div>
        
        {/* Packing Services */}
        {packServices.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              {t("package.packing_services", "บริการแพ็ค")}
            </label>
            <div className="space-y-2">
              {packServices.map(service => (
                <label 
                  key={service.id} 
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.pack_ids.includes(service.id)}
                    onChange={() => togglePackService(service.id)}
                    className="w-5 h-5 rounded border-2 border-blue-500 text-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800">{service.name}</span>
                    {service.price && (
                      <span className="text-sm text-blue-600 font-bold ml-2">฿{service.price}</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Remarks */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {t("package.remarks", "หมายเหตุ")}
          </label>
          <textarea
            value={form.remark}
            onChange={(e) => setForm({...form, remark: e.target.value})}
            placeholder={t("package.remarks_placeholder", "กรอกหมายเหตุ (ไม่บังคับ)")}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[100px]"
            rows="4"
          />
        </div>
        
        {/* Submit Button */}
        <div className="pt-4">
          <LineButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
          >
            {t("package.submit_application", "ยืนยันการสมัคร")}
          </LineButton>
        </div>
      </form>
    </div>
  );
};

export default PackingApplicationPage;
