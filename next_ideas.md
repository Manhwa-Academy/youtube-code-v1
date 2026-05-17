# 🚀 Hayase Yuuka — Ý Tưởng Phát Triển Tiếp Theo

> Phân tích dựa trên codebase hiện tại (May 2026).  
> Project đã có: Video/Shorts, Studio Analytics, Community Posts (text/image/poll/quiz), Playlists, Comments (heart/pin/reply), Notifications, Reports, Moderation, i18n (8 ngôn ngữ), Admin panel, Hashtag pages.

---

## 🔴 Ưu Tiên Cao — Nên làm ngay (Tuần 1–4)

### 3. 📊 Studio Analytics — Giai đoạn 2
**Hiện trạng:** Analytics khá tốt nhưng còn thiếu:
- **Traffic sources breakdown**: Direct / Search / Suggested / External / Shorts / Playlist
- **Geographic data**: Lượt xem theo quốc gia/thành phố (dùng IP geolocation khi record `viewEvents`)
- **Device/Browser breakdown**: Mobile vs Desktop vs Tablet
- **Revenue simulation card**: CPC * views (mock data để demo monetization)
- **Comparison mode**: So sánh 2 khoảng thời gian (e.g., tuần này vs tuần trước)
- Export CSV/Excel cho analytics data

---

### 4. 🎬 Playlist Nâng Cao
**Hiện trạng:** Playlist CRUD cơ bản đã có.
- **Reorder video** trong playlist bằng drag & drop (dnd-kit)
- Thêm field `position` vào `playlist_videos` để lưu thứ tự
- **Playlist player mode**: Tự động phát video tiếp theo trong playlist (như queue YouTube)
- **Collaborative playlists**: Nhiều người cùng thêm video
- **Share playlist** với link + embed code
- **Save to Playlist** button trong video player (popup chọn playlist)

---

## 🟡 Ưu Tiên Trung Bình — 1–3 tháng

### 6. 📡 Live Streaming (Mux Live)
- Tích hợp **Mux Live API** để creator bắt đầu stream từ Studio
- Stream key + RTMP endpoint cấp cho OBS/Streamlabs
- Real-time chat trong live stream (WebSocket / Pusher)
- **Scheduled streams**: Creator đặt lịch → subscriber nhận thông báo trước
- Lưu VOD sau khi stream kết thúc
- **Super Chat** / donation simulation

```
Schema cần thêm:
live_streams (id, userId, muxLiveStreamId, scheduledAt, status, title, chatEnabled)
live_chat_messages (id, streamId, userId, message, createdAt)
```

---

### 7. 💰 Monetization / Channel Membership
- **Channel Membership**: Subscriber trả phí để vào tier đặc biệt
- Member-only videos/posts (visibility = "members")
- **Tipping / Super Thanks**: Donate khi xem video (tích hợp Stripe)
- Bảng tổng hợp revenue trong Studio Analytics
- Huy hiệu thành viên hiển thị cạnh tên trong comment

---

### 8. 🧠 AI Enhancement
**Hiện trạng:** AI generate title/description + thumbnail đã có.
- **Auto-chapters**: Phân tích transcript để tạo timestamps tự động
- **Content moderation AI**: Tự động flag bình luận/video vi phạm bằng AI
- **Smart thumbnail A/B test**: Upload 2 thumbnail, hệ thống chọn cái có CTR cao hơn
- **Video summary**: Tóm tắt nội dung video thành 3-5 câu (từ transcript)
- **Translation**: Dịch subtitle sang ngôn ngữ khác tự động
- **Recommendation ML**: Thay vì random suggestion, dùng embedding similarity (pgvector)

---

### 9. 👥 Social / Discovery Features
- **Collaborative Watch**: Xem video cùng bạn bè real-time (synchronized player + chat room)
- **Clips**: Cắt đoạn video 5–60s, share với timestamp range (như YouTube Clips)
- **Stories / Reels**: Post ngắn dạng ảnh/video tự biến mất sau 24h
- **Channel merch shelf**: Hiển thị sản phẩm bên dưới video (link ngoài)
- **Shoutout Posts**: Creator feature subscriber/kênh khác

---

### 10. 🛡️ Moderation Nâng Cao
**Hiện trạng:** Có `channelModerations`, reports, basic moderation.
- **Slow mode**: Giới hạn tần suất comment trong live stream
- **Comment approval queue**: Creator phải duyệt trước khi comment hiện
- **Trust levels**: Subscriber lâu năm được comment tự do hơn
- **Block user**: Chặn user cụ thể comment trên kênh của mình

---

### 11. 📱 Mobile App (React Native / Expo)
- Dùng tRPC client chung với web
- Video player native (Expo AV)
- Push notifications native
- Offline mode: Download video để xem offline
- Shorts feed với swipe gesture

## 🟢 Ưu Tiên Thấp — Dài Hạn (3–6 tháng+)

### 13. 🎓 Learning / Course Mode
- Creator tổ chức video thành **Course** với section/lesson
- Progress tracking theo lesson
- **Quiz** tích hợp sau mỗi lesson (đã có quiz system trong Community Posts)
- Certificate of completion

---

### 14. 🏆 Gamification
- **Badges / Achievements**: "First 1000 views", "Consistent Creator" (đăng 4 tuần liên tiếp)
- **Channel milestones**: Hiển thị celebration khi đạt 100/1K/10K subscribers
- **Watch streak**: User xem liên tiếp nhiều ngày được reward
- **Leaderboard**: Top channels theo region/category

---

### 15. 🤝 Multi-Channel Network (MCN)
- Creator group nhiều kênh vào 1 tổ chức
- Dashboard tổng hợp analytics toàn bộ kênh trong network
- Chia sẻ revenue trong network

---

### 16. 🖥️ Creator Tools Nâng Cao
- **Subtitle editor** trực tiếp trên web (sửa transcript đã gen bởi Mux)
- **End screens** builder: Thêm overlay video cuối (link video khác, subscribe button)
- **Cards**: Popup annotations trong video
- **Chapters editor** UI: Thêm chapter marker vào description với UI drag-timeline
- **Bulk actions** trong Studio: Đổi visibility nhiều video cùng lúc

---

### 17. 📧 Email Marketing
- **Newsletter**: Creator gửi email đến subscriber (tích hợp Resend)
- **Digest email** hàng tuần tự động: "Video mới từ kênh bạn theo dõi"
- **Re-engagement email**: Gửi cho user chưa login 30+ ngày

