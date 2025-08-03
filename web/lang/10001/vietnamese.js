/**
 * 越南语言包
 * Vietnamese Language Pack for Zalo Mini App
 */
export default {
  // 通用
  common: {
    required: "Bắt buộc",
    optional: "Tùy chọn",
    submit: "Gửi",
    cancel: "Hủy",
    confirm: "Xác nhận",
    save: "Lưu",
    edit: "Sửa",
    delete: "Xóa",
    back: "Quay lại",
    next: "Tiếp theo",
    previous: "Trước",
    search: "Tìm kiếm",
    clear: "Xóa",
    loading: "Đang tải...",
    success: "Thành công",
    error: "Lỗi",
    warning: "Cảnh báo",
    info: "Thông tin"
  },

  // 地址相关
  address: {
    title: "Địa chỉ giao hàng",
    subtitle: "Chọn địa chỉ giao hàng chính xác",
    search_placeholder: "Nhập địa chỉ để tìm kiếm...",
    map_title: "Chọn vị trí trên bản đồ",
    map_hint: "Nhấp vào bản đồ để chọn địa chỉ chính xác",
    
    // 表单字段
    recipient_name: "Họ và tên người nhận",
    recipient_phone: "Số điện thoại",
    country: "Quốc gia",
    province: "Tỉnh/Thành phố",
    district: "Quận/Huyện", 
    ward: "Phường/Xã",
    street: "Đường/Phố",
    house_number: "Số nhà",
    detail_address: "Địa chỉ chi tiết",
    postal_code: "Mã bưu điện",
    email: "Email",
    delivery_note: "Ghi chú giao hàng",
    
    // Placeholder文本
    placeholders: {
      name: "Nhập họ và tên",
      phone: "Nhập số điện thoại",
      province: "Chọn tỉnh/thành phố",
      district: "Chọn quận/huyện",
      ward: "Chọn phường/xã",
      street: "Tên đường/phố",
      house_number: "Ví dụ: 123, 45A, 67/8...",
      detail: "Địa chỉ đầy đủ sẽ được điền tự động",
      postal_code: "Ví dụ: 10000",
      email: "example@email.com",
      delivery_note: "Ghi chú cho người giao hàng..."
    },
    
    // 验证消息
    validation: {
      name_required: "Vui lòng nhập họ và tên",
      phone_required: "Vui lòng nhập số điện thoại",
      phone_invalid: "Số điện thoại không hợp lệ",
      province_required: "Vui lòng chọn tỉnh/thành phố",
      district_required: "Vui lòng chọn quận/huyện",
      ward_required: "Vui lòng chọn phường/xã",
      detail_required: "Vui lòng nhập địa chỉ chi tiết",
      email_invalid: "Email không hợp lệ"
    },
    
    // 操作消息
    messages: {
      address_selected: "Đã chọn địa chỉ thành công!",
      address_cleared: "Đã xóa thông tin địa chỉ!",
      address_saved: "Lưu địa chỉ thành công!",
      save_failed: "Lỗi khi lưu địa chỉ!",
      search_failed: "Tìm kiếm thất bại, vui lòng thử lại",
      location_failed: "Không thể lấy vị trí, vui lòng thử lại",
      confirm_clear: "Bạn có chắc chắn muốn xóa tất cả thông tin?",
      network_error: "Có lỗi xảy ra, vui lòng thử lại",
      loading_search: "Đang tìm kiếm...",
      loading_location: "Đang lấy vị trí...",
      loading_save: "Đang lưu..."
    },
    
    // 预览
    preview: {
      title: "Xem trước địa chỉ",
      selected_address: "Địa chỉ đã chọn:",
      analysis: "Phân tích chi tiết:",
      coordinates: "Tọa độ:",
      latitude: "Vĩ độ:",
      longitude: "Kinh độ:"
    }
  },

  // 订单相关
  order: {
    title: "Đơn hàng",
    my_orders: "Đơn hàng của tôi",
    order_details: "Chi tiết đơn hàng",
    order_status: "Trạng thái đơn hàng",
    shipping_address: "Địa chỉ giao hàng",
    change_address: "Thay đổi địa chỉ",
    
    status: {
      pending: "Đang chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đã gửi hàng",
      delivered: "Đã giao hàng",
      cancelled: "Đã hủy"
    }
  },

  // 包裹相关  
  package: {
    title: "Bưu kiện",
    my_packages: "Bưu kiện của tôi",
    package_details: "Chi tiết bưu kiện",
    tracking_number: "Mã vận đơn",
    track_package: "Theo dõi bưu kiện",
    package_status: "Trạng thái bưu kiện",
    
    status: {
      received: "Đã nhận",
      in_transit: "Đang vận chuyển",
      out_for_delivery: "Đang giao hàng",
      delivered: "Đã giao",
      exception: "Có vấn đề"
    }
  },

  // 用户相关
  user: {
    profile: "Hồ sơ",
    account: "Tài khoản",
    settings: "Cài đặt",
    logout: "Đăng xuất",
    login: "Đăng nhập",
    register: "Đăng ký"
  },

  // 页面标题
  pages: {
    home: "Trang chủ",
    address_management: "Quản lý địa chỉ",
    add_address: "Thêm địa chỉ",
    edit_address: "Sửa địa chỉ",
    order_list: "Danh sách đơn hàng",
    package_list: "Danh sách bưu kiện",
    profile: "Hồ sơ cá nhân"
  },

  // 越南省份列表
  provinces: {
    "Hà Nội": "Hà Nội",
    "Thành phố Hồ Chí Minh": "TP. Hồ Chí Minh", 
    "Hải Phòng": "Hải Phòng",
    "Đà Nẵng": "Đà Nẵng",
    "Cần Thơ": "Cần Thơ",
    "An Giang": "An Giang",
    "Bà Rịa - Vũng Tàu": "Bà Rịa - Vũng Tàu",
    "Bắc Giang": "Bắc Giang",
    "Bắc Kạn": "Bắc Kạn",
    "Bạc Liêu": "Bạc Liêu",
    "Bắc Ninh": "Bắc Ninh",
    "Bến Tre": "Bến Tre",
    "Bình Định": "Bình Định",
    "Bình Dương": "Bình Dương",
    "Bình Phước": "Bình Phước",
    "Bình Thuận": "Bình Thuận",
    "Cà Mau": "Cà Mau",
    "Cao Bằng": "Cao Bằng",
    "Đắk Lắk": "Đắk Lắk",
    "Đắk Nông": "Đắk Nông",
    "Điện Biên": "Điện Biên",
    "Đồng Nai": "Đồng Nai",
    "Đồng Tháp": "Đồng Tháp",
    "Gia Lai": "Gia Lai",
    "Hà Giang": "Hà Giang",
    "Hà Nam": "Hà Nam",
    "Hà Tĩnh": "Hà Tĩnh",
    "Hải Dương": "Hải Dương",
    "Hậu Giang": "Hậu Giang",
    "Hòa Bình": "Hòa Bình",
    "Hưng Yên": "Hưng Yên",
    "Khánh Hòa": "Khánh Hòa",
    "Kiên Giang": "Kiên Giang",
    "Kon Tum": "Kon Tum",
    "Lai Châu": "Lai Châu",
    "Lâm Đồng": "Lâm Đồng",
    "Lạng Sơn": "Lạng Sơn",
    "Lào Cai": "Lào Cai",
    "Long An": "Long An",
    "Nam Định": "Nam Định",
    "Nghệ An": "Nghệ An",
    "Ninh Bình": "Ninh Bình",
    "Ninh Thuận": "Ninh Thuận",
    "Phú Thọ": "Phú Thọ",
    "Quảng Bình": "Quảng Bình",
    "Quảng Nam": "Quảng Nam",
    "Quảng Ngãi": "Quảng Ngãi",
    "Quảng Ninh": "Quảng Ninh",
    "Quảng Trị": "Quảng Trị",
    "Sóc Trăng": "Sóc Trăng",
    "Sơn La": "Sơn La",
    "Tây Ninh": "Tây Ninh",
    "Thái Bình": "Thái Bình",
    "Thái Nguyên": "Thái Nguyên",
    "Thanh Hóa": "Thanh Hóa",
    "Thừa Thiên Huế": "Thừa Thiên Huế",
    "Tiền Giang": "Tiền Giang",
    "Trà Vinh": "Trà Vinh",
    "Tuyên Quang": "Tuyên Quang",
    "Vĩnh Long": "Vĩnh Long",
    "Vĩnh Phúc": "Vĩnh Phúc",
    "Yên Bái": "Yên Bái"
  },

  // 日期时间
  datetime: {
    today: "Hôm nay",
    yesterday: "Hôm qua", 
    tomorrow: "Ngày mai",
    days: ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
    months: [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
      "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", 
      "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ]
  }
}; 