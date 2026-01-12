import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./Index.scss";

/**
 * ImageUploader Component - LINE Theme
 * 支持多图上传、自动压缩、预览和删除
 */

const ImageUploader = ({
  maxImages = 3,
  maxSize = 5 * 1024 * 1024, // 5MB
  quality = 0.8,
  maxWidth = 1920,
  value = [],
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  /**
   * 压缩图片
   */
  const compressImage = (file, quality, maxWidth) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // 按比例缩放
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // 转换为 Blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Image compression failed"));
              }
            },
            "image/jpeg",
            quality
          );
        };

        img.onerror = () => reject(new Error("Image load failed"));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  };

  /**
   * 处理文件选择
   */
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // 检查数量限制
    if (value.length + files.length > maxImages) {
      alert(t("image_uploader.max_images_error", `สามารถอัปโหลดได้สูงสุด ${maxImages} รูป`));
      return;
    }

    setUploading(true);

    try {
      const processedFiles = [];

      for (const file of files) {
        // 检查文件类型
        if (!file.type.startsWith("image/")) {
          alert(t("image_uploader.invalid_type", "กรุณาเลือกไฟล์รูปภาพ"));
          continue;
        }

        // 检查文件大小
        if (file.size > maxSize) {
          alert(
            t(
              "image_uploader.file_too_large",
              `ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (สูงสุด ${maxSize / 1024 / 1024}MB)`
            )
          );
          continue;
        }

        // 压缩图片
        const compressedFile = await compressImage(file, quality, maxWidth);
        
        // 生成预览 URL
        const previewUrl = URL.createObjectURL(compressedFile);
        
        processedFiles.push({
          file: compressedFile,
          preview: previewUrl,
          name: file.name,
        });
      }

      // 更新值
      onChange([...value, ...processedFiles]);
    } catch (error) {
      console.error("Image upload error:", error);
      alert(t("image_uploader.upload_error", "อัปโหลดรูปภาพล้มเหลว"));
    } finally {
      setUploading(false);
      // 重置 input
      e.target.value = "";
    }
  };

  /**
   * 删除图片
   */
  const handleRemove = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    
    // 释放 URL
    if (value[index]?.preview) {
      URL.revokeObjectURL(value[index].preview);
    }
    
    onChange(newValue);
  };

  return (
    <div className="image-uploader">
      {/* 图片预览网格 */}
      <div className="image-grid">
        {value.map((item, index) => (
          <div key={index} className="image-item">
            <img src={item.preview} alt={item.name} className="image-preview" />
            
            {/* 删除按钮 */}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="remove-btn"
                aria-label={t("common.delete", "ลบ")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* 上传按钮 */}
        {value.length < maxImages && !disabled && (
          <label className={`upload-btn ${uploading ? "uploading" : ""}`}>
            {uploading ? (
              <div className="loading-spinner">
                <svg className="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <>
                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="upload-text">
                  {t("image_uploader.add_image", "เพิ่มรูปภาพ")}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* 提示文本 */}
      <div className="upload-hint">
        {t(
          "image_uploader.hint",
          `สามารถอัปโหลดได้สูงสุด ${maxImages} รูป (${value.length}/${maxImages})`
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
