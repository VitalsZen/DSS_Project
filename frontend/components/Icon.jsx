// frontend/components/Icon.jsx
import React from "react";

// Định nghĩa các tên thay thế (Alias)
const ICON_MAPPING = {
  "loader": "sync",      // Gõ 'loader' tự chuyển thành 'sync'
  "spinner": "autorenew" // Dự phòng thêm
};

export const Icon = ({ name, className = "", fill = false }) => {
  // Lấy tên icon chuẩn từ mapping, nếu không có thì dùng tên gốc
  const finalName = ICON_MAPPING[name] || name;

  return (
    <span
      className={`material-symbols-outlined transition-all duration-300 ease-in-out ${className}`}
      style={{ 
        fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
        // Giúp icon không bị giật layout khi đổi
        display: "inline-block", 
        verticalAlign: "middle" 
      }}
    >
      {finalName}
    </span>
  );
};