# 📺 NewTube — YouTube Clone

Một bản clone YouTube hiện đại được xây dựng bằng **Next.js 15 & React 19**, kết hợp tRPC, Drizzle ORM và nhiều dịch vụ đám mây, mang lại trải nghiệm xem & chia sẻ video gần giống YouTube thật.

---

## ✨ Tính Năng Chính

### 🎥 Video
- Upload video trực tiếp lên **Mux** và xử lý HLS tự động
- Trình phát video nâng cao với nhiều tùy chọn tốc độ phát lại, vòng lặp, tự động phát tiếp
- Hỗ trợ **YouTube Shorts** — phát dọc (9:16), tự động phát, cuộn liền mạch
- Tạo **thumbnail** thủ công hoặc sinh tự động bằng AI (Replicate)
- Tạo **tiêu đề & mô tả** tự động bằng AI (OpenRouter)
- **Phiên âm (transcript)** video tự động qua Mux Audio Track
- Đặt **chế độ hiển thị**: Công khai / Riêng tư
- Tải video xuống (Download)
- Lưu **tiến độ xem** (progress bar) theo từng người dùng
- Theo dõi **lịch sử xem** và toggle bật/tắt tracking

### 📊 Creator Studio
- **Dashboard** tổng quan kênh: tổng lượt xem, lượt thích, bình luận, tỷ lệ xem trung bình
- **Danh sách video** với bảng quản lý (tiêu đề, trạng thái, lượt xem, ngày tạo)
- **Chỉnh sửa video**: tiêu đề, mô tả, danh mục, thumbnail, visibility
- Hiển thị **người đăng ký gần đây** và **bình luận mới nhất** ngay trên dashboard
- Upload video qua modal với uploader tích hợp Mux

### 🗂️ Playlist
- Tạo, chỉnh sửa, xoá playlist (công khai / riêng tư)
- Thêm / xoá video khỏi playlist
- Xem playlist riêng tư của mình (`/playlists`)
- Trang chi tiết playlist với danh sách video
- Hỗ trợ **Watch Later** và **Liked Videos** dưới dạng playlist đặc biệt (mix playlist)

### 🏠 Trang Chủ & Feed
- **Home feed** — video được đề xuất theo danh mục
- **Trending feed** — video đang thịnh hành
- **Subscribed feed** — video từ các kênh đã đăng ký
- **Shorts feed** — chỉ hiển thị video dạng Shorts (9:16)
- Bộ lọc danh mục (category carousel) trên trang chủ

### 🔍 Tìm Kiếm
- Tìm kiếm video theo từ khoá
- Lịch sử tìm kiếm lưu cục bộ (localStorage) với dropdown gợi ý
- Lọc kết quả theo **loại** (video / kênh) và **thứ tự sắp xếp**

### 💬 Bình Luận
- Đăng bình luận cho **video** và **bài đăng cộng đồng**
- **Trả lời** (reply) bình luận theo thread
- **Like / Dislike** bình luận
- Creator có thể **Heart** (yêu thích) bình luận
- Creator có thể **Ghim (pin)** bình luận lên đầu
- **Xoá** bình luận của chính mình

### 👤 Trang Người Dùng / Kênh
- Trang kênh công khai (`/users/[userId]`) hiển thị video, Shorts và bài đăng
- Cập nhật avatar, ảnh banner kênh, tiểu sử (bio)
- **Đăng ký / Huỷ đăng ký** kênh
- Nút Subscribe ẩn khi là chủ kênh (cả trên video & Shorts)

### 📝 Cộng Đồng (Community Posts)
- Tạo bài đăng dạng **văn bản, hình ảnh, thăm dò ý kiến (poll), quiz**
- **Lên lịch đăng** (scheduled posts) — bài chỉ xuất hiện sau thời điểm đặt
- **Like / Dislike** bài đăng
- Chỉnh sửa và xoá bài đăng (chỉ hiện với chủ kênh)
- **Quiz**: đánh dấu đáp án đúng (tick xanh), thêm giải thích, hiện tỷ lệ chọn
- Bình luận cho bài đăng cộng đồng (cùng hệ thống với bình luận video)

### 🔐 Xác Thực
- Đăng nhập / Đăng ký qua **Clerk** (hỗ trợ Social Login)
- Webhook đồng bộ user từ Clerk vào database (Svix)
- Bảo vệ route bằng middleware Clerk

### ⚡ Hiệu Suất & Kỹ Thuật
- **Rate limiting** với Upstash Redis
- **Upstash Workflow** cho tác vụ nền bất đồng bộ (AI generation)
- **Infinite scroll** với TanStack Query (cursor-based pagination)
- **tRPC** cho API type-safe từ server đến client
- Animations & micro-interactions với Tailwind + CSS

---

## 🛠 Công Nghệ Sử Dụng

| Lớp | Công nghệ |
|---|---|
| **Frontend** | Next.js 15, React 19, TailwindCSS, ShadcnUI, Radix UI |
| **Backend / API** | tRPC 11, Node.js, Drizzle ORM |
| **Database** | PostgreSQL (NeonDB serverless) |
| **Xác thực** | Clerk + Svix Webhook |
| **Xử lý video** | Mux (upload, HLS, transcript) |
| **AI** | OpenRouter API (tiêu đề/mô tả), Replicate (thumbnail) |
| **Cache / Queue** | Upstash Redis + Upstash Workflow (QStash) |
| **Upload file** | UploadThing (ảnh thumbnail, banner, ảnh bài đăng) |
| **Routing** | Next.js App Router |
| **Form / Validation** | React Hook Form + Zod |

---

## 📋 Yêu Cầu Trước Khi Chạy

- Node.js 18+ hoặc Bun 1.0+
- Tài khoản **NeonDB** (PostgreSQL)
- Tài khoản **Mux** để xử lý video
- Tài khoản **Clerk** để xác thực
- Tài khoản **Upstash** (Redis + QStash Workflow)
- Tài khoản **UploadThing** để upload ảnh
- **OpenRouter API Key** cho tính năng AI (tiêu đề/mô tả)
- **Replicate API Key** cho AI sinh thumbnail
- **ngrok** (tuỳ chọn) để nhận Mux webhook khi phát triển cục bộ

---

## ⚙️ Hướng Dẫn Cài Đặt

### 1. Clone & Cài Dependencies

```bash
# Dùng Bun (khuyến nghị)
bun install

# Hoặc npm
npm install
```

### 2. Cấu Hình Biến Môi Trường

Tạo file `.env` tại thư mục gốc:

```env
# Database
DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>/<DB_NAME>?sslmode=require

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<CLERK_PUBLISHABLE_KEY>
CLERK_SECRET_KEY=<CLERK_SECRET_KEY>

# Mux (Video Processing)
MUX_TOKEN_ID=<MUX_TOKEN_ID>
MUX_TOKEN_SECRET=<MUX_TOKEN_SECRET>
MUX_WEBHOOK_SECRET=<MUX_WEBHOOK_SECRET>

# OpenRouter (AI — tiêu đề, mô tả)
OPENROUTER_API_KEY=<OPENROUTER_API_KEY>
OPENROUTER_API_BASE=https://openrouter.ai/api/v1

# Upstash (Redis & Workflows)
UPSTASH_REDIS_REST_URL=<UPSTASH_REDIS_REST_URL>
UPSTASH_REDIS_REST_TOKEN=<UPSTASH_REDIS_REST_TOKEN>
UPSTASH_WORKFLOW_URL=<UPSTASH_WORKFLOW_URL>
QSTASH_TOKEN=<QSTASH_TOKEN>

# Replicate (AI thumbnail)
REPLICATE_API_KEY=<REPLICATE_API_KEY>

# UploadThing (Upload ảnh)
UPLOADTHING_TOKEN=<UPLOADTHING_TOKEN>
```

### 3. Migrate & Seed Database

```bash
# Push schema lên database
bun drizzle-kit push

# Seed danh mục video
bun run src/scripts/seed-categories.ts
# Hoặc dùng tsx:
tsx src/scripts/seed-categories.ts
```

### 4. Chạy Project

```bash
# Chạy cả dev server + ngrok webhook (khuyến nghị)
bun run dev:all

# Chỉ chạy dev server
bun run dev
# hoặc
npm run dev
```

> **Lưu ý**: `dev:all` sẽ khởi động đồng thời Next.js dev server và ngrok tunnel để nhận Mux webhook. Đảm bảo bạn đã cấu hình URL ngrok đúng trong `package.json`.

---

## 📁 Cấu Trúc Thư Mục

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Trang đăng nhập / đăng ký
│   ├── (home)/             # Trang chủ, feed, tìm kiếm, playlist, user
│   │   ├── feed/           # Trending, Subscribed, Shorts feeds
│   │   ├── playlists/      # Quản lý playlist
│   │   ├── search/         # Trang tìm kiếm
│   │   ├── users/          # Trang kênh người dùng
│   │   └── videos/         # Trang xem video
│   ├── (studio)/           # Creator Studio (dashboard, quản lý video)
│   └── api/                # API routes (tRPC, Mux webhook, UploadThing...)
├── db/
│   └── schema.ts           # Drizzle ORM schema (toàn bộ bảng CSDL)
├── modules/                # Logic theo feature
│   ├── videos/             # Upload, player, reactions, views
│   ├── studio/             # Dashboard, form chỉnh sửa video
│   ├── comments/           # Bình luận (video & bài đăng)
│   ├── comment-reactions/  # Like/Dislike bình luận
│   ├── posts/              # Community posts (text, image, poll, quiz)
│   ├── playlists/          # Playlist CRUD
│   ├── subscriptions/      # Đăng ký kênh
│   ├── users/              # Trang kênh người dùng
│   ├── home/               # Home feed sections
│   ├── search/             # Tìm kiếm
│   └── suggestions/        # Video gợi ý
├── components/             # Shared UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities (uploadthing, mux, openrouter...)
└── trpc/                   # tRPC router & client setup
```

---

## 📚 Tài Nguyên Tham Khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [tRPC](https://trpc.io)
- [Mux Video](https://mux.com)
- [Clerk Auth](https://clerk.com)
- [UploadThing](https://uploadthing.com)
- [Upstash](https://upstash.com)
- [ShadcnUI](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [OpenRouter](https://openrouter.ai)
- [Replicate](https://replicate.com)

---
