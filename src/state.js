import { atom } from "recoil";

export const userState = atom({
  key: "user",
  default: "",
});

export const orderStatusState = atom({
  key: "orderStatus",
  default: "",
});

export const selectState = atom({
  key: "select",
  default: false,
});

export const countryState = atom({
  key: "country",
  default: "",
});

export const packIdState = atom({
  key: "packId",
  default: "",
});

export const orderIdState = atom({
  key: "orderId",
  default: "",
});

export const packageInfoState = atom({
  key: "packageInfo",
  default: "",
});

export const expressSnState = atom({
  key: "expressSn",
  default: "",
});

export const packInfoState = atom({
  key: "packInfo",
  default: "",
});

export const reportFormState = atom({
  key: "reportForm",
  default: "",
});

export const reportFormTypeState = atom({
  key: "reportFormType",
  default: "normal",
});

export const reportFormGoodsItemState = atom({
  key: "reportFormGoodsItem",
  default: "",
});

export const takeFormState = atom({
  key: "takeForm",
  default: "",
});
export const addressFormState = atom({
  key: "addressForm",
  default: "",
});
export const queryFormState = atom({
  key: "queryForm",
  default: "",
});

export const categoryState = atom({
  key: "category",
  default: "",
});

export const storageIdState = atom({
  key: "storageId",
  default: "",
});

export const lineIdState = atom({
  key: "lineId",
  default: "",
});
export const addressInfoState = atom({
  key: "addressInfo",
  default: "",
});

// 新手指南状态
export const guideTypeState = atom({
  key: "guideType",
  default: "",
});

export const OaUserState = atom({
  key: "oauserId",
  default: "",
});

export const guideIdState = atom({
  key: "guideId",
  default: "",
});

// Package selection state for packing application
export const packageIdsState = atom({
  key: "packageIds",
  default: [],
});

export const selectionModeState = atom({
  key: "selectionMode",
  default: false,
});

export const packageStatusState = atom({
  key: "packageStatus",
  default: "",
});

// 会员等级相关状态
export const userGradeState = atom({
  key: "userGrade",
  default: null, // UserGrade | null
});

export const gradeListState = atom({
  key: "gradeList",
  default: [], // UserGrade[]
});

export const userExpendState = atom({
  key: "userExpend",
  default: 0, // number
});
