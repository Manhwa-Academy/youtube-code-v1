# 🚀 Hayase Yuuka — Ý Tưởng Phát Triển Tiếp Theo

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
