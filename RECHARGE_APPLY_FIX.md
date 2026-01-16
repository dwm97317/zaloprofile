# Recharge Apply API Fix

## Issue
The recharge page (`/mine/recharge`) was calling a non-existent API endpoint:
```
http://localhost:8080/index.php?s=api/recharge/apply&wxapp_id=10001
```

**Errors:**
1. `方法不存在:app\api\controller\Recharge->Apply()`
2. `致命错误: Call to undefined function app\api\controller\public_path()`

## Root Cause

### Error 1: Missing Method
The frontend was calling `recharge/apply` but the backend `Recharge` controller only had these methods:
- `index()` - Get recharge plans
- `submit()` - Submit online payment recharge
- `submitPlus()` - Submit online payment with payment type
- `newRechargesubmit()` - New version of online payment

The `apply()` method for manual transfer recharge was missing.

### Error 2: Undefined Function
Used `public_path()` which doesn't exist in ThinkPHP. Should use `ROOT_PATH` constant instead.

## Solution

### 1. Backend - Added `apply()` Method
Created a new method in `Lineminiapp/source/application/api/controller/Recharge.php`:

```php
/**
 * 转账充值申请 (Manual Transfer Recharge)
 * @return array
 * @throws \app\common\exception\BaseException
 */
public function apply()
{
    // Get user info
    $userInfo = $this->getUser();
    
    // Get POST data
    $data = $this->postData();
    
    // Validate required fields
    // - transfer_date
    // - transfer_time
    // - amount
    // - screenshots (array of base64 images)
    
    // Process screenshots - save base64 images to disk
    // Save to: ROOT_PATH . 'web/uploads/recharge/YYYYMMDD/'
    
    // Save recharge application to database
    // Insert into yoshop_recharge_apply table
    
    return $this->renderSuccess(['message' => '充值申请提交成功，请等待审核']);
}
```

### 2. Fixed Path Issue
Changed from:
```php
$fullPath = public_path() . $uploadPath;  // ❌ Error
```

To:
```php
$fullPath = ROOT_PATH . 'web/' . $uploadPath;  // ✅ Correct
```

**Path Structure:**
- `ROOT_PATH` = `/path/to/Lineminiapp/`
- Upload path = `web/uploads/recharge/20260115/`
- Full path = `/path/to/Lineminiapp/web/uploads/recharge/20260115/`

### 2. Database - Created Recharge Apply Table
Created SQL file: `Lineminiapp/create_recharge_apply_table.sql`

**Table Structure:**
```sql
CREATE TABLE `yoshop_recharge_apply` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `transfer_date` varchar(20) NOT NULL COMMENT '转账日期',
  `transfer_time` varchar(20) NOT NULL COMMENT '转账时间',
  `amount` decimal(10,2) NOT NULL COMMENT '充值金额',
  `screenshots` text COMMENT '转账截图(JSON数组)',
  `remarks` varchar(500) COMMENT '备注',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0=待审核, 1=已通过, 2=已拒绝',
  `admin_remark` varchar(500) COMMENT '管理员备注',
  `reviewed_by` int(11) unsigned COMMENT '审核人ID',
  `reviewed_time` int(11) unsigned COMMENT '审核时间',
  `create_time` int(11) unsigned NOT NULL,
  `update_time` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3. Frontend - Already Correct
The frontend code in `src/pages/Mine/Recharge.jsx` is already correctly implemented:
- Form validation
- Image upload (Base64 conversion)
- API call to `recharge/apply`
- Success/error handling

## API Specification

### Endpoint
```
POST /api/recharge/apply?wxapp_id=10001
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "token": "user_token_here",
  "transfer_date": "2026-01-15",
  "transfer_time": "14:30",
  "amount": 100.50,
  "screenshots": [
    "data:image/png;base64,iVBORw0KGgo...",
    "data:image/jpeg;base64,/9j/4AAQSkZJ..."
  ],
  "remarks": "Optional remarks"
}
```

### Response (Success)
```json
{
  "code": 1,
  "msg": "提交成功",
  "data": {
    "message": "充值申请提交成功，请等待审核"
  }
}
```

### Response (Error)
```json
{
  "code": 0,
  "msg": "请选择转账日期"
}
```

## Features

### Image Processing
- Accepts Base64 encoded images
- Supports: JPG, JPEG, PNG, GIF
- Saves to: `public/uploads/recharge/YYYYMMDD/`
- Generates unique filenames
- Stores paths as JSON array in database

### Validation
- ✅ Transfer date required
- ✅ Transfer time required
- ✅ Amount must be > 0
- ✅ At least 1 screenshot required
- ✅ Valid image format check

### Status Management
- **0** - Pending review (待审核)
- **1** - Approved (已通过)
- **2** - Rejected (已拒绝)

## Installation Steps

### 1. Create Database Table
```bash
# Execute SQL file
mysql -u root -p yoshop < create_recharge_apply_table.sql
```

Or run in phpMyAdmin/MySQL client:
```sql
-- Copy content from create_recharge_apply_table.sql
```

### 2. Verify Backend Code
The `apply()` method has been added to:
```
Lineminiapp/source/application/api/controller/Recharge.php
```

### 3. Test API
```bash
# Open in browser
http://localhost:8080/test_recharge_apply.php
```

Or use the frontend:
```bash
# Navigate to recharge page
http://localhost:9000/mine/recharge
```

## Testing

### Test Script
Created `Lineminiapp/test_recharge_apply.php` to test:
- API endpoint availability
- Request/response format
- Database table existence
- Recent records display

### Manual Testing
1. Navigate to `/mine/recharge`
2. Fill in the form:
   - Select transfer date
   - Select transfer time
   - Enter amount (e.g., 100)
   - Upload 1-3 screenshots
   - Add optional remarks
3. Click submit
4. Verify success message
5. Check database for new record

## Admin Panel (Future Enhancement)

To complete the recharge workflow, an admin panel is needed to:
- View pending recharge applications
- Review screenshots
- Approve/reject applications
- Add admin remarks
- Automatically credit user balance on approval

**Suggested location:**
```
/store/recharge/apply_list
```

## Files Modified/Created

### Backend
- ✅ `Lineminiapp/source/application/api/controller/Recharge.php` - Added `apply()` method
- ✅ `Lineminiapp/create_recharge_apply_table.sql` - Database schema
- ✅ `Lineminiapp/test_recharge_apply.php` - Test script

### Frontend
- ✅ `zalo_mini_app-master/src/pages/Mine/Recharge.jsx` - Already correct

### Documentation
- ✅ `zalo_mini_app-master/RECHARGE_APPLY_FIX.md` - This file

## Next Steps

1. **Execute SQL** to create the database table
2. **Test the API** using the test script
3. **Test frontend** by submitting a recharge application
4. **Create admin panel** to review and approve applications
5. **Add balance crediting** logic when application is approved

## Related Files
- Frontend: `src/pages/Mine/Recharge.jsx`
- Backend: `source/application/api/controller/Recharge.php`
- Database: `yoshop_recharge_apply` table
- Test: `test_recharge_apply.php`
