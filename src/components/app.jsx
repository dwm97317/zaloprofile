import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";

// Import Pages
import HomePage from "../pages/Home/Index";
import FreightPage from "../pages/Freight/Index";
import FreightResultPage from "../pages/Freight/Result";
import QueryPage from "../pages/Query/Index";
import MinePage from "../pages/Mine/Index";
import RechargePage from "../pages/Mine/Recharge";
import BalancePage from "../pages/Mine/Balance";
import BalanceLogPage from "../pages/Mine/BalanceLog";
import StoragePage from "../pages/Storage/Index";
import StorageDetailPage from "../pages/Storage/Detail";
import AddressPage from "../pages/Address/Index";
import AddressCreatePage from "../pages/Address/Create";
import AddressCreateWithMapPage from "../pages/Address/CreateWithMap";
import OrderIndexPage from "../pages/Order/Index";
import OrderVerifyPage from "../pages/Order/Verify";
import OrderDetailPage from "../pages/Order/OrderDetail";
import OrderPackagePage from "../pages/Order/Package";
import PackReportPage from "../pages/Packages/Report";
import PackPage from "../pages/Packages/Pack";
import PackingApplicationPage from "../pages/Packages/Pack";
import PackDetailPage from "../pages/Order/Detail";
import PackModifyPage from "../pages/Order/Modify";
import PackConfirmPage from "../pages/Packages/Confirmpack";
import PackTakePage from "../pages/PackageTake/Index";
import PackTakeFormPage from "../pages/Packages/Takeform";
import PackageForecastPage from "../pages/Package/Forecast";
import PackageClaimPage from "../pages/Package/Claim";
import PackagePackSelectPage from "../pages/Package/PackagePackSelect";
import OrderHelperPage from "../pages/article/help/Order";
import ListHelperPage from "../pages/article/help/List";
import DetailHelperPage from "../pages/article/help/Detail";
import CommonLineDetailPage from "../pages/Common/LineDetail";
import CommonCountrySelectPage from "../pages/Common/Country";
import CommonCategorySelectPage from "../pages/Common/Category";
import CommonCommentPage from "../pages/Common/Comment";
import CommonCouponPage from "../pages/Common/Coupon";
import CommonSmsPage from "../pages/Common/Sms";
import QuickStartPage from "../pages/Guide/Index";
import GradePage from "../pages/Grade/Index";
import MarkPage from "../pages/Mark/Index";
import CouponCenterPage from "../pages/Coupon/Center";
import MessageIndexPage from "../pages/Message/Index";
import MessageDetailPage from "../pages/Message/Detail";

import Loading from "./Loading/Index";

const MyApp = () => {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/query" element={<QueryPage />} />
              <Route path="/freight" element={<FreightPage />} />
              <Route path="/freight/result" element={<FreightResultPage />} />
              <Route path="/mine" element={<MinePage />} />
              <Route path="/article/help/order" element={<OrderHelperPage />} />
              <Route path="/article/help/list" element={<ListHelperPage />} />
              <Route path="/article/help/detail" element={<DetailHelperPage />} />
              <Route path="/package/report" element={<PackReportPage />} />
              <Route path="/package/forecast" element={<PackageForecastPage />} />
              <Route path="/package/claim" element={<PackageClaimPage />} />
              <Route path="/package/pack/select" element={<PackagePackSelectPage />} />
              <Route path="/package/pack" element={<PackPage />} />
              <Route path="/packages/pack" element={<PackingApplicationPage />} />
              <Route path="/package/pack/detail" element={<PackDetailPage />} />
              <Route path="/package/pack/modify" element={<PackModifyPage />} />
              <Route path="/package/pack/confirm" element={<PackConfirmPage />} />
              <Route path="/package/take" element={<PackTakePage />} />
              <Route path="/package/takeform" element={<PackTakeFormPage />} />
              <Route path="/order/index" element={<OrderIndexPage />} />
              <Route path="/order/detail" element={<OrderDetailPage />} />
              <Route path="/order/package" element={<OrderPackagePage />} />
              <Route path="/order/verify" element={<OrderVerifyPage />} />
              <Route path="/storage/index" element={<StoragePage />} />
              <Route path="/storage/detail" element={<StorageDetailPage />} />
              <Route path="/address/index" element={<AddressPage />} />
              <Route path="/address/create" element={<AddressCreatePage />} />
              <Route path="/address/create-map" element={<AddressCreateWithMapPage />} />
              <Route path="/common/line/detail" element={<CommonLineDetailPage />} />
              <Route path="/common/select/country" element={<CommonCountrySelectPage />} />
              <Route path="/common/select/category" element={<CommonCategorySelectPage />} />
              <Route path="/common/comment" element={<CommonCommentPage />} />
              <Route path="/common/sms" element={<CommonSmsPage />} />
              <Route path="/common/coupon" element={<CommonCouponPage />} />
              <Route path="/mine/balance" element={<BalancePage />} />
              <Route path="/mine/balance/log" element={<BalanceLogPage />} />
              <Route path="/mine/recharge" element={<RechargePage />} />
              <Route path="/guide/quick-start" element={<QuickStartPage />} />
              <Route path="/grade/index" element={<GradePage />} />
              <Route path="/mark" element={<MarkPage />} />
              <Route path="/coupon/center" element={<CouponCenterPage />} />
              <Route path="/message/index" element={<MessageIndexPage />} />
              <Route path="/message/detail" element={<MessageDetailPage />} />

              {/* Legacy fallback */}
              <Route path="/zapps/757872350750612320/*" element={<HomePage />} />
            </Routes>
          </div>
        </Suspense>
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default MyApp;
