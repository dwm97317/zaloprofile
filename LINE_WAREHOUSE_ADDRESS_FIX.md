# LINE Warehouse Address Fix - Complete Solution

## Problem
After successful LINE login, the homepage displayed "กรุณาเข้าสู่ระบบเพื่อดูที่อยู่คลังสินค้า" (Please login to view warehouse address) instead of showing the warehouse information with copy buttons.

## Root Cause
The homepage component (`src/pages/Home/Index.jsx`) was checking login status using:
```javascript
if (token && user?.user_id)
```

The issue was that `user` comes from Recoil state, which was **never populated** after LINE login. Even though:
- ✅ Token was correctly saved to localStorage
- ✅ UserId was correctly saved to localStorage  
- ✅ Backend API worked correctly

The Recoil `userState` remained empty, causing the condition to fail and preventing the warehouse data fetch.

## Solution
Changed the login check to read directly from localStorage instead of relying on Recoil state:

```javascript
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
if (token && userId) {
  // Fetch warehouse data
}
```

This matches the pattern used in the Mine page (`src/pages/Mine/Index.jsx`), which successfully checks login status.

## Changes Made

### File: `src/pages/Home/Index.jsx`

**Before:**
```javascript
const checkLoginAndFetchWarehouse = async () => {
  const token = localStorage.getItem('token');
  if (token && user?.user_id) {  // ❌ user?.user_id is undefined
    setIsLoggedIn(true);
    try {
      const res = await request.get("page/getStorageFirst&wxapp_id=10001");
      if (res.data) {
        setWarehouse(res.data);
      }
    } catch (err) {
      console.error("Warehouse fetch error:", err);
    }
  } else {
    setIsLoggedIn(false);
  }
};
```

**After:**
```javascript
const checkLoginAndFetchWarehouse = async () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');  // ✅ Read from localStorage
  console.log("🔍 Checking login status - token:", token ? "exists" : "missing", "userId:", userId);
  
  if (token && userId) {  // ✅ Both from localStorage
    setIsLoggedIn(true);
    console.log("✅ User is logged in, fetching warehouse...");
    try {
      const res = await request.get("page/getStorageFirst&wxapp_id=10001");
      console.log("📦 Warehouse API response:", res);
      if (res.data) {
        setWarehouse(res.data);
        console.log("✅ Warehouse data set:", res.data);
      }
    } catch (err) {
      console.error("❌ Warehouse fetch error:", err);
    }
  } else {
    setIsLoggedIn(false);
    console.log("❌ User not logged in");
  }
};
```

Also updated the useEffect dependency array:
```javascript
// Before
}, [user]);

// After  
}, []); // Remove user dependency since we check localStorage directly
```

## Testing Results (Playwright Firefox)

### Console Logs:
```
✅ LINE login successful
   User: TLLCARGO ไทย-ลาว
   Token: 1acd34602ef2cf199ea3...
   Token saved to localStorage

🔍 Checking login status - token: exists userId: 31966
✅ User is logged in, fetching warehouse...
📦 Warehouse API response: {code: 1, msg: success, data: Object}
✅ Warehouse data set: {shop_id: 167, shop_name: 武汉, ...}
```

### Visual Verification:
✅ Warehouse information displayed correctly:
- Name: (displayed)
- Phone: 18989898989
- Address: ggg室室
- Postal Code: (displayed)

✅ Two copy buttons working:
- "คัดลอกที่อยู่ทางบก" (Copy land address)
- "คัดลอกที่อยู่ทางเรือ" (Copy sea address)

### API Call Verification:
✅ Request sent: `GET page/getStorageFirst&wxapp_id=10001&token=...`
✅ Response received: `{code: 1, msg: "success", data: {...}}`

## Why This Fix Works

1. **localStorage is persistent**: Values saved during LINE login remain available across page loads and component renders
2. **No dependency on Recoil state**: We don't need to wait for or manage Recoil state updates
3. **Consistent with Mine page**: Uses the same pattern as the working Mine page component
4. **Immediate availability**: localStorage values are synchronously available, no async state updates needed

## Related Files
- `src/pages/Home/Index.jsx` - Homepage component (fixed)
- `src/utils/liff.js` - LINE login flow (saves token and userId to localStorage)
- `src/pages/Mine/Index.jsx` - Reference implementation (already using localStorage correctly)
- `src/state.js` - Recoil state definitions (userState not populated after login)

## Date
January 13, 2026
