# 🚀 Hayase Yuuka — Ý Tưởng Phát Triển Tiếp Theo

---

## 🔴 Ưu Tiên Cao — Nên làm ngay (Tuần 1–4)

### 3. 📊 Studio Analytics — Giai đoạn 2
**Hiện trạng:** Analytics khá tốt nhưng còn thiếu:
- **Traffic sources breakdown**: Direct / Search / Suggested / External / Shorts / Playlist
- **Geographic data**: Lượt xem theo quốc gia/thành phố (dùng IP geolocation khi record `viewEvents`)
- **Device/Browser breakdown**: Mobile vs Desktop vs Tablet
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

