import liff from "@line/liff";

export default {
  checkLogin: async (Fn) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อน"); // Please login first
      return false;
    }
    Fn && Fn();
    return true;
  },
  openPhone: (tel) => {
    console.log(tel, "tel");
    // Use LIFF to open external link with tel protocol
    if (liff.isInClient()) {
      liff.openWindow({
        url: `tel:${tel}`,
        external: true
      });
    } else {
      window.location.href = `tel:${tel}`;
    }
  },
  copy: (text) => {
    // Use Clipboard API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert("คัดลอกแล้ว"); // Copied
      }).catch(err => {
        console.error("Copy failed:", err);
      });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert("คัดลอกแล้ว"); // Copied
    }
  },
  isEmpty: (object) => {
    return Object.keys(object).length === 0;
  },
  // Set page title - LINE LIFF doesn't support this, so we just update document title
  setBarPageView: (title) => {
    document.title = title;
  },
  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },
};
