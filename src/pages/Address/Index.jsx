import React, { useEffect, useState } from "react";
import { Button, Modal, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  addressInfoState,
  userState,
  addressFormState,
  selectState,
} from "../../state";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import Empty from "../../components/Empty";
import "./Index.scss";
import util from "../../utils/util";
import { showToast } from "zmp-sdk";

// Component danh sách
const ListItem = (lists) => {
  const { list, onRefresh } = lists;
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState("");
  const [id, setId] = useState(0);
  const setSelect = useSetRecoilState(selectState);
  const isSelect = useRecoilValue(selectState);
  const setAddressInfo = useSetRecoilState(addressInfoState);

  const onTargetEdit = async (e, index) => {
    try {
      const addressId = list[index].address_id;
      console.log("编辑地址 ID:", addressId);

      // 获取地址详情，确保数据完整
      const response = await request.get(`address/detail/${addressId}&wxapp_id=10001`);

      if (response.code === 1 && response.data.detail) {
        console.log("获取到的地址详情:", response.data.detail);
        setAddressInfo(response.data.detail);
      } else {
        // 如果API失败，使用列表中的数据
        console.warn("获取地址详情失败，使用列表数据:", list[index]);
        setAddressInfo(list[index]);
      }

      navigate("/address/create");
    } catch (error) {
      console.error("获取地址详情失败:", error);
      // 出错时使用列表中的数据
      setAddressInfo(list[index]);
      navigate("/address/create");
    }
  };

  // Xử lý xác nhận modal
  const doHandle = (e) => {
    if (confirmModalType == "delete") {
      doRequestDelete();
    } else {
      doRequestDeafult();
    }
    setConfirmModal(false);
  };

  const handleSelectAddress = (e, index) => {
    if (!isSelect) return;
    setSelect(false);
    setAddressInfo(list[index]);
    navigate(-1);
  };

  // Đặt địa chỉ mặc định
  const handleSetDeafult = (e, id) => {
    setConfirmModal(true);
    setId(id);
    setConfirmModalType("default");
  };

  // Xóa
  const handleDelete = (e, id) => {
    setConfirmModal(true);
    setId(id);
    setConfirmModalType("delete");
  };

  // Đặt địa chỉ mặc định
  const doRequestDeafult = (e) => {
    request
      .post("/address/setDefault&wxapp_id=10001", { address_id: id })
      .then((res) => {
        if (res && res.code == 1) {
          showToast({
            message: "Đặt địa chỉ mặc định thành công",
          });
          onRefresh();
        } else {
          showToast({
            message: "Không thể đặt địa chỉ mặc định",
          });
        }
      })
      .catch((error) => {
        console.error("Lỗi khi đặt địa chỉ mặc định:", error);
        showToast({
          message: "Có lỗi xảy ra",
        });
      });
  };

  // Xử lý xóa
  const doRequestDelete = (e) => {
    request
      .post("/address/delete&wxapp_id=10001", { address_id: id })
      .then((res) => {
        if (res && res.code == 1) {
          showToast({
            message: "Xóa thành công",
          });
          onRefresh();
        } else {
          showToast({
            message: "Không thể xóa địa chỉ",
          });
        }
      })
      .catch((error) => {
        console.error("Lỗi khi xóa địa chỉ:", error);
        showToast({
          message: "Có lỗi xảy ra",
        });
      });
  };

  return (
    <div>
      <Modal
        visible={confirmModal}
        title="Thông báo"
        description="Bạn có chắc chắn muốn thực hiện thao tác này?"
        actions={[
          {
            text: "Hủy",
            onClick: () => {
              setConfirmModal(false);
            },
            highLight: true,
          },
          {
            text: "Xác nhận",
            onClick: () => {
              doHandle();
            },
          },
        ]}
      />
      {list.map((item, index) => {
        return (
          <div className="address-container" key={index}>
            <div
              className="address-content"
              onClick={(e) => {
                handleSelectAddress(e, index);
              }}
            >
              <div className="address-row">
                <strong>{item.name}</strong>
                {item.tel_code && <span> (+{item.tel_code})</span>}
                <span> {item.phone || "Chưa có số điện thoại"}</span>
              </div>
              <div className="address-row">
                <span>{item.country || 'Việt Nam'}</span>
                {item.province && <span>, {item.province}</span>}
                {item.city && <span>, {item.city}</span>}
                {item.region && <span>, {item.region}</span>}
              </div>
              <div className="address-row">
                {item.street && <span>{item.street}, </span>}
                {item.door && <span>{item.door}, </span>}
                <span>{item.detail || 'Chưa có địa chỉ chi tiết'}</span>
              </div>
              <div className="edit" onClick={(e) => onTargetEdit(e, index)}>
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img81.png"></img>
              </div>
            </div>
            <div className="opration">
              <div
                className="default"
                onClick={(e) => handleSetDeafult(e, item.address_id)}
              >
                Địa chỉ mặc định
              </div>
              <div onClick={(e) => handleDelete(e, item.address_id)}>Xóa</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AddressPage = () => {
  const saveAddressFormState = useSetRecoilState(addressFormState);
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const setAddressInfo = useSetRecoilState(addressInfoState);

  // Lấy danh sách địa chỉ
  const getAddressList = () => {
    const url = "address/lists";
    request.get(url + "&wxapp_id=10001").then((res) => {
      // Kiểm tra xem res và res.data có tồn tại không
      if (res && res.data && res.data.list) {
        const list = res.data.list;
        setList(list);
      } else {
        // Nếu không có dữ liệu, đặt list rỗng
        console.warn("Không thể lấy danh sách địa chỉ:", res);
        setList([]);
      }
    }).catch((error) => {
      console.error("Lỗi khi lấy danh sách địa chỉ:", error);
      setList([]);
    });
  };
  
  const goCreate = (e) => {
    saveAddressFormState("");
    navigate("/address/create");
  };
  
  useEffect(() => {
    setAddressInfo("");
    getAddressList();
    util.setBarPageView("Danh sách địa chỉ");
    util.checkLogin(getAddressList).then((res) => {
      if (!res) {
        setTimeout(() => {
          navigate("/mine");
        }, 1000);
      }
    });
    return () => {};
  }, []);
  
  return (
    <Page className="page address">
      <Header></Header>
      {list.length > 0 ? <ListItem list={list} onRefresh={getAddressList} /> : <Empty />}
      <div className="button">
        <Button className="btn" onClick={(e) => goCreate(e)}>
          Thêm địa chỉ
        </Button>
      </div>
    </Page>
  );
};
export default AddressPage;