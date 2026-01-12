import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { countryState } from "../../state";
import Header from "../../components/Header/Header";
import request from "../../utils/request";

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
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header title={t("country.title", "Select Country")} />

      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={t("country.search_placeholder", "Search country...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Country List */}
      <div className="p-4">
        {loading ? (
          <div className="text-center text-gray-500 mt-10">
            {t("common.loading", "Loading...")}
          </div>
        ) : filteredCountry.length > 0 ? (
          <div className="space-y-6">
            {filteredCountry.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2">
                  <h3 className="text-white font-bold text-lg">{item.key}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {item.data.map((item1, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(item1)}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium">{item1.title}</span>
                      <svg 
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>{t("country.no_results", "No countries found")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryPage;
