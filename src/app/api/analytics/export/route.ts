import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { videos, viewEvents, users } from "@/db/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import ExcelJS from "exceljs";

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "28", 10);
    const videoId = searchParams.get("videoId");
    const locale = searchParams.get("locale") || "en";

    // Từ điển Đa ngôn ngữ (i18n) cho file Excel
    const dict: Record<string, any> = {
      en: { date: "Date", title: "Video Title", views: "Views", country: "Country", city: "City", device: "Device", source: "Traffic Source", unknown: "Unknown" },
      vi: { date: "Ngày", title: "Tên Video", views: "Lượt xem", country: "Quốc gia", city: "Thành phố", device: "Thiết bị", source: "Nguồn truy cập", unknown: "Không xác định" },
      ja: { date: "日付", title: "動画タイトル", views: "視聴回数", country: "国/地域", city: "都市", device: "デバイス", source: "トラフィックソース", unknown: "不明" },
      ko: { date: "날짜", title: "동영상 제목", views: "조회수", country: "국가", city: "도시", device: "기기", source: "트래픽 소스", unknown: "알 수 없음" },
      zh: { date: "日期", title: "视频标题", views: "观看次数", country: "国家/地区", city: "城市", device: "设备", source: "流量来源", unknown: "未知" },
      de: { date: "Datum", title: "Videotitel", views: "Aufrufe", country: "Land", city: "Stadt", device: "Gerät", source: "Zugriffsquelle", unknown: "Unbekannt" },
      es: { date: "Fecha", title: "Título del video", views: "Vistas", country: "País", city: "Ciudad", device: "Dispositivo", source: "Fuente de tráfico", unknown: "Desconocido" },
      fr: { date: "Date", title: "Titre de la vidéo", views: "Vues", country: "Pays", city: "Ville", device: "Appareil", source: "Source de trafic", unknown: "Inconnu" },
    };
    
    // Nguồn truy cập (Bản dịch thủ công nhỏ gọn)
    const sourceDict: Record<string, any> = {
      en: { direct: "Direct", search: "YouTube Search", suggested: "Suggested", external: "External", shorts: "Shorts Feed", playlist: "Playlists" },
      vi: { direct: "Trực tiếp", search: "Tìm kiếm YouTube", suggested: "Video đề xuất", external: "Nguồn bên ngoài", shorts: "Shorts Feed", playlist: "Danh sách phát" },
      ja: { direct: "直接", search: "YouTube 検索", suggested: "関連動画", external: "外部", shorts: "Shorts フィード", playlist: "再生リスト" },
      ko: { direct: "직접", search: "YouTube 검색", suggested: "추천 동영상", external: "외부", shorts: "Shorts 피드", playlist: "재생목록" },
      zh: { direct: "直接", search: "YouTube 搜索", suggested: "推荐的视频", external: "外部", shorts: "Shorts 动态", playlist: "播放列表" },
      de: { direct: "Direkt", search: "YouTube-Suche", suggested: "Vorgeschlagene Videos", external: "Extern", shorts: "Shorts-Feed", playlist: "Playlists" },
      es: { direct: "Directo", search: "Búsqueda de YouTube", suggested: "Videos sugeridos", external: "Externo", shorts: "Feed de Shorts", playlist: "Listas de reproducción" },
      fr: { direct: "Direct", search: "Recherche YouTube", suggested: "Vidéos suggérées", external: "Externe", shorts: "Flux Shorts", playlist: "Playlists" },
    };

    const t = dict[locale] || dict.en;
    const s = sourceDict[locale] || sourceDict.en;

    let query = db
      .select({
        date: sql<string>`DATE_TRUNC('day', ${viewEvents.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')`,
        views: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        country: viewEvents.country,
        city: viewEvents.city,
        device: viewEvents.deviceType,
        source: viewEvents.trafficSource,
        videoTitle: videos.title
      })
      .from(viewEvents)
      .innerJoin(videos, eq(viewEvents.videoId, videos.id))
      .where(
        and(
          eq(videos.userId, user.id),
          videoId ? eq(videos.id, videoId) : undefined,
          days === 3650 ? undefined : gte(viewEvents.createdAt, sql`NOW() - INTERVAL '1 day' * ${days}`)
        )
      )
      .groupBy(
        sql`DATE_TRUNC('day', ${viewEvents.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')`,
        viewEvents.country,
        viewEvents.city,
        viewEvents.deviceType,
        viewEvents.trafficSource,
        videos.title
      )
      .orderBy(desc(sql`DATE_TRUNC('day', ${viewEvents.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')`));

    const rawData = await query;

    // Khởi tạo file Excel siêu chuẩn
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Analytics Data");

    // Khai báo cột và độ rộng tối ưu
    worksheet.columns = [
      { header: t.date, key: "date", width: 15 },
      { header: t.title, key: "videoTitle", width: 55 }, 
      { header: t.views, key: "views", width: 10 },
      { header: t.country, key: "country", width: 15 },
      { header: t.city, key: "city", width: 20 },
      { header: t.device, key: "device", width: 15 },
      { header: t.source, key: "source", width: 25 },
    ];

    // Trang trí dòng tiêu đề: Chữ trắng, in đậm, nền xanh biển
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    
    // Bật bộ lọc Filter cho người dùng dễ dàng search trong Excel
    worksheet.autoFilter = 'A1:G1';

    // Cố định (Freeze) dòng đầu tiên (Tiêu đề cột)
    worksheet.views = [
      { state: 'frozen', ySplit: 1 }
    ];

    // Căn giữa dòng và tự động xuống dòng cho toàn bộ cột Video Title
    worksheet.getColumn('videoTitle').alignment = { vertical: 'middle', wrapText: true };
    
    // Căn giữa dọc cho tất cả các hàng
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Đổ dữ liệu
    rawData.forEach((row) => {
      const d = new Date(row.date);
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      
      const newRow = worksheet.addRow({
        date: dateStr,
        videoTitle: row.videoTitle || t.unknown,
        views: row.views,
        country: (row.country === "unknown" || !row.country) ? t.unknown : row.country,
        city: (row.city === "unknown" || !row.city) ? t.unknown : row.city,
        device: row.device || t.unknown,
        source: s[row.source || ""] || row.source || t.unknown,
      });

      // Căn giữa dọc cho dữ liệu
      newRow.alignment = { vertical: 'middle' };
    });

    // Xuất ra buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="analytics_export_${days}days.xlsx"`,
      },
    });
  } catch (error) {
    console.error("[ANALYTICS_EXPORT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
