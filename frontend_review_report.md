# Code review
Found 3 urgent issues need to be fixed:

## 1 Conditional class names use template literals
FilePath: d:\2025profile\zalo_mini_app-master\src\pages\Home\Index.jsx line 344-347
```javascript
className={`h-2 rounded-full transition-all ${
  idx === currentBanner 
    ? 'w-8 bg-white' 
    : 'w-2 bg-white/50'
}`}
```


### Suggested fix
Use `classNames` utility for conditional styling.
```javascript
import classNames from "classnames";
// ...
className={classNames("h-2 rounded-full transition-all", {
  "w-8 bg-white": idx === currentBanner,
  "w-2 bg-white/50": idx !== currentBanner
})}
```

## 2 Constant data recreated on every render
FilePath: d:\2025profile\zalo_mini_app-master\src\pages\Home\Index.jsx line 171
```javascript
const navData = [
  {
    id: 0,
// ...
```


### Suggested fix
Move `navData` outside the component or wrap in `useMemo` to prevent recreation on every render (which happens every 5s due to banner rotation).

## 3 String concatenation for classes
FilePath: d:\2025profile\zalo_mini_app-master\src\pages\Home\Index.jsx line 82
```javascript
className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient}
                flex items-center justify-center overflow-hidden
                shadow-lg group-hover:shadow-xl group-hover:scale-105
                group-active:scale-95 transition-all duration-200`}
```


### Suggested fix
Use `classNames` to safely combine static classes with dynamic props.
```javascript
className={classNames(
  "relative w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-105 group-active:scale-95 transition-all duration-200",
  gradient
)}
```

---

Found 2 suggestions for improvement:

## 1 Unused SCSS file
FilePath: d:\2025profile\zalo_mini_app-master\src\pages\Home\Index.jsx line 19
```javascript
import "./Index.scss";
```


### Suggested fix
The component uses Tailwind exclusively. `Index.scss` appears unused and should be removed.

## 2 De-duplicate logic in Render
FilePath: d:\2025profile\zalo_mini_app-master\src\pages\Home\Index.jsx line 431
```javascript
{(() => {
  const chineseNumbers = { ... };
  // ...
})()}
```


### Suggested fix
Reuse the existing `convertNumberToChinese` function or move this logic to a helper/hook to avoid re-defining the map inside the render loop.

---

Would you like me to use the Suggested fix section to address these issues?
