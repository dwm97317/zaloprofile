import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { addressInfoState, addressFormState, selectState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";

const AddressBookPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Global State
  const setAddressForm = useSetRecoilState(addressFormState);
  const setAddressInfo = useSetRecoilState(addressInfoState);
  const setSelect = useSetRecoilState(selectState);
  const isSelect = useRecoilValue(selectState);

  // Local State
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ show: false, type: "", id: null });

  useEffect(() => {
    util.setBarPageView("Address Book");
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await request.get("address/lists&wxapp_id=10001");
      if (res && res.data && Array.isArray(res.data.list)) {
        setList(res.data.list);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setAddressForm(null); // Clear form state
    setAddressInfo(null); // Clear info state
    navigate("/address/create");
  };

  const handleEdit = async (item) => {
    // Optimistically set info from list item first
    setAddressInfo(item);
    navigate("/address/create");

    // Detailed fetch could happen in Create page if needed, 
    // but passing item is usually enough unless we need full details not in list
  };

  const handleSelect = (item) => {
    if (!isSelect) return;
    setSelect(false);
    setAddressInfo(item);
    navigate(-1);
  };

  const promptDelete = (id) => {
    setModalConfig({ show: true, type: "delete", id });
  };

  const promptDefault = (id) => {
    setModalConfig({ show: true, type: "default", id });
  };

  const handleConfirmAction = async () => {
    const { type, id } = modalConfig;
    setModalConfig({ ...modalConfig, show: false });
    setLoading(true);

    try {
      const token = util.getToken();
      if (!token) return; // Should handle login redirect ideally

      let url = "";
      let body = { token };

      if (type === "delete") {
        url = `address/delete&address_id=${id}&wxapp_id=10001`;
      } else {
        url = "address/setDefault&wxapp_id=10001";
        body.address_id = id;
      }

      const res = await request.post(url, body);
      if (res.code === 1) {
        alert(type === "delete" ? t("address.delete_success") : t("address.default_success"));
        fetchList();
      } else {
        alert(res.msg || t("common.error"));
      }
    } catch (err) {
      alert(t("common.error_network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("address.title")}</h1>
      </div>

      {/* List */}
      <div className="p-4 space-y-4">
        {list.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-400">
            {t("common.no_data")}
          </div>
        )}

        {list.map((item, index) => (
          <div key={index} className={`bg-white rounded-2xl p-4 shadow-sm border ${item.is_default ? 'border-blue-200 ring-1 ring-blue-100' : 'border-transparent'}`}>
            {/* Content Area - Clickable if select mode */}
            <div onClick={() => handleSelect(item)} className={isSelect ? "cursor-pointer active:opacity-70 transition" : ""}>
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-gray-800 text-lg">
                  {item.name}
                  <span className="text-sm font-normal text-gray-500 ml-2">{item.phone}</span>
                </div>
                {item.is_default == 1 && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-bold">
                    {t("address.is_default")}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed border-b border-gray-100 pb-3 mb-3">
                {[item.detail, item.region, item.city, item.province, item.country].filter(Boolean).join(", ")}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center text-sm">
              <button
                onClick={() => promptDefault(item.address_id)}
                className={`flex items-center gap-1 ${item.is_default ? "text-blue-600 font-bold" : "text-gray-500 hover:text-gray-700"}`}
                disabled={item.is_default == 1}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${item.is_default ? "border-blue-600 bg-blue-600" : "border-gray-400"}`}>
                  {item.is_default == 1 && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
                {t("address.set_default")}
              </button>

              <div className="flex gap-4">
                <button onClick={() => handleEdit(item)} className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  {t("common.edit")}
                </button>
                <button onClick={() => promptDelete(item.address_id)} className="text-gray-500 hover:text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  {t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-gray-100">
        <Button onClick={handleCreate} className="w-full h-12 text-lg rounded-xl shadow-lg shadow-blue-200">
          {t("address.add_new")}
        </Button>
      </div>

      {/* Modal */}
      {modalConfig.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("common.confirm")}</h3>
            <p className="text-gray-600 mb-6 font-medium">
              {modalConfig.type === "delete" ? t("address.confirm_delete") : t("address.confirm_default")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModalConfig({ ...modalConfig, show: false })}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleConfirmAction}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Loading is={loading} />
    </div>
  );
};

export default AddressBookPage;