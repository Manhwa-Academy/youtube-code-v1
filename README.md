# 📺 Hayase Yuuka — YouTube Clone

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
- **Like / Dislike** video
- **Xem video liên quan** (suggestions) bên cạnh trình phát
- Bình luận tại **mốc thời gian** (timestamp comment) trong video
- **Preview thumbnail** khi hover trên thanh tiến trình

### 📊 Creator Studio

#### Dashboard Tổng Quan
- Tổng lượt **xem**, lượt **thích**, lượt **bình luận** kênh
- Danh sách **người đăng ký gần đây**
- **Bình luận mới nhất** ngay trên dashboard
- **Bài đăng mới nhất** của kênh

#### Quản Lý Video
- Bảng quản lý video với cột: tiêu đề, trạng thái, lượt xem, bình luận, lượt thích, ngày tạo
- **Bộ lọc nâng cao**: lọc theo tên, mô tả, số lượt xem, chế độ hiển thị
- **Sắp xếp** theo ngày tăng/giảm dần
- **Chọn hàng loạt** (bulk select) và xóa nhiều video cùng lúc
- **Chỉnh sửa nhanh** tiêu đề & mô tả qua modal
- **Phân trang vô hạn** (infinite scroll) với tuỳ chọn số hàng mỗi trang (10/30/50)
- Xem **Shorts** tách biệt với video thông thường

#### Chỉnh Sửa Video Chi Tiết
- Chỉnh sửa: tiêu đề, mô tả, danh mục, thumbnail, visibility
- Cài đặt **bình luận**: bật/tắt, ai có thể bình luận, sắp xếp bình luận
- Cài đặt **kiểm duyệt bình luận** (4 mức):
  - **Không có** — không giữ lại bình luận nào
  - **Cơ bản** — giữ lại bình luận có thể không phù hợp (chứa link)
  - **Nghiêm ngặt** — mở rộng phạm vi giữ lại để xem xét
  - **Giữ lại tất cả** — mọi bình luận đều chờ phê duyệt
- Tùy chọn **hiển thị số lượt thích**

#### Analytics (Phân Tích)
- Biểu đồ **lượt xem theo thời gian** (7 ngày, 28 ngày, 90 ngày, 365 ngày, tùy chỉnh khoảng ngày)
- Biểu đồ **thời gian xem trung bình** (watch time)
- Biểu đồ **lượt thích & tương tác**
- **Phân tích nguồn traffic** (traffic source) theo tỷ lệ phần trăm thực tế:
  - Tìm kiếm, Feed đề xuất, Shorts feed, Trang kênh, Playlist, Trực tiếp, Khác
- **Phân loại nội dung**: Video / Shorts / Posts
- **Bảng top video** hiệu suất cao nhất
- **Danh sách người đăng ký mới** theo thời gian
- **Bộ lọc theo từng video** hoặc toàn bộ kênh
- **Advanced Analytics Modal**: phân tích chuyên sâu từng chỉ số

#### Community (Bình Luận Kênh)
- Xem toàn bộ bình luận của kênh
- **Lọc bình luận** theo:
  - Đã đăng (Published)
  - **Đang chờ duyệt** (Held for Review)
  - Đã ẩn (Hidden)
- **Phê duyệt** hoặc **Từ chối** bình luận đang chờ duyệt
- Quản lý người dùng theo kênh:
  - **Luôn phê duyệt** (Approved)
  - **Ẩn hoàn toàn** (Hidden)
  - **Mod tiêu chuẩn / Mod quản lý**
- **Tìm kiếm** bình luận theo nội dung
- Trả lời bình luận ngay trong Studio
- Xem bình luận theo từng video cụ thể

#### AutoMod (Lọc Tự Động)
- Creator cài đặt **danh sách từ khóa bị chặn** (Blacklist Keywords)
- Bình luận chứa từ khóa trong blacklist bị tự động ẩn (`hidden`)
- Kết hợp với mức kiểm duyệt để tùy chỉnh linh hoạt

#### Tùy Chỉnh Kênh
- Cập nhật **tên kênh**, **ảnh đại diện**, **ảnh banner**
- Cập nhật **handle** (@ tên kênh, giới hạn đổi 1 lần/90 ngày)
- Cập nhật **tiểu sử (bio)**

#### Quản Lý Shorts
- Tab riêng cho **Shorts** trong danh sách video
- Chỉnh sửa Shorts như video thông thường

#### Quản Lý Bài Đăng (Posts)
- Xem danh sách bài đăng cộng đồng trong Studio
- Xem bình luận theo từng bài đăng

---

### 🗂️ Playlist
- Tạo, chỉnh sửa, xoá playlist (công khai / riêng tư)
- Thêm / xoá video khỏi playlist
- Xem playlist riêng tư của mình (`/playlists`)
- Trang chi tiết playlist với danh sách video
- Hỗ trợ **Watch Later** và **Liked Videos** dưới dạng mix playlist đặc biệt

---

### 🏠 Trang Chủ & Feed
- **Home feed** — video được đề xuất theo danh mục
- **Trending feed** — video đang thịnh hành (`/feed/trending`)
- **Subscribed feed** — video từ các kênh đã đăng ký (`/feed/subscribed`)
- **Shorts feed** — chỉ hiển thị video dạng Shorts 9:16 (`/feed/shorts`)
- **Bộ lọc danh mục** (category carousel) trên trang chủ
- Feed **Hashtag** — tìm video theo hashtag (`/hashtag/[tag]`)

---

### 🔍 Tìm Kiếm
- Tìm kiếm video & kênh theo từ khoá
- **Lịch sử tìm kiếm** lưu cục bộ với dropdown gợi ý
- Lọc kết quả theo **loại** (video / kênh) và **thứ tự sắp xếp**

---

### 💬 Bình Luận
- Đăng bình luận cho **video** và **bài đăng cộng đồng**
- Đính kèm **ảnh GIF** vào bình luận (ví dụ: Tenor)
- Bình luận tại **mốc thời gian** (timestamp) trong video
- **Trả lời (reply)** bình luận theo thread có thể thu gọn
- **Like / Dislike** bình luận
- Creator có thể **Heart** (yêu thích) bình luận
- Creator có thể **Ghim (pin)** bình luận lên đầu
- **Xoá** bình luận của chính mình
- **Trạng thái kiểm duyệt**: `published` / `held_for_review` / `hidden`
- Bình luận bị **AutoMod** lọc tự động dựa trên từ khóa blacklist

---

### 👤 Trang Người Dùng / Kênh
- Trang kênh công khai (`/users/[userId]`) hiển thị video, Shorts và bài đăng
- Cập nhật avatar, ảnh banner kênh, tiểu sử (bio)
- Cài đặt **handle** tuỳ chỉnh (@ tên kênh)
- **Đăng ký / Huỷ đăng ký** kênh
- Nút Subscribe ẩn khi là chủ kênh
- **Tắt theo dõi lịch sử xem** (`Track history`)

---

### 📝 Cộng Đồng (Community Posts)
- Tạo bài đăng dạng **văn bản, hình ảnh, thăm dò ý kiến (poll), quiz, video**
- **Lên lịch đăng** (scheduled posts) — bài chỉ xuất hiện sau thời điểm đặt
- **Like / Dislike** bài đăng
- Chỉnh sửa và xoá bài đăng (chỉ hiện với chủ kênh)
- **Quiz**: đánh dấu đáp án đúng (tick xanh), thêm giải thích, hiện tỷ lệ chọn
- Bình luận cho bài đăng cộng đồng (cùng hệ thống với bình luận video)
- Hỗ trợ **poll dạng hình ảnh**

---

### 🔔 Thông Báo
- Nhận thông báo cho các sự kiện:
  - Có người **like video** của bạn
  - Có người **bình luận** vào video của bạn
  - Có người **trả lời bình luận** của bạn
  - Có người **like bình luận** của bạn
  - Có người **đăng ký** kênh của bạn
  - Có người **like / comment** bài đăng cộng đồng
- Trang xem thông báo (`/notifications`)

---

### 🛡️ Kiểm Duyệt Kênh (Channel Moderation)
- Creator phân loại người dùng:
  - **Luôn phê duyệt** (`approved`): bình luận của họ luôn được đăng ngay
  - **Ẩn** (`hidden`): người dùng bị chặn hoàn toàn, không thể bình luận
  - **Mod tiêu chuẩn** (`standard_mod`): hỗ trợ kiểm duyệt
  - **Mod quản lý** (`manager_mod`): quyền kiểm duyệt nâng cao
- Quản lý danh sách moderation trong tab Community của Studio

---

### 🔐 Xác Thực
- Đăng nhập / Đăng ký qua **Clerk** (hỗ trợ Social Login)
- Webhook đồng bộ user từ Clerk vào database (Svix)
- Bảo vệ route bằng middleware Clerk
- **Ban tài khoản** (admin có thể ban user)

---

### 🌐 Đa Ngôn Ngữ (i18n)
Hỗ trợ **8 ngôn ngữ** toàn bộ giao diện qua `next-intl`:

| Ngôn ngữ | Locale |
|---|---|
| 🇻🇳 Tiếng Việt | `vi` |
| 🇺🇸 Tiếng Anh | `en` |
| 🇯🇵 Tiếng Nhật | `ja` |
| 🇰🇷 Tiếng Hàn | `ko` |
| 🇨🇳 Tiếng Trung | `zh` |
| 🇩🇪 Tiếng Đức | `de` |
| 🇪🇸 Tiếng Tây Ban Nha | `es` |
| 🇫🇷 Tiếng Pháp | `fr` |

---

### 🛠️ Trang Admin
- Xem danh sách người dùng
- **Ban** / Unban tài khoản người dùng
- Quản lý nội dung toàn hệ thống

---

### ⚡ Hiệu Suất & Kỹ Thuật
- **Rate limiting** với Upstash Redis
- **Upstash Workflow** cho tác vụ nền bất đồng bộ (AI generation thumbnail)
- **Infinite scroll** với TanStack Query (cursor-based pagination)
- **tRPC** cho API type-safe từ server đến client
- **Server-side filtering** cho moderation — bình luận bị ẩn không bao giờ gửi xuống client
- **N+1 query prevention** — dùng subquery và batch select cho analytics
- Animations & micro-interactions với Tailwind + CSS
- **PWA ready** với `@ducanh2912/next-pwa`

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
| **i18n** | next-intl (8 ngôn ngữ) |
| **Form / Validation** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Icons** | Lucide React |

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
# Push schema lên database (thêm cột mới nếu có)
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
├── app/                        # Next.js App Router
│   ├── [locale]/
│   │   ├── (auth)/             # Trang đăng nhập / đăng ký
│   │   ├── (home)/             # Trang chủ và tất cả trang public
│   │   │   ├── page.tsx        # Trang chủ (home feed)
│   │   │   ├── feed/
│   │   │   │   ├── trending/   # Feed thịnh hành
│   │   │   │   ├── subscribed/ # Feed đã đăng ký
│   │   │   │   └── shorts/     # Feed Shorts
│   │   │   ├── hashtag/        # Feed theo hashtag
│   │   │   ├── videos/[videoId]# Trang xem video
│   │   │   ├── playlists/      # Quản lý playlist
│   │   │   ├── search/         # Trang tìm kiếm
│   │   │   ├── users/[userId]  # Trang kênh người dùng
│   │   │   ├── notifications/  # Trang thông báo
│   │   │   ├── posts/[postId]  # Trang bài đăng cộng đồng
│   │   │   ├── subscriptions/  # Quản lý đăng ký
│   │   │   └── admin/          # Trang admin
│   │   └── (studio)/
│   │       └── studio/
│   │           ├── page.tsx            # Danh sách video/Shorts/Posts
│   │           ├── dashboard/          # Dashboard tổng quan
│   │           ├── analytics/          # Analytics toàn kênh
│   │           ├── community/          # Quản lý bình luận kênh
│   │           ├── customization/      # Tùy chỉnh kênh
│   │           ├── posts/              # Quản lý bài đăng
│   │           └── videos/[videoId]/
│   │               ├── page.tsx        # Chỉnh sửa video
│   │               ├── analytics/      # Analytics từng video
│   │               └── comments/       # Bình luận từng video
│   └── api/                    # API routes
│       ├── trpc/               # tRPC handler
│       ├── webhooks/           # Clerk & Mux webhooks
│       ├── uploadthing/        # UploadThing handler
│       └── videos/workflows/   # Upstash Workflow (AI thumbnail)
├── db/
│   └── schema.ts               # Drizzle ORM schema (toàn bộ bảng CSDL)
├── modules/                    # Logic theo feature
│   ├── videos/                 # Upload, player, reactions, views
│   ├── studio/                 # Dashboard, analytics, form chỉnh sửa
│   ├── comments/               # Bình luận (video & bài đăng)
│   ├── comment-reactions/      # Like/Dislike bình luận
│   ├── posts/                  # Community posts (text, image, poll, quiz)
│   ├── playlists/              # Playlist CRUD
│   ├── subscriptions/          # Đăng ký kênh
│   ├── users/                  # Trang kênh người dùng
│   ├── home/                   # Home feed sections
│   ├── search/                 # Tìm kiếm
│   ├── suggestions/            # Video gợi ý
│   ├── notifications/          # Thông báo
│   ├── reports/                # Báo cáo nội dung
│   ├── admin/                  # Admin panel
│   ├── video-reactions/        # Like/Dislike video
│   ├── video-views/            # Lịch sử xem
│   ├── video-overlays/         # Overlay trên trình phát
│   ├── categories/             # Danh mục video
│   └── auth/                   # Xác thực
├── components/                 # Shared UI components (ShadcnUI + custom)
├── hooks/                      # Custom React hooks
├── i18n/                       # next-intl config & routing
├── lib/                        # Utilities (uploadthing, mux, openrouter...)
├── scripts/                    # Seed scripts
└── trpc/                       # tRPC router & client setup
```

---

## 🗄️ Database Schema (Các Bảng Chính)

| Bảng | Mô tả |
|---|---|
| `users` | Tài khoản người dùng, handle, banner, blacklist keywords |
| `videos` | Video với đầy đủ metadata Mux, kiểm duyệt bình luận |
| `posts` | Bài đăng cộng đồng (text/image/poll/video) |
| `post_images` | Ảnh đính kèm bài đăng |
| `post_polls` | Bình chọn / Quiz |
| `post_poll_options` | Các lựa chọn của poll |
| `post_poll_votes` | Lượt bình chọn của từng user |
| `post_reactions` | Like/Dislike bài đăng |
| `comments` | Bình luận cho video & bài đăng, có `moderation_status` |
| `comment_reactions` | Like/Dislike bình luận |
| `categories` | Danh mục video |
| `playlists` | Playlist (public/private/mix) |
| `playlist_videos` | Quan hệ playlist ↔ video |
| `subscriptions` | Đăng ký kênh |
| `channel_moderations` | Phân loại người dùng theo kênh |
| `video_views` | Tiến độ xem video |
| `view_events` | Sự kiện xem (cho analytics theo ngày) |
| `video_reactions` | Like/Dislike video |
| `notifications` | Thông báo real-time |
| `reports` | Báo cáo nội dung vi phạm |

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
- [next-intl](https://next-intl-docs.vercel.app)
- [Recharts](https://recharts.org)

---
