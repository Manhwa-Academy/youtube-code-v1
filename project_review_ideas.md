

## ⚠️ Điểm Cần Cải Thiện

### 5. CSS & Styling
- `globals.css` có `body { user-select: none }` → chặn user select text trên toàn trang
- `font-family: Arial` override font Inter đã import từ Google Fonts
- Duplicate `@layer base { * { @apply border-border; } }`

---

## 💡 Ý Tưởng Phát Triển

### 🟡 Ưu tiên trung bình — Nên làm trong 1-2 tháng

#### 6. Hệ Thống Live Streaming
- Tích hợp Mux Live
- Chat real-time trong live stream
- Lưu lại VOD sau khi stream kết thúc
- Scheduled live streams

---

### Fix CSS Issues
```diff
// globals.css
- body {
-   font-family: Arial, Helvetica, sans-serif;
- }
+ /* Để Inter font từ layout.tsx hoạt động đúng */

- body {
-   user-select: none;
-   -webkit-user-select: none;
- }
+ /* Chỉ chặn select ở những element cần thiết, không phải toàn bộ body */
```


