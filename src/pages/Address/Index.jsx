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
  const { list } = lists;
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState("");
  const [id, setId] = useState(0);
  const setSelect = useSetRecoilState(selectState);
  const isSelect = useRecoilValue(selectState);
  const setAddressInfo = useSetRecoilState(addressInfoState);

  const onTargetEdit = (e, index) => {
    setAddressInfo(list[index]);
    navigate("/address/create");
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
      .then((res) => {});
  };

  // Xử lý xóa
  const doRequestDelete = (e) => {
    request
      .post("/address/delete&wxapp_id=10001", { address_id: id })
      .then((res) => {
        if (res.code == 1) {
          showToast({
            message: "Xóa thành công",
          });
          getAddressList();
        }
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
              <div className="address-row">{item.name}</div>
              <div className="address-row">
                {item.phone ? item.phone : "Chưa có số điện thoại"}
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
      const list = res.data.list;
      setList(list);
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
      {list.length > 0 ? <ListItem list={list} /> : <Empty />}
      <div className="button">
        <Button className="btn" onClick={(e) => goCreate(e)}>
          Thêm địa chỉ
        </Button>
      </div>
    </Page>
  );
};
export default AddressPage;