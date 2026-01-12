# 包裹层级管理API接口设计文档

## 概述

本文档定义了包裹层级管理系统的所有API接口，包括包(Box)、箱(Container)、托盘(Pallet)的管理接口。

## 基础信息

- **基础URL**: `https://zalonew.itaoth.com/index.php?s=`
- **认证方式**: Token认证
- **数据格式**: JSON
- **字符编码**: UTF-8

## 1. 包(Box)管理接口

### 1.1 创建包
**接口地址**: `POST /api/useropration/createBox`
**权限要求**: 包装操作员(角色ID: 7)

**请求参数**:
```json
{
    "package_ids": [1, 2, 3],
    "box_name": "BOX001",
    "max_weight": 10.00,
    "max_volume": 50.00,
    "remark": "备注信息",
    "wxapp_id": "10001"
}
```

**响应示例**:
```json
{
    "code": 1,
    "msg": "创建成功",
    "data": {
        "box_id": 1,
        "box_code": "BOX202401150001",
        "box_name": "BOX001",
        "package_count": 3,
        "total_weight": 4.5,
        "status": 1
    }
}
```

### 1.2 包裹装包
**接口地址**: `POST /api/useropration/packageToBox`
**权限要求**: 包装操作员(角色ID: 7)

**请求参数**:
```json
{
    "package_id": 1,
    "box_id": 1,
    "wxapp_id": "10001"
}
```

**响应示例**:
```json
{
    "code": 1,
    "msg": "装包成功",
    "data": {
        "package_id": 1,
        "box_id": 1,
        "new_status": 5
    }
}
```

### 1.3 包列表查询
**接口地址**: `POST /api/useropration/boxList`
**权限要求**: 包装操作员(角色ID: 7)

**请求参数**:
```json
{
    "status": [1, 2],
    "keyword": "BOX001",
    "page": 1,
    "limit": 20,
    "wxapp_id": "10001"
}
```

**响应示例**:
```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "list": [
            {
                "box_id": 1,
                "box_code": "BOX202401150001",
                "box_name": "BOX001",
                "package_count": 3,
                "total_weight": 4.5,
                "status": 1,
                "status_text": "待装箱",
                "operator_name": "张三",
                "created_time": "2024-01-15 14:30:00"
            }
        ],
        "total": 1,
        "page": 1,
        "limit": 20
    }
}
```

### 1.4 包详情查询
**接口地址**: `POST /api/useropration/boxDetail`
**权限要求**: 包装操作员(角色ID: 7)

**请求参数**:
```json
{
    "box_id": 1,
    "wxapp_id": "10001"
}
```

**响应示例**:
```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "box_id": 1,
        "box_code": "BOX202401150001",
        "box_name": "BOX001",
        "container_id": 0,
        "package_count": 3,
        "total_weight": 4.5,
        "total_volume": 15.0,
        "max_weight": 10.0,
        "max_volume": 50.0,
        "status": 1,
        "status_text": "待装箱",
        "operator_name": "张三",
        "packages": [
            {
                "id": 1,
                "express_num": "YT1234567890",
                "weight": 1.5,
                "status": 5,
                "status_text": "已装包"
            }
        ]
    }
}
```

## 2. 箱(Container)管理接口

### 2.1 创建箱
**接口地址**: `POST /api/useropration/createContainer`
**权限要求**: 装箱操作员(角色ID: 8)

**请求参数**:
```json
{
    "box_ids": [1, 2, 3],
    "container_name": "CTN001",
    "max_weight": 50.00,
    "max_volume": 100.00,
    "container_type": 1,
    "remark": "备注信息",
    "wxapp_id": "10001"
}
```

**响应示例**:
```json
{
    "code": 1,
    "msg": "创建成功",
    "data": {
        "container_id": 1,
        "container_code": "CTN202401150001",
        "container_name": "CTN001",
        "box_count": 3,
        "package_count": 9,
        "total_weight": 13.5,
        "status": 1
    }
}
```

### 2.2 包装箱
**接口地址**: `POST /api/useropration/boxToContainer`
**权限要求**: 装箱操作员(角色ID: 8)

**请求参数**:
```json
{
    "box_id": 1,
    "container_id": 1,
    "wxapp_id": "10001"
}
```

**响应示例**:
```json
{
    "code": 1,
    "msg": "装箱成功",
    "data": {
        "box_id": 1,
        "container_id": 1,
        "new_status": 2
    }
}
```

### 2.3 箱列表查询
**接口地址**: `POST /api/useropration/containerList`
**权限要求**: 装箱操作员(角色ID: 8)

**请求参数**:
```json
{
    "status": [1, 2],
    "keyword": "CTN001",
    "page": 1,
    "limit": 20,
    "wxapp_id": "10001"
}
```

### 2.4 箱详情查询
**接口地址**: `POST /api/useropration/containerDetail`
**权限要求**: 装箱操作员(角色ID: 8)

**请求参数**:
```json
{
    "container_id": 1,
    "wxapp_id": "10001"
}
```

## 3. 托盘(Pallet)管理接口

### 3.1 创建托盘
**接口地址**: `POST /api/useropration/createPallet`
**权限要求**: 托盘操作员(角色ID: 9)

**请求参数**:
```json
{
    "container_ids": [1, 2, 3],
    "pallet_name": "PLT001",
    "max_weight": 1000.00,
    "max_volume": 2000.00,
    "pallet_type": 1,
    "remark": "备注信息",
    "wxapp_id": "10001"
}
```

**响应示例**:
```json
{
    "code": 1,
    "msg": "创建成功",
    "data": {
        "pallet_id": 1,
        "pallet_code": "PLT202401150001",
        "pallet_name": "PLT001",
        "container_count": 3,
        "box_count": 9,
        "package_count": 27,
        "total_weight": 40.5,
        "status": 1
    }
}
```

### 3.2 箱装托盘
**接口地址**: `POST /api/useropration/containerToPallet`
**权限要求**: 托盘操作员(角色ID: 9)

**请求参数**:
```json
{
    "container_id": 1,
    "pallet_id": 1,
    "wxapp_id": "10001"
}
```

### 3.3 托盘列表查询
**接口地址**: `POST /api/useropration/palletList`
**权限要求**: 托盘操作员(角色ID: 9)

### 3.4 托盘详情查询
**接口地址**: `POST /api/useropration/palletDetail`
**权限要求**: 托盘操作员(角色ID: 9)

## 4. 批次管理接口(扩展现有)

### 4.1 托盘加入批次
**接口地址**: `POST /api/useropration/palletToBatch`
**权限要求**: 批次管理员

**请求参数**:
```json
{
    "pallet_id": 1,
    "batch_id": 1,
    "wxapp_id": "10001"
}
```

### 4.2 批次托盘列表
**接口地址**: `POST /api/useropration/batchPalletList`
**权限要求**: 批次管理员

## 5. 层级查询接口

### 5.1 包裹层级追踪
**接口地址**: `POST /api/useropration/packageHierarchy`
**权限要求**: 所有仓管角色

**请求参数**:
```json
{
    "package_id": 1,
    "wxapp_id": "10001"
}
```

**响应示例**:
```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "package": {
            "id": 1,
            "express_num": "YT1234567890",
            "status": 6,
            "status_text": "已装箱"
        },
        "box": {
            "box_id": 1,
            "box_code": "BOX202401150001",
            "box_name": "BOX001",
            "status": 2,
            "status_text": "已装箱"
        },
        "container": {
            "container_id": 1,
            "container_code": "CTN202401150001",
            "container_name": "CTN001",
            "status": 2,
            "status_text": "已装托盘"
        },
        "pallet": {
            "pallet_id": 1,
            "pallet_code": "PLT202401150001",
            "pallet_name": "PLT001",
            "status": 2,
            "status_text": "已装批次"
        },
        "batch": {
            "batch_id": 1,
            "batch_name": "BATCH001",
            "status": 1,
            "status_text": "已发货"
        }
    }
}
```

### 5.2 扫码识别层级
**接口地址**: `POST /api/useropration/scanHierarchy`
**权限要求**: 所有仓管角色

**请求参数**:
```json
{
    "code": "BOX202401150001",
    "wxapp_id": "10001"
}
```

**响应示例**:
```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "type": "box",
        "id": 1,
        "code": "BOX202401150001",
        "name": "BOX001",
        "status": 1,
        "status_text": "待装箱",
        "details": {
            "package_count": 3,
            "total_weight": 4.5,
            "operator_name": "张三"
        }
    }
}
```

## 6. 统计报表接口

### 6.1 层级统计数据
**接口地址**: `POST /api/useropration/hierarchyStats`
**权限要求**: 所有仓管角色

**请求参数**:
```json
{
    "date_range": ["2024-01-01", "2024-01-31"],
    "wxapp_id": "10001"
}
```

**响应示例**:
```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "summary": {
            "total_packages": 1000,
            "total_boxes": 100,
            "total_containers": 20,
            "total_pallets": 5,
            "total_batches": 2
        },
        "status_distribution": {
            "packages": {
                "待装包": 50,
                "已装包": 200,
                "已装箱": 300,
                "已装托盘": 250,
                "已加入批次": 200
            },
            "boxes": {
                "待装箱": 10,
                "已装箱": 60,
                "已发货": 30
            }
        },
        "efficiency": {
            "avg_packages_per_box": 10,
            "avg_boxes_per_container": 5,
            "avg_containers_per_pallet": 4,
            "avg_pallets_per_batch": 2.5
        }
    }
}
```

## 7. 错误码定义

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 40001 | 角色权限非法 | 用户角色权限不足 |
| 40002 | 包裹状态错误 | 包裹当前状态不允许此操作 |
| 40003 | 容量超限 | 超出最大承重或体积限制 |
| 40004 | 包裹已装包 | 包裹已经装入其他包中 |
| 40005 | 包已装箱 | 包已经装入其他箱中 |
| 40006 | 箱已装托盘 | 箱已经装入其他托盘中 |
| 40007 | 托盘已加入批次 | 托盘已经加入其他批次 |
| 40008 | 编码已存在 | 编码重复 |
| 40009 | 数据不存在 | 查询的数据不存在 |
| 50001 | 系统错误 | 服务器内部错误 |

## 8. 状态码定义

### 包裹状态
| 状态码 | 状态名称 | 描述 |
|--------|----------|------|
| 1 | 未入库 | 包裹已预报但未到达仓库 |
| 2 | 已入库 | 包裹已到达仓库并完成入库 |
| 3 | 已拣货上架 | 包裹已分拣并上架到货架 |
| 4 | 待打包 | 包裹等待打包 |
| 5 | 已装包 | 包裹已装入包中 |
| 6 | 已装箱 | 包裹已装入箱中 |
| 7 | 已装托盘 | 包裹已装入托盘 |
| 8 | 已加入批次 | 包裹已加入批次 |
| 9 | 已发货 | 包裹已发出 |
| 10 | 已收货 | 用户已签收包裹 |
| 11 | 已完成 | 订单完成 |

### 包状态
| 状态码 | 状态名称 | 描述 |
|--------|----------|------|
| 1 | 待装箱 | 包等待装入箱中 |
| 2 | 已装箱 | 包已装入箱中 |
| 3 | 已发货 | 包已发货 |

### 箱状态
| 状态码 | 状态名称 | 描述 |
|--------|----------|------|
| 1 | 待装托盘 | 箱等待装入托盘 |
| 2 | 已装托盘 | 箱已装入托盘 |
| 3 | 已发货 | 箱已发货 |

### 托盘状态
| 状态码 | 状态名称 | 描述 |
|--------|----------|------|
| 1 | 待装批次 | 托盘等待加入批次 |
| 2 | 已装批次 | 托盘已加入批次 |
| 3 | 运输中 | 托盘运输中 |
| 4 | 已到达 | 托盘已到达目的地 |

## 9. 接口调用示例

### 完整装包流程示例
```javascript
// 1. 员工登录
const loginResponse = await fetch('/api/user/clerklogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        mobile: '0123456789',
        password: '123456',
        wxapp_id: '10001'
    })
});

const { token } = loginResponse.data;

// 2. 创建包
const createBoxResponse = await fetch('/api/useropration/createBox', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'token': token
    },
    body: JSON.stringify({
        package_ids: [1, 2, 3],
        box_name: 'BOX001',
        wxapp_id: '10001'
    })
});

const { box_id } = createBoxResponse.data;

// 3. 查看包详情
const boxDetailResponse = await fetch('/api/useropration/boxDetail', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'token': token
    },
    body: JSON.stringify({
        box_id: box_id,
        wxapp_id: '10001'
    })
});
```

---

**文档版本**: v1.0  
**最后更新**: 2024-01-15  
**维护人员**: 开发团队
