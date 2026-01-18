import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { countryState } from "../../state";
import request from "../../utils/request";
import { ChevronRightIcon, SearchIcon } from "../../components/Icons";

const CountryPage = () => {
  const { t } = useTranslation();
  const setCountryData = useSetRecoilState(countryState);
  const navigate = useNavigate();
  const [country, setCountry] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const getCountryList = async () => {
    try {
      const res = await request.get("/package/country&wxapp_id=10001");
      let detail = res.data;
      detail = convertJsonToArray(detail);
      setCountry(detail);
    } catch (error) {
      console.error("Failed to fetch countries", error);
    } finally {
      setLoading(false);
    }
  };

  const convertJsonToArray = (data) => {
    let arr = [];
    for (let i in data) {
      arr.push({
        key: i,
        data: data[i],
      });
    }
    return arr;
  };

  const handleSelect = (item) => {
    setCountryData(item);
    navigate(-1);
  };

  const filterCountries = (countries) => {
    if (!searchTerm) return countries;

    return countries.map(group => ({
      ...group,
      data: group.data.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.data.length > 0);
  };

  useEffect(() => {
    getCountryList();
  }, []);

  const filteredCountry = filterCountries(country);

  return (
    <div className="min-h-screen bg-white pb-safe font-sans">
      {/* Header - Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center justify-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-90"
        >
          <ChevronRightIcon className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">{t("country.title", "Select Country")}</h1>
      </div>

      {/* Search Bar - Sticky below header */}
      <div className="sticky top-[52px] z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-3">
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon className="w-5 h-5" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
            placeholder={t("country.search_placeholder", "Search country...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Country List */}
      <div className="relative z-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 text-sm font-medium">{t("common.loading", "Loading...")}</p>
          </div>
        ) : filteredCountry.length > 0 ? (
          <div className="pb-10">
            {filteredCountry.map((item, index) => (
              <div key={index}>
                {/* Group Header - Sticky */}
                <div className="bg-slate-50/95 backdrop-blur-sm px-5 py-2 sticky top-[120px] z-10 border-y border-slate-100/50">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.key}</h3>
                </div>
                {/* Items */}
                <div>
                  {item.data.map((item1, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(item1)}
                      className="w-full pl-5 pr-4 py-3.5 text-left bg-white active:bg-slate-50 transition-colors flex items-center justify-between group border-b border-slate-50 last:border-none"
                    >
                      <span className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{item1.title}</span>
                      {/* Optional: Add flag or visual if available? For now just chevron */}
                      <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="1.5" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="font-medium">{t("country.no_results", "No countries found")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryPage;
