import React from "react";
import { Route } from "react-router-dom";
import { App, ZMPRouter, AnimationRoutes, SnackbarProvider } from "zmp-ui";
import { RecoilRoot } from "recoil";
import HomePage from "../pages/Home/Index";
import FreightPage from "../pages/Freight/Index";
import FreightResultPage from "../pages/Freight/Result";
import QueryPage from "../pages/Query/Index";
import MinePage from "../pages/Mine/Index";
import QRLoginPage from "../pages/QRLogin/index";
import RechargePage from "../pages/Mine/Recharge";
import BalancePage from "../pages/Mine/Balance";
import StoragePage from "../pages/Storage/Index";
import StorageDetailPage from "../pages/Storage/Detail";
import AddressPage from "../pages/Address/Index";
import AddressCreatePage from "../pages/Address/Create";
import OrderIndexPage from "../pages/Order/Index";
import OrderVerifyPage from "../pages/Order/Verify";
import OrderDetailPage from "../pages/Order/OrderDetail";
import OrderPackagePage from "../pages/Order/Package";
import PackReportPage from "../pages/Packages/Report";
import PackPage from "../pages/Packages/Pack";
import PackDetailPage from "../pages/Order/Detail";
import PackModifyPage from "../pages/Order/Modify";
import PackConfirmPage from "../pages/Packages/Confirmpack";
import PackTakePage from "../pages/Packages/Take";
import PackTakeFormPage from "../pages/Packages/Takeform";
import OrderHelperPage from "../pages/article/help/Order";
import ListHelperPage from "../pages/article/help/List";
import DetailHelperPage from "../pages/article/help/Detail";
import CommonLineDetailPage from "../pages/Common/LineDetail";
import CommonCountrySelectPage from "../pages/Common/Country";
import CommonCategorySelectPage from "../pages/Common/Category";
import CommonCommentPage from "../pages/Common/Comment";
import CommonCouponPage from "../pages/Common/Coupon";
import CommonSmsPage from "../pages/Common/Sms";

const MyApp = () => {
  return (
    <RecoilRoot>
      <App>
        <SnackbarProvider>
          <ZMPRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <AnimationRoutes>
              <Route path="/" element={<HomePage></HomePage>}></Route>
              <Route path="/query" element={<QueryPage></QueryPage>}></Route>
              <Route
                path="/freight"
                element={<FreightPage></FreightPage>}
              ></Route>
              <Route
                path="/freight/result"
                element={<FreightResultPage></FreightResultPage>}
              ></Route>
              <Route path="/mine" element={<MinePage></MinePage>}></Route>
              <Route path="/qr-login" element={<QRLoginPage></QRLoginPage>}></Route>
              <Route
                path="/article/help/order"
                element={<OrderHelperPage></OrderHelperPage>}
              ></Route>
              <Route
                path="/article/help/list"
                element={<ListHelperPage></ListHelperPage>}
              ></Route>
              <Route
                path="/article/help/detail"
                element={<DetailHelperPage></DetailHelperPage>}
              ></Route>
              <Route
                path="/package/report"
                element={<PackReportPage></PackReportPage>}
              ></Route>
              <Route
                path="/package/pack"
                element={<PackPage></PackPage>}
              ></Route>
              <Route
                path="/package/pack/detail"
                element={<PackDetailPage></PackDetailPage>}
              ></Route>
              <Route
                path="/package/pack/modify"
                element={<PackModifyPage></PackModifyPage>}
              ></Route>
              <Route
                path="/package/pack/confirm"
                element={<PackConfirmPage></PackConfirmPage>}
              ></Route>
              <Route
                path="/package/take"
                element={<PackTakePage></PackTakePage>}
              ></Route>
              <Route
                path="/package/takeform"
                element={<PackTakeFormPage></PackTakeFormPage>}
              ></Route>
              <Route
                path="/order/index"
                element={<OrderIndexPage></OrderIndexPage>}
              ></Route>
              <Route
                path="/order/detail"
                element={<OrderDetailPage></OrderDetailPage>}
              ></Route>
              <Route
                path="/order/package"
                element={<OrderPackagePage></OrderPackagePage>}
              ></Route>
              <Route
                path="/order/verify"
                element={<OrderVerifyPage></OrderVerifyPage>}
              ></Route>
              <Route
                path="/storage/index"
                element={<StoragePage></StoragePage>}
              ></Route>
              <Route
                path="/storage/detail"
                element={<StorageDetailPage></StorageDetailPage>}
              ></Route>
              <Route
                path="/address/index"
                element={<AddressPage></AddressPage>}
              ></Route>
              <Route
                path="/address/create"
                element={<AddressCreatePage></AddressCreatePage>}
              ></Route>
              <Route
                path="/common/line/detail"
                element={<CommonLineDetailPage></CommonLineDetailPage>}
              ></Route>
              <Route
                path="/common/select/country"
                element={<CommonCountrySelectPage></CommonCountrySelectPage>}
              ></Route>
              <Route
                path="/common/select/category"
                element={<CommonCategorySelectPage></CommonCategorySelectPage>}
              ></Route>
              <Route
                path="/common/comment"
                element={<CommonCommentPage></CommonCommentPage>}
              ></Route>
              <Route
                path="/common/sms"
                element={<CommonSmsPage></CommonSmsPage>}
              ></Route>
              <Route
                path="/common/coupon"
                element={<CommonCouponPage></CommonCouponPage>}
              ></Route>
              <Route
                path="/mine/balance"
                element={<BalancePage></BalancePage>}
              ></Route>
              <Route
                path="/mine/recharge"
                element={<RechargePage></RechargePage>}
              ></Route>
            </AnimationRoutes>
          </ZMPRouter>
        </SnackbarProvider>
      </App>
    </RecoilRoot>
  );
};
export default MyApp;
