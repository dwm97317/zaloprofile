# 🗺️ Google Places API Migration - Final Fix Complete

## ✅ Status: FULLY RESOLVED

**Date**: January 15, 2026  
**Issue**: `InvalidValueError: unknown property languageCode`  
**Root Cause**: New Google Places API doesn't support `languageCode` parameter  
**Solution**: Remove `languageCode` from request object (language set via script URL)

---

## 🐛 The Problem

Console error when using address search:
```
InvalidValueError: unknown property languageCode
at _.Qm (js?key=AIzaSyAFNYbGfacZk_-e4U2HDC-j3uYBVGBDzyk&libraries=places&language=th:1236:123)
```

**Why it happened**: The new Google Places API changed how language is specified:
- ❌ **Old way**: Pass `languageCode: "th"` in request object
- ✅ **New way**: Set language in script URL: `&language=th`

---

## 🔧 The Fix

**File**: `src/components/AddressAutocomplete/index.jsx`

### Before (Broken)
```javascript
const request = {
  input: query,
  includedRegionCodes: ["th"],
  languageCode: "th"  // ❌ NOT supported in new API
};
```

### After (Fixed)
```javascript
const request = {
  input: query,
  includedRegionCodes: ["th"] // Restrict to Thailand
  // Note: languageCode is NOT supported in new API
  // Language is set via API script URL parameter (&language=th)
};
```

---

## 🎯 How Language Works in New API

### Script Loading (in `liff.js`)
```javascript
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=th`;
//                                                                                    ^^^^^^^^^^^
//                                                                    Language set HERE, not in request
```

### API Request (in `AddressAutocomplete`)
```javascript
// ✅ Correct - No languageCode needed
const { suggestions } = await window.google.maps.places.AutocompleteSuggestion
  .fetchAutocompleteSuggestions({
    input: query,
    includedRegionCodes: ["th"]
  });
```

---

## 📊 API Comparison

| Feature | Legacy API | New API |
|---------|-----------|---------|
| **Language Setting** | `languageCode` in request | `&language=th` in script URL |
| **Country Filter** | `componentRestrictions: {country: "th"}` | `includedRegionCodes: ["th"]` |
| **Autocomplete** | `AutocompleteService.getPlacePredictions()` | `AutocompleteSuggestion.fetchAutocompleteSuggestions()` |
| **Place Details** | `PlacesService.getDetails()` | `Place.fetchFields()` |
| **Pattern** | Callback-based | Promise-based (async/await) |

---

## ✅ Verification

### Console Output (Success)
```
✅ Using new Google Places API (AutocompleteSuggestion)
```

### Build Status
```bash
npm run build
✓ 683 modules transformed
✓ built in 5.13s
dist/assets/index-OPAYjOzh.js  992.36 kB │ gzip: 289.73 kB
```

### Test Results
- ✅ Address search works without errors
- ✅ Autocomplete suggestions display correctly
- ✅ Place details fetch successfully
- ✅ Thai language results returned
- ✅ Country restriction to Thailand works

---

## 📝 Implementation Details

### Smart API Detection
```javascript
useEffect(() => {
  if (window.google?.maps?.places) {
    if (window.google.maps.places.AutocompleteSuggestion) {
      console.log('✅ Using new Google Places API');
      setUseNewAPI(true);
    } else {
      console.log('⚠️ Using legacy Google Places API');
      // Initialize legacy services
    }
  }
}, []);
```

### Backward Compatibility
The component supports BOTH APIs:
- **New API**: Uses `AutocompleteSuggestion` + `Place.fetchFields()`
- **Legacy API**: Falls back to `AutocompleteService` + `PlacesService`

---

## 🎨 Affected Components

| Component | Path | Status |
|-----------|------|--------|
| AddressAutocomplete | `src/components/AddressAutocomplete/index.jsx` | ✅ Fixed |
| Create (Simple) | `src/pages/Address/Create.jsx` | ✅ Working |
| CreateWithMap | `src/pages/Address/CreateWithMap.jsx` | ✅ Working |
| InteractiveMapPicker | `src/components/InteractiveMapPicker/index.jsx` | ✅ Working |

---

## 🔑 API Key Configuration

**Current Key**: `AIzaSyAFNYbGfacZk_-e4U2HDC-j3uYBVGBDzyk`

**Enabled APIs**:
- ✅ Maps JavaScript API
- ✅ Places API (New)
- ✅ Geocoding API

**Restrictions**:
- Country: Thailand (TH)
- Language: Thai (th)

---

## 📚 Documentation References

- [Google Places API (New) - Migration Guide](https://developers.google.com/maps/documentation/javascript/place-autocomplete-new)
- [AutocompleteSuggestion Reference](https://developers.google.com/maps/documentation/javascript/reference/place#AutocompleteSuggestion)
- [Place Class Reference](https://developers.google.com/maps/documentation/javascript/reference/place#Place)

---

## 🚀 Next Steps

1. ✅ **DONE**: Remove `languageCode` parameter
2. ✅ **DONE**: Build and verify
3. ✅ **DONE**: Test address search functionality
4. 🎯 **TODO**: Deploy to production
5. 🎯 **TODO**: Monitor for any API errors

---

## 💡 Key Takeaways

1. **New API is different**: Don't assume parameters work the same way
2. **Read the docs**: Google's migration guide is essential
3. **Language via URL**: Script URL parameters > Request parameters
4. **Backward compatibility**: Always support fallback to legacy API
5. **Console logging**: Debug messages help identify which API is active

---

## 🎉 Migration Complete!

The Google Places API migration is now **fully functional** with:
- ✅ New API integration
- ✅ Proper language configuration
- ✅ Country restrictions
- ✅ Backward compatibility
- ✅ Error-free operation
- ✅ Production-ready build

**Status**: Ready for deployment 🚀
