const fs = require('fs');
const path = require('path');

const locales = ['en', 'vi', 'de', 'es', 'fr', 'ja', 'ko', 'zh'];
const messagesDir = path.join(__dirname, 'messages');

const translationsToAdd = {
  Posts: {
    edited: { en: " (edited)", vi: " (đã chỉnh sửa)", de: " (bearbeitet)", es: " (editado)", fr: " (modifié)", ja: " (編集済み)", ko: " (수정됨)", zh: " (已编辑)" },
    edit: { en: "Edit", vi: "Chỉnh sửa", de: "Bearbeiten", es: "Editar", fr: "Modifier", ja: "編集", ko: "수정", zh: "编辑" },
    reportViolation: { en: "Report violation", vi: "Báo cáo vi phạm", de: "Verstoß melden", es: "Reportar violación", fr: "Signaler une violation", ja: "違反を報告", ko: "위반 신고", zh: "举报违规" },
    editPostPlaceholder: { en: "Edit post...", vi: "Chỉnh sửa bài đăng...", de: "Beitrag bearbeiten...", es: "Editar publicación...", fr: "Modifier la publication...", ja: "投稿を編集...", ko: "게시물 수정...", zh: "编辑帖子..." },
    peopleResponded: { en: "{totalVotes} people responded", vi: "{totalVotes} người đã trả lời", de: "{totalVotes} Personen haben geantwortet", es: "{totalVotes} personas respondieron", fr: "{totalVotes} personnes ont répondu", ja: "{totalVotes} 人が回答しました", ko: "{totalVotes}명이 응답했습니다", zh: "{totalVotes} 人已回应" },
    respondNow: { en: "Respond now", vi: "Trả lời ngay", de: "Jetzt antworten", es: "Responder ahora", fr: "Répondre maintenant", ja: "今すぐ回答", ko: "지금 응답하기", zh: "立即回应" },
    votes: { en: "{totalVotes} votes", vi: "{totalVotes} lượt bình chọn", de: "{totalVotes} Stimmen", es: "{totalVotes} votos", fr: "{totalVotes} votes", ja: "{totalVotes} 票", ko: "{totalVotes}표", zh: "{totalVotes} 票" },
    postLinkCopied: { en: "Post link copied", vi: "Đã sao chép liên kết bài đăng", de: "Link zum Beitrag kopiert", es: "Enlace de publicación copiado", fr: "Lien de la publication copié", ja: "投稿のリンクをコピーしました", ko: "게시물 링크가 복사되었습니다", zh: "帖子链接已复制" },
    postScheduledSuccess: { en: "Post scheduled!", vi: "Đã lên lịch bài viết!", de: "Beitrag geplant!", es: "¡Publicación programada!", fr: "Publication planifiée !", ja: "投稿がスケジュールされました！", ko: "게시물이 예약되었습니다!", zh: "帖子已预订！" },
    postPublishedSuccess: { en: "Post published!", vi: "Đã đăng bài viết!", de: "Beitrag veröffentlicht!", es: "¡Publicación publicada!", fr: "Publication publiée !", ja: "投稿が公開されました！", ko: "게시물이 게시되었습니다!", zh: "帖子已发布！" },
    errorOccurred: { en: "An error occurred!", vi: "Có lỗi xảy ra!", de: "Ein Fehler ist aufgetreten!", es: "¡Ocurrió un error!", fr: "Une erreur s'est produite !", ja: "エラーが発生しました！", ko: "오류가 발생했습니다!", zh: "发生错误！" },
    post: { en: "Post", vi: "Bài đăng", de: "Beitrag", es: "Publicación", fr: "Publier", ja: "投稿", ko: "게시", zh: "发布" },
    scheduleTimePastError: { en: "Scheduled time cannot be in the past!", vi: "Thời gian lên lịch không được ở quá khứ!", de: "Die geplante Zeit darf nicht in der Vergangenheit liegen!", es: "¡La hora programada no puede estar en el pasado!", fr: "L'heure planifiée ne peut pas être dans le passé !", ja: "スケジュール時間は過去に設定できません！", ko: "예약 시간은 과거일 수 없습니다!", zh: "预定时间不能是过去！" },
    selectDateAndTime: { en: "Select date and time to publish this post", vi: "Chọn ngày và giờ để xuất bản bài đăng này", de: "Wählen Sie Datum und Uhrzeit für die Veröffentlichung", es: "Seleccione fecha y hora para publicar esta publicación", fr: "Sélectionnez la date et l'heure de publication", ja: "公開する日時を選択してください", ko: "게시물을 게시할 날짜와 시간을 선택하세요", zh: "选择发布此帖子的日期 and 时间" },
    schedulePost: { en: "Schedule post", vi: "Lên lịch đăng bài", de: "Beitrag planen", es: "Programar publicación", fr: "Planifier la publication", ja: "投稿をスケジュール", ko: "게시물 예약", zh: "预定帖子" },
    cloudinaryNotConfigured: { en: "Cloudinary Cloud Name not configured in .env", vi: "Chưa cấu hình Cloudinary Cloud Name trong .env", de: "Cloudinary Cloud Name nicht in .env konfiguriert", es: "Cloudinary Cloud Name no configurado en .env", fr: "Cloudinary Cloud Name non configuré dans .env", ja: "Cloudinary Cloud Name が .env で設定されていません", ko: "Cloudinary Cloud Name이 .env에 설정되지 않았습니다", zh: "Cloudinary Cloud Name 未在 .env 中配置" },
    errorUploadingImage: { en: "Error uploading image", vi: "Lỗi khi tải ảnh lên", de: "Fehler beim Hochladen des Bildes", es: "Error al subir la imagen", fr: "Erreur lors du téléchargement de l'image", ja: "画像のアップロード中にエラーが発生しました", ko: "이미지 업로드 중 오류 발생", zh: "上传图片时出错" },
    visibilityStatus: { en: "Visibility status", vi: "Trạng thái hiển thị", de: "Sichtbarkeitsstatus", es: "Estado de visibilidad", fr: "Statut de visibilité", ja: "公開設定", ko: "공개 상태", zh: "可见性状态" },
    public: { en: "Public", vi: "Công khai", de: "Öffentlich", es: "Público", fr: "Public", ja: "公開", ko: "공개", zh: "公开" },
    whatsOnYourMind: { en: "What's on your mind?", vi: "Bạn đang nghĩ gì?", de: "Was denkst du gerade?", es: "¿Qué estás pensando?", fr: "À quoi pensez-vous ?", ja: "今何を考えていますか？", ko: "무슨 생각을 하고 계신가요?", zh: "在想什么？" },
    editingPost: { en: "Editing...", vi: "Chỉnh sửa bản...", de: "Bearbeiten...", es: "Editando...", fr: "Modification...", ja: "編集面...", ko: "수정 중...", zh: "编辑中..." },
    images: { en: "Images", vi: "Hình ảnh", de: "Bilder", es: "Imágenes", fr: "Images", ja: "画像", ko: "이미지", zh: "图片" },
    imagePoll: { en: "Image poll", vi: "Cuộc thăm dò ý kiến dạng hình ảnh", de: "Bildumfrage", es: "Encuesta con imágenes", fr: "Sondage avec images", ja: "画像アンケート", ko: "이미지 투표", zh: "图片投票" },
    textPoll: { en: "Text poll", vi: "Cuộc thăm dò ý kiến dạng văn bản", de: "Textumfrage", es: "Encuesta de texto", fr: "Sondage textuel", ja: "テキストアンケート", ko: "텍스트 투표", zh: "文字投票" },
    question: { en: "Question", vi: "Câu hỏi", de: "Frage", es: "Pregunta", fr: "Question", ja: "質問", ko: "질문", zh: "问题" },
    answer: { en: "Answer", vi: "Câu trả lời", de: "Antwort", es: "Respuesta", fr: "Réponse", ja: "回答", ko: "답변", zh: "回答" },
    addOptionPlaceholder: { en: "Add option", vi: "Thêm lựa chọn", de: "Option hinzufügen", es: "Añadir opción", fr: "Ajouter une option", ja: "選択肢を追加", ko: "옵션 추가", zh: "添加选项" },
    addAnswer: { en: "Add answer", vi: "Thêm câu trả lời", de: "Antwort hinzufügen", es: "Añadir respuesta", fr: "Ajouter eine réponse", ja: "回答を追加", ko: "답변 추가", zh: "添加回答" },
    addAnotherOption: { en: "Add another option", vi: "Thêm lựa chọn khác", de: "Weitere Option hinzufügen", es: "Añadir otra opción", fr: "Ajouter une autre option", ja: "別の選択肢を追加", ko: "다른 옵션 추가", zh: "添加另一个选项" },
    changeImagePosition: { en: "Change image position", vi: "Đổi vị trí hình ảnh", de: "Bildposition ändern", es: "Cambiar posición de imagen", fr: "Changer la position de l'image", ja: "画像の位置を変更", ko: "이미지 위치 변경", zh: "更改图片位置" },
    localTime: { en: "(GMT+07:00) Local time", vi: "(GMT+07:00) Giờ địa phương", de: "(GMT+07:00) Ortszeit", es: "(GMT+07:00) Hora local", fr: "(GMT+07:00) Heure locale", ja: "(GMT+07:00) 現地時間", ko: "(GMT+07:00) 현지 시간", zh: "(GMT+07:00) 当地时间" },
    cancel: { en: "Cancel", vi: "Hủy", de: "Abbrechen", es: "Cancelar", fr: "Annuler", ja: "キャンセル", ko: "취소", zh: "取消" },
    posting: { en: "Posting...", vi: "Đang đăng...", de: "Posten...", es: "Publicando...", fr: "Publication...", ja: "投稿中...", ko: "게시 중...", zh: "发布中..." },
    schedule: { en: "Schedule", vi: "Lên lịch", de: "Planen", es: "Programar", fr: "Planifier", ja: "スケジュール", ko: "예약", zh: "预定" },
    selectTimePlaceholder: { en: "Select time", vi: "Chọn thời gian", de: "Zeit wählen", es: "Seleccionar hora", fr: "Choisir l'heure", ja: "時間を選択", ko: "時間を選択", zh: "选择时间" },
    delete: { en: "Delete", vi: "Xóa", de: "Löschen", es: "Eliminar", fr: "Supprimer", ja: "削除", ko: "삭제", zh: "删除" },
    publishPostTitle: { en: "Publish post", vi: "Xuất bản bài đăng", de: "Beitrag veröffentlichen", es: "Publicar publicación", fr: "Publier la publication", ja: "投稿を公開", ko: "게시물 게시", zh: "发布帖子" },
    publishPostDesc: { en: "Posts appear here after you publish and will be visible to your community", vi: "Bài đăng xuất hiện ở đây sau khi bạn xuất bản và sẽ được hiển thị với cộng đồng của bạn", de: "Beiträge erscheinen hier nach der Veröffentlichung und sind für deine Community sichtbar", es: "Las publicaciones aparecen aquí después de publicarlas y serán visibles para tu comunidad", fr: "Les publications apparaissent ici après publication et seront visibles par votre communauté", ja: "投稿は公開後にここに表示され、コミュニティに公開されます", ko: "게시물은 게시 후 여기에 표시되며 커뮤니티에 공개됩니다", zh: "发布后帖子将显示在此处，并对您的社区可见" },
    schedulePostTitle: { en: "Schedule posts", vi: "Lên lịch đăng bài", de: "Beiträge planen", es: "Programar publicaciones", fr: "Planifier des publications", ja: "投稿をスケジュール", ko: "게시물 예약", zh: "预定帖子" },
    schedulePostDesc: { en: "Get your content ready and schedule it for later", vi: "Hãy chuẩn bị sẵn nội dung và lên lịch đăng sau", de: "Bereite deine Inhalte vor und plane sie für später", es: "Prepara tu contenido y prográmalo para más tarde", fr: "Préparez votre contenu et planifiez-le pour plus tard", ja: "コンテンツを準備して、後で公開するようにスケジュールしましょう", ko: "콘텐츠를 준비하고 나중에 게시되도록 예약하세요", zh: "准备好内容并预定稍后发布" },
    archivedPostTitle: { en: "Expired posts in archive", vi: "Bài đăng đã hết hạn trong kho lưu trữ", de: "Abgelaufene Beiträge im Archiv", es: "Publicaciones expiradas en el archivo", fr: "Publications expirées trong l'archive", ja: "アーカイブ内の期限切れの投稿", ko: "보관함의 만료된 게시물", zh: "存档中已过期的帖子" },
    archivedPostDesc: { en: "Posts set to expire in 24 hours will appear in the archive. Only you can see archived posts.", vi: "Các bài đăng được chọn là sẽ hết hạn sau 24 giờ sẽ xuất hiện trong kho lưu trữ. Chỉ bạn mới có thể xem các bài đăng trong kho lưu trữ.", de: "Beiträge, die nach 24 Stunden ablaufen, erscheinen im Archiv. Nur du kannst archivierte Beiträge sehen.", es: "Las publicaciones configuradas para expirar en 24 horas aparecerán en el archivo. Solo tú puedes ver las publicaciones archivadas.", fr: "Les publications configurées pour expirer dans 24 heures apparaîtront trong l'archive. Bạn duy nhất có thể xem các bài đăng trong kho lưu trữ.", ja: "24時間で期限切れになるように設定された投稿はアーカイブに表示されます。アーカイブされた投稿はあなただけが閲覧できます。", ko: "24시간 후 만료되도록 설정된 게시물은 보관함에 표시됩니다. 보관된 게시물은 본인만 볼 수 있습니다.", zh: "设置为 24 小时后过期的帖子将显示在存档中。只有您可以查看存档的帖子。" },
    sortBy: { en: "Sort by", vi: "Sắp xếp theo", de: "Sortieren nach", es: "Ordenar por", fr: "Trier par", ja: "並べ替え", ko: "정렬 기준", zh: "排序方式" },
    topComments: { en: "Top comments", vi: "Nổi bật nhất", de: "Top-Kommentare", es: "Mejores comentarios", fr: "Top des commentaires", ja: "評価順", ko: "인기 댓글", zh: "最热评论" },
    newestFirst: { en: "Newest first", vi: "Mới nhất", de: "Neueste zuerst", es: "Más recentes primero", fr: "Plus récents d'abord", ja: "新しい順", ko: "최신순", zh: "最新优先" },
    commentsDisabled: { en: "Comments are disabled for this post.", vi: "Tính năng bình luận đã bị tắt cho bài đăng này.", de: "Kommentare sind für diesen Beitrag deaktiviert.", es: "Los comentarios están desactivados para esta publicación.", fr: "Les commentaires sont désactivés pour cette publication.", ja: "この投稿ではコメントが無効になっています。", ko: "이 게시물은 댓글을 사용할 수 없습니다.", zh: "此帖子的评论功能已禁用。" },
    errorLoadingPosts: { en: "Error loading posts", vi: "Lỗi khi tải bài đăng", de: "Fehler beim Laden der Beiträge", es: "Error al cargar las publicaciones", fr: "Erreur lors du chargement des publications", ja: "投稿の読み込みエラー", ko: "게시물 로드 오류", zh: "加载帖子时出错" },
    publishedStatus: { en: "PUBLISHED", vi: "ĐÃ ĐĂNG", de: "VERÖFFENTLICHT", es: "PUBLICADO", fr: "PUBLIÉ", ja: "公開済み", ko: "게시됨", zh: "已发布" },
    scheduledStatus: { en: "SCHEDULED", vi: "ĐÃ LÊN LỊCH", de: "GEPLANT", es: "PROGRAMADO", fr: "PLANIFIÉ", ja: "スケジュール済み", ko: "예약됨", zh: "已预定" },
    archivedStatus: { en: "ARCHIVED", vi: "ĐÃ LƯU TRỮ", de: "ARCHIVIERT", es: "ARCHIVADO", fr: "ARCHIVÉ", ja: "アーカイブ済み", ko: "보관됨", zh: "已存档" },
    postDeletedSuccess: { en: "Post deleted", vi: "Đã xóa bài viết", de: "Beitrag gelöscht", es: "Publicación eliminada", fr: "Publication supprimée", ja: "投稿を削除しました", ko: "게시물이 삭제되었습니다", zh: "帖子已删除" },
    postUpdatedSuccess: { en: "Post updated", vi: "Đã cập nhật bài viết", de: "Beitrag cập nhật", es: "Publicación actualizada", fr: "Publication mise à jour", ja: "投稿を更新しました", ko: "게시물이 업데이트되었습니다", zh: "帖子已更新" },
    postUpdateError: { en: "Error updating post", vi: "Lỗi khi cập nhật bài viết", de: "Fehler beim Aktualisieren des Beitrags", es: "Error al actualizar la publicación", fr: "Erreur lors de la mise à jour de la publication", ja: "投稿の更新中にエラーが発生しました", ko: "게시물 업데이트 중 오류 발생", zh: "更新帖子时出错" },
    ownerCannotVote: { en: "Channel owner cannot vote on their own post", vi: "Chủ kênh không thể bình chọn bài viết của mình", de: "Kanalinhaber können nicht über ihren eigenen Beitrag abstimmen", es: "El propietario del canal no puede votar en su propia publicación", fr: "Le propriétaire de la chaîne ne peut pas voter sur sa propre publication", ja: "チャンネルの所有者は自分の投稿に投票できません", ko: "채널 소유자는 자신의 게시물에 투표할 수 없습니다", zh: "频道所有者不能对自己发布的帖子进行投票" },
    scheduledFor: { en: "Scheduled for {time}", vi: "Đã lên lịch đăng vào {time}", de: "Geplant für {time}", es: "Programado para {time}", fr: "Planifié pour {time}", ja: "{time} にスケジュール済み", ko: "{time}에 예약됨", zh: "已预定于 {time}" },
    deletePost: { en: "Delete post", vi: "Xóa bài viết", de: "Beitrag löschen", es: "Eliminar publicación", fr: "Supprimer la publication", ja: "投稿を削除", ko: "게시물 삭제", zh: "删除帖子" },
    save: { en: "Save", vi: "Lưu", de: "Speichern", es: "Guardar", fr: "Sauvegarder", ja: "保存", ko: "저장", zh: "保存" },
    commentsCount: { en: "{count} comments", vi: "{count} bình luận", de: "{count} Kommentare", es: "{count} comentarios", fr: "{count} commentaires", ja: "{count} 件のコメント", ko: "{count}개의 댓글", zh: "{count} 条评论" }
  },
  Reports: {
    selectReason: { en: "Please select a reason", vi: "Vui lòng chọn lý do", de: "Bitte wählen Sie einen Grund aus", es: "Por favor seleccione un motivo", fr: "Veuillez sélectionner un motif", ja: "理由を選択してください", ko: "이유를 선택하세요", zh: "请选择一个原因" },
    reportSentSuccess: { en: "Report sent. Thank you!", vi: "Báo cáo đã được gửi. Cảm ơn bạn!", de: "Bericht gesendet. Vielen Dank!", es: "Reporte enviado. ¡Gracias!", fr: "Signalement envoyé. Merci !", ja: "報告を送信しました。ありがとうございます！", ko: "신고가 전송되었습니다. 감사합니다!", zh: "举报已发送。谢谢！" },
    reportSentError: { en: "Failed to send report", vi: "Không thể gửi báo cáo", de: "Fehler beim Senden des Berichts", es: "Error al enviar el reporte", fr: "Échec de l'envoi du signalement", ja: "報告の送信に失敗しました", ko: "신고 전송 실패", zh: "举报发送失败" },
    reason_spam: { en: "Spam or misleading content", vi: "Nội dung rác hoặc gây hiểu lầm", de: "Spam oder irreführende Inhalte", es: "Spam o contenido engañoso", fr: "Spam ou contenu trompeur", ja: "スパムまたは誤解を招く内容", ko: "스팸 또는 오해의 소지가 있는 콘텐츠", zh: "垃圾内容或误导性内容" },
    reason_harassment: { en: "Harassment or bullying", vi: "Quấy rối hoặc bắt nạt", de: "Belästigung oder Mobbing", es: "Acoso o intimidación", fr: "Harcèlement ou intimidation", ja: "嫌がらせやいじめ", ko: "괴롭힘 또는 따돌림", zh: "骚扰或欺凌" },
    reason_hate_speech: { en: "Hate speech", vi: "Ngôn từ gây thù ghét", de: "Hassrede", es: "Discurso de odio", fr: "Discourse de haine", ja: "ヘイトスピーチ", ko: "증오 표현", zh: "仇恨言论" },
    reason_violence: { en: "Violent or repulsive content", vi: "Nội dung bạo lực hoặc phản cảm", de: "Gewalttätige hoặc abstoßende Inhalte", es: "Contenido violento o repulsivo", fr: "Contenu violent ou répugnant", ja: "暴力的な内容や不快な内容", ko: "폭력적이거나 혐오스러운 콘텐츠", zh: "暴力或令人反感的内容" },
    reason_sexual_content: { en: "Sexual content", vi: "Nội dung khiêu dâm", de: "Sexuelle Inhalte", es: "Contenido sexual", fr: "Contenu à caractère sexuel", ja: "性的内容", ko: "성적인 콘텐츠", zh: "色情内容" },
    reason_child_abuse: { en: "Child abuse", vi: "Ngược đãi trẻ em", de: "Kindesmissbrauch", es: "Abuso infantil", fr: "Maltraitance d'enfants", ja: "児童虐待", ko: "아동 학대", zh: "虐待儿童" },
    reason_other: { en: "Other reasons", vi: "Lý do khác", de: "Andere Gründe", es: "Otros motivos", fr: "Autres motifs", ja: "その他の理由", ko: "기타 이유", zh: "其他原因" },
    reportTitle: { en: "Report violation", vi: "Báo cáo vi phạm", de: "Verstoß melden", es: "Reportar violación", fr: "Signaler une violation", ja: "違反を報告", ko: "위반 신고", zh: "举报违规" },
    reportDescription: { en: "If you see this content violates community standards, let us know.", vi: "Nếu bạn thấy nội dung này vi phạm tiêu chuẩn cộng đồng, hãy cho chúng tôi biết.", de: "Wenn du glaubst, dass dieser Inhalt gegen die Community-Richtlinien verstößt, lass es uns wissen.", es: "Si ves que este contenido viola las normas de la comunidad, avísanos.", fr: "Si vous trouvez que ce contenu enfreint les règles de la communauté, faites-le nous savoir.", ja: "このコンテンツがコミュニティ標準に違反している場合はお知らせください。", ko: "이 콘텐츠가 커뮤니티 표준을 위반한다고 판단되면 알려주세요.", zh: "如果您发现此内容违反了社区准则，请告知我们。" },
    reasonLabel: { en: "Reason", vi: "Lý do", de: "Grund", es: "Motivo", fr: "Motif", ja: "理由", ko: "이유", zh: "原因" },
    selectReasonPlaceholder: { en: "Select report reason", vi: "Chọn lý do báo cáo", de: "Grund auswählen", es: "Seleccionar motivo", fr: "Chọn lý do báo cáo", ja: "理由を選択してください", ko: "신고 이유 선택", zh: "选择举报原因" },
    moreDetailsLabel: { en: "More details (optional)", vi: "Chi tiết thêm (tùy chọn)", de: "Weitere Details (optional)", es: "Más detalles (opcional)", fr: "Plus de détails (facultatif)", ja: "詳細（任意）", ko: "상세 내용 (선택 사항)", zh: "更多详情（可选）" },
    moreDetailsPlaceholder: { en: "Provide more information about the violation...", vi: "Cung cấp thêm thông tin về vi phạm...", de: "Geben Sie weitere Informationen zum Verstoß an...", es: "Proporciona más información sobre la violación...", fr: "Fournissez plus d'informations sur la violation...", ja: "違反に関する詳細を入力してください...", ko: "위반 사항에 대한 자세한 정보를 제공하세요...", zh: "提供有关违规行为的更多信息..." },
    submitReport: { en: "Submit report", vi: "Gửi báo cáo", de: "Bericht einreichen", es: "Enviar reporte", fr: "Envoyer le signalement", ja: "報告を送信", ko: "신고 제출", zh: "提交举报" },
    cancel: { en: "Cancel", vi: "Hủy", de: "Abbrechen", es: "Cancelar", fr: "Annuler", ja: "キャンセル", ko: "취소", zh: "取消" }
  },
  Home: {
    youAreOffline: { en: "You are offline", vi: "Bạn đang ngoại tuyến", de: "Sie sind offline", es: "Estás desconectado", fr: "Vous êtes hors ligne", ja: "オフラインです", ko: "오프라인 상태입니다", zh: "您已离线" },
    downloadToWatch: { en: "Download videos to watch them here anytime without an internet connection.", vi: "Hãy tải video xuống để có thể xem chúng ở đây bất cứ khi nào không có kết nối mạng.", de: "Laden Sie Videos herunter, um sie jederzeit auch ohne Internetverbindung anzusehen.", es: "Descarga videos para verlos aquí en cualquier momento sin conexión a Internet.", fr: "Téléchargez des vidéos pour les regarder ici à tout moment sans connexion Internet.", ja: "インターネットに接続していなくてもいつでも視聴できるように、動画をダウンロードしてください。", ko: "인터넷 연결 없이도 언제 어디서나 시청할 수 있도록 동영상을 다운로드하세요.", zh: "下载视频，以便随时在没有互联网连接的情况下观看。" },
    downloads: { en: "Downloads", vi: "Nội dung tải xuống", de: "Downloads", es: "Descargas", fr: "Téléchargements", ja: "オフライン", ko: "오프라인", zh: "下载" },
    readyToWatchOffline: { en: "Ready to watch offline", vi: "Sẵn sàng để xem ngoại tuyến", de: "Bereit zum Offline-Ansehen", es: "Listo para ver sin conexión", fr: "Prêt pour le visionnage hors ligne", ja: "オフラインで視聴可能", ko: "오프라인 시청 가능", zh: "可离线观看" },
    suggestedDownloadedVideos: { en: "Suggested downloaded videos", vi: "Video đã tải xuống đề xuất", de: "Vorgeschlagene heruntergeladene Videos", es: "Videos descargados sugeridos", fr: "Vidéos téléchargées suggérées", ja: "おすすめのオフライン動画", ko: "추천 오프라인 동영상", zh: "推荐的下载视频" },
    basedOnYourDownloads: { en: "(Based on content you've downloaded)", vi: "(Dựa trên nội dung bạn đã tải về máy)", de: "(Basierend auf Inhalten, die Sie heruntergeladen haben)", es: "(Basado en el contenido que has descargado)", fr: "(Basé trên le contenu que vous avez téléchargé)", ja: "（ダウンロードしたコンテンツに基づく）", ko: "(다운로드한 콘텐츠 기준)", zh: "（基于您下载的内容）" }
  },
  Playlists: {
    videoAddedToMix: { en: "Video added to mix playlist", vi: "Đã thêm video vào danh sách kết hợp", de: "Video zur Mix-Playlist hinzugefügt", es: "Video añadido a la lista de reproducción mixta", fr: "Vidéo ajoutée à la playlist mix", ja: "動画がミックスリストに追加されました", ko: "동영상이 믹스 재생목록에 추가되었습니다", zh: "视频已添加到混合播放列表" },
    videoRemovedFromMix: { en: "Video removed from mix playlist", vi: "Đã gỡ video khỏi danh sách kết hợp", de: "Video aus der Mix-Playlist entfernt", es: "Video eliminado de la lista de reproducción mixta", fr: "Vidéo retirée de la playlist mix", ja: "動画がミックスリストから削除されました", ko: "동영상이 믹스 재생목록에서 제거되었습니다", zh: "视频已从混合播放列表中移除" },
    errorOccurred: { en: "An error occurred", vi: "Đã có lỗi xảy ra", de: "Ein Fehler ist aufgetreten", es: "Ocurrió un error", fr: "Une erreur s'est produite", ja: "エラーが発生しました", ko: "오류가 발생했습니다", zh: "发生了错误" },
    addToMixPlaylist: { en: "Add to mix playlist", vi: "Thêm vào danh sách kết hợp", de: "Zur Mix-Playlist hinzufügen", es: "Añadir a la lista de reproducción mixta", fr: "Ajouter à la playlist mix", ja: "ミックスリストに追加", ko: "믹스 재생목록에 추가", zh: "添加到混合播放列表" },
    createMixPlaylist: { en: "Create mix playlist", vi: "Tạo danh sách kết hợp", de: "Mix-Playlist erstellen", es: "Crear lista de reproducción mixta", fr: "Créer eine playlist mix", ja: "ミックスリストを作成", ko: "믹스 재생목록 생성", zh: "创建混合播放列表" },
    playlistName: { en: "Playlist name", vi: "Tên danh sách", de: "Name der Playlist", es: "Nombre de la lista de reproducción", fr: "Nom de la playlist", ja: "リスト名", ko: "재생목록 이름", zh: "播放列表名称" },
    playlistNamePlaceholder: { en: "e.g. Series Noa", vi: "Ví dụ: Series Noa", de: "z. B. Serie Noa", es: "p. ej. Serie Noa", fr: "ex. Série Noa", ja: "例：シリーズNoa", ko: "예: 시리즈 Noa", zh: "例如：Noa 系列" },
    privacy: { en: "Privacy", vi: "Quyền riêng tư", de: "Datenschutz", es: "Privacidad", fr: "Confidentialité", ja: "公開設定", ko: "공개 범위", zh: "隐私" },
    public: { en: "Public", vi: "Công khai", de: "Öffentlich", es: "Público", fr: "Public", ja: "公開", ko: "공개", zh: "公开" },
    private: { en: "Private", vi: "Riêng tư", de: "Privat", es: "Privado", fr: "Privé", ja: "非公開", ko: "비공개", zh: "私密" },
    create: { en: "Create", vi: "Tạo", de: "Erstellen", es: "Crear", fr: "Créer", ja: "作成", ko: "생성", zh: "创建" },
    playlistCreatedSuccess: { en: "Mix playlist created successfully!", vi: "Tạo danh sách kết hợp thành công!", de: "Mix-Playlist erfolgreich erstellt!", es: "¡Lista de reproducción mixta creada con éxito!", fr: "Playlist mix créée với succès !", ja: "ミックスリストを作成しました！", ko: "믹스 재생목록이 성공적으로 생성되었습니다!", zh: "混合播放列表创建成功！" },
    playlistNameRequired: { en: "Please enter a playlist name", vi: "Vui lòng nhập tên danh sách", de: "Bitte geben Sie einen Namen für die Playlist ein", es: "Por favor, ingrese un nombre para la lista de reproducción", fr: "Veuillez saisir un nom de playlist", ja: "リスト名を入力してください", ko: "재생목록 이름을 입력하세요", zh: "请输入播放列表名称" },
    playAll: { en: "Play all", vi: "Phát tất cả", de: "Alle abspielen", es: "Reproducir todo", fr: "Tout lire", ja: "すべて再生", ko: "모두 재생", zh: "全部播放" },
    videosCount: { en: "{count} videos", vi: "{count} video", de: "{count} Videos", es: "{count} videos", fr: "{count} vidéos", ja: "{count} 本の動画", ko: "{count}개의 동영상", zh: "{count} 个视频" },
    videoRemovedFromPlaylist: { en: "Video removed from playlist", vi: "Đã gỡ video khỏi danh sách phát", de: "Video aus der Playlist entfernt", es: "Video eliminado de la lista de reproducción", fr: "Vidéo retirée de la playlist", ja: "動画が再生リストから削除されました", ko: "동영상이 재생목록에서 제거되었습니다", zh: "视频已从播放列表中移除" },
    errorRemovingVideo: { en: "Error removing video from playlist", vi: "Đã xảy ra lỗi khi gỡ video", de: "Fehler beim Entfernen des Videos aus der Playlist", es: "Error al eliminar el video de la lista de reproducción", fr: "Erreur lors de la suppression de la vidéo de la playlist", ja: "再生リストからの動画の削除中にエラーが発生しました", ko: "재생목록에서 동영상을 제거하는 중 오류가 발생했습니다", zh: "从播放列表中移除视频时出错" }
  },
  Common: {
    somethingWentWrong: { en: "Something went wrong", vi: "Đã xảy ra lỗi", de: "Etwas ist schiefgelaufen", es: "Algo salió mal", fr: "Quelque chose s'est mal passé", ja: "問題が発生しました", ko: "문제가 발생했습니다", zh: "出了点问题" },
    errorLoadingContent: { en: "We couldn't load this content right now. Please try again later.", vi: "Chúng tôi không thể tải nội dung này vào lúc này. Vui lòng thử lại sau.", de: "Wir konnten diesen Inhalt zurzeit không tải được. Bitte versuchen Sie es später erneut.", es: "No pudimos cargar este contenido en este momento. Por favor, inténtalo de nuevo más tarde.", fr: "Nous n'avons pas pu charger ce contenu pour le moment. Veuillez réessayer plus tard.", ja: "現在このコンテンツを読み込めませんでした。後でもう一度お試しください。", ko: "지금은 이 콘텐츠를 로드할 수 없습니다. 나중에 다시 시도해 주세요.", zh: "目前无法加载此内容。请稍后再试。" },
    retry: { en: "Retry", vi: "Thử lại", de: "Wiederholen", es: "Reintentar", fr: "Réessayer", ja: "再試行", ko: "재시도", zh: "重试" },
    loading: { en: "Loading...", vi: "Đang tải...", de: "Laden...", es: "Cargando...", fr: "Chargement...", ja: "読み込み中...", ko: "로딩 중...", zh: "加载中..." },
    viewMore: { en: "View more", vi: "Xem thêm", de: "Mehr anzeigen", es: "Ver más", fr: "Voir plus", ja: "もっと見る", ko: "더 보기", zh: "查看更多" },
    cancel: { en: "Cancel", vi: "Hủy", de: "Abbrechen", es: "Cancelar", fr: "Annuler", ja: "キャンセル", ko: "취소", zh: "取消" },
    confirm: { en: "Confirm", vi: "Xác nhận", de: "Bestätigen", es: "Confirmar", fr: "Confirmer", ja: "確定", ko: "확인", zh: "确认" },
    searchGifs: { en: "Search GIFs...", vi: "Tìm kiếm GIF...", de: "GIFs suchen...", es: "Buscar GIFs...", fr: "Rechercher des GIFs...", ja: "GIFを検索...", ko: "GIF 검색...", zh: "搜索 GIF..." },
    noGifsFound: { en: "No GIFs found", vi: "Không tìm thấy GIF nào", de: "Keine GIFs gefunden", es: "No se encontraron GIFs", fr: "Aucun GIF trouvé", ja: "GIFが見つかりませんでした", ko: "GIF를 찾을 수 없습니다", zh: "未找到 GIF" },
    ready: { en: "Ready", vi: "Sẵn sàng", de: "Bereit", es: "Listo", fr: "Prêt", ja: "準備完了", ko: "준비됨", zh: "就绪" },
    preparing: { en: "Preparing", vi: "Đang chuẩn bị", de: "Vorbereitung", es: "Preparando", fr: "Préparation", ja: "準備中", ko: "준비 중", zh: "准备中" },
    processing: { en: "Processing", vi: "Đang xử lý", de: "Verarbeitung", es: "Procesando", fr: "Traitement", ja: "処理中", ko: "처리 중", zh: "处理中" },
    errored: { en: "Errored", vi: "Lỗi", de: "Fehlerhaft", es: "Error", fr: "Erreur", ja: "エラー", ko: "오류 발생", zh: "出错" },
    noSubtitles: { en: "No subtitles", vi: "Không có phụ đề", de: "Keine Untertitel", es: "Sin subtítulos", fr: "Pas de sous-titres", ja: "字幕なし", ko: "자막 없음", zh: "无字幕" },
    vietnamese: { en: "Vietnamese", vi: "Tiếng Việt", de: "Vietnamesisch", es: "Vietnamita", fr: "Vietnamien", ja: "ベトナム語", ko: "베트남어", zh: "越南语" },
    space: { en: "Space", vi: "Khoảng cách", de: "Leertaste", es: "Espacio", fr: "Espace", ja: "スペース", ko: "스페이스", zh: "空格" }
  },
  Admin: {
    systemOverview: { en: "System overview", vi: "Tổng quan hệ thống", de: "Systemübersicht", es: "Resumen del sistema", fr: "Aperçu du système", ja: "システム概要", ko: "시스템 개요", zh: "系统概览" },
    platformAnalysis: { en: "Platform analysis and system health.", vi: "Phân tích nền tảng và tình trạng hệ thống.", de: "Plattformanalyse und Systemzustand.", es: "Análisis de la plataforma y salud del sistema.", fr: "Aperçu du système et état du système.", ja: "システム概要とシステム健全性", ko: "플랫폼 분석 및 시스템 상태", zh: "平台分析与系统健康状况" },
    errorLoadingStats: { en: "Error loading system stats", vi: "Lỗi khi tải thông số hệ thống", de: "Fehler beim Laden der Systemstatistiken", es: "Error al cargar las estadísticas del sistema", fr: "Erreur lors du chargement des statistiques système", ja: "システム統計の読み込みエラー", ko: "시스템 통계 로드 오류", zh: "加载系统统计信息时出错" },
    hours: { en: "{count} hours", vi: "{count} giờ", de: "{count} Stunden", es: "{count} horas", fr: "{count} heures", ja: "{count} 時間", ko: "{count} 시간", zh: "{count} 小时" },
    users: { en: "Users", vi: "Người dùng", de: "Benutzer", es: "Usuarios", fr: "Utilisateurs", ja: "ユーザー", ko: "사용자", zh: "用户" },
    totalRegisteredAccounts: { en: "Total registered accounts", vi: "Tổng số tài khoản đã đăng ký", de: "Gesamtzahl der registrierten Konten", es: "Total de cuentas registradas", fr: "Nombre total de comptes enregistrés", ja: "登録アカウント总数", ko: "총 등록 계정", zh: "已注册账号总数" },
    videos: { en: "Videos", vi: "Video", de: "Videos", es: "Videos", fr: "Vidéos", ja: "動画", ko: "동영상", zh: "视频" },
    totalUploadedVideos: { en: "Total uploaded videos", vi: "Tổng số video đã tải lên", de: "Gesamtzahl der hochgeladenen Videos", es: "Total de videos subidos", fr: "Nombre total de vidéos téléchargées", ja: "アップロード動画总数", ko: "총 업로드된 동영상", zh: "已上传视频总数" },
    comments: { en: "Comments", vi: "Bình luận", de: "Kommentare", es: "Comentarios", fr: "Commentaires", ja: "コメント", ko: "댓글", zh: "评论" },
    totalDiscussions: { en: "Total discussions", vi: "Tổng số thảo luận", de: "Gesamtzahl der Diskussionen", es: "Total de discusiones", fr: "Nombre total de discussions", ja: "ディスカッション总数", ko: "총 토론 수", zh: "讨论总数" },
    posts: { en: "Posts", vi: "Bài đăng", de: "Beiträge", es: "Publicaciones", fr: "Publications", ja: "投稿", ko: "게시물", zh: "帖子" },
    totalCommunityPosts: { en: "Total community posts", vi: "Tổng số bài đăng cộng đồng", de: "Gesamtzahl der Community-Beiträge", es: "Total de publicaciones de la comunidad", fr: "Nombre total de publications de la communauté", ja: "コミュニティ投稿总数", ko: "총 커뮤니티 게시물", zh: "社区帖子总数" },
    watchTime: { en: "Watch time", vi: "Thời gian xem", de: "Wiedergabezeit", es: "Tiempo de reproducción", fr: "Temps de visionnage", ja: "視聴時間", ko: "시청 시간", zh: "观看时长" },
    totalVideoWatchTime: { en: "Total video watch time", vi: "Tổng thời gian xem video", de: "Gesamte Wiedergabezeit der Videos", es: "Tiempo total de reproducción de videos", fr: "Temps de visionnage total des vidéos", ja: "動画の总視聴時間", ko: "총 동영상 시청 시간", zh: "视频总观看时长" },
    activeDAU: { en: "Active (DAU)", vi: "Hoạt động (DAU)", de: "Aktiv (TÄ)", es: "Activos (DAU)", fr: "Actifs (DAU)", ja: "アクティブ (DAU)", ko: "활성 (DAU)", zh: "活跃 (DAU)" },
    activeUsers24h: { en: "Active users in 24h", vi: "Người dùng hoạt động trong 24h", de: "Aktive Benutzer in 24h", es: "Usuarios activos en 24h", fr: "Utilisateurs actifs en 24h", ja: "24時間以内のアクティブユーザー", ko: "24시간 내 활성 사용자", zh: "24小时内活跃用户" },
    activeMAU: { en: "Active (MAU)", vi: "Hoạt động (MAU)", de: "Aktiv (MAU)", es: "Activos (MAU)", fr: "Actifs (MAU)", ja: "アクティブ (MAU)", ko: "활성 (MAU)", zh: "活跃 (MAU)" },
    activeUsers30d: { en: "Active users in 30 days", vi: "Người dùng hoạt động trong 30 ngày", de: "Aktive Benutzer in 30 Tagen", es: "Usuarios activos en 30 días", fr: "Utilisateurs actifs en 30 jours", ja: "30日以内のアクティブユーザー", ko: "30일 내 활성 사용자", zh: "30天内活跃用户" },
    userManagement: { en: "User management", vi: "Quản lý người dùng", de: "Benutzerverwaltung", es: "Gestión de usuarios", fr: "Gestion des utilisateurs", ja: "ユーザー管理", ko: "사용자 관리", zh: "用户管理" },
    manageUserAccounts: { en: "Manage user accounts and system status.", vi: "Quản lý tài khoản và trạng thái của người dùng trên hệ thống.", de: "Benutzerkonten und Systemstatus verwalten.", es: "Gestionar cuentas de usuario y estado del sistema.", fr: "Gérer les comptes utilisateurs et l'état du système.", ja: "ユーザーアカウントとシステム状態の管理", ko: "사용자 계정 및 시스템 상태 관리", zh: "管理用户账号和系统状态" },
    searchPlaceholder: { en: "Search by name or handle...", vi: "Tìm kiếm theo tên hoặc handle...", de: "Nach Name oder Handle suchen...", es: "Buscar por nombre o handle...", fr: "Rechercher par nom ou identifiant...", ja: "名前またはハンドルで検索...", ko: "이름 또는 핸들로 검색...", zh: "按名称或句柄搜索..." },
    errorLoadingUsers: { en: "Error loading users", vi: "Lỗi khi tải danh sách người dùng", de: "Fehler beim Laden der Benutzer", es: "Error al cargar usuarios", fr: "Erreur lors du chargement des utilisateurs", ja: "ユーザーの読み込みエラー", ko: "사용자 로드 오류", zh: "加载用户时出错" },
    userStatusUpdated: { en: "User status updated", vi: "Đã cập nhật trạng thái người dùng", de: "Benutzerstatus aktualisiert", es: "Estado de usuario actualizado", fr: "Statut de l'utilisateur mis à jour", ja: "ユーザーのステータスを更新しました", ko: "사용자 상태 업데이트됨", zh: "用户状态已更新" },
    confirmBanTitle: { en: "Confirm ban account?", vi: "Xác nhận cấm tài khoản?", de: "Konto-Sperrung bestätigen?", es: "¿Confirmar baneo de cuenta?", fr: "Confirmer le bannissement du compte ?", ja: "アカウントを禁止しますか？", ko: "계정 차단을 확인하시겠습니까?", zh: "确认封禁账号？" },
    confirmBanDesc: { en: "Are you sure you want to ban {name}? This user will not be able to log in or interact with the system.", vi: "Bạn có chắc chắn muốn cấm tài khoản {name}? Người dùng này sẽ không thể thực hiện các thao tác đăng nhập và tương tác trên hệ thống.", de: "Sind Sie sicher, dass Sie {name} sperren möchten? Dieser Benutzer wird sich nicht mehr anmelden oder mit dem System interagieren können.", es: "¿Estás seguro de que deseas banear a {name}? Este usuario no podrá iniciar sesión ni interactuar con el sistema.", fr: "Êtes-vous sûr de vouloir bannir {name} ? Cet utilisateur ne pourra plus se connecter ni interagir với le système.", ja: "{name} を禁止してもよろしいですか？このユーザーはシステムへのログインや操作ができなくなります。", ko: "{name} 님을 차단하시겠습니까? 이 사용자는 시스템에 로그인하거나 상호 작용할 수 없습니다.", zh: "您确定要封禁 {name} 吗？该用户将无法登录或与系统交互。" },
    banAccount: { en: "Ban account", vi: "Cấm tài khoản", de: "Konto sperren", es: "Banear cuenta", fr: "Bannir le compte", ja: "アカウントを禁止", ko: "계정 차단", zh: "封禁账号" },
    tableUser: { en: "User", vi: "Người dùng", de: "Benutzer", es: "Usuario", fr: "Utilisateur", ja: "ユーザー", ko: "사용자", zh: "用户" },
    tableJoinedDate: { en: "Joined date", vi: "Ngày tham gia", de: "Beitrittsdatum", es: "Fecha de unión", fr: "Date d'inscription", ja: "参加日", ko: "가입 날짜", zh: "加入日期" },
    tableStatus: { en: "Status", vi: "Trạng thái", de: "Status", es: "Estado", fr: "Statut", ja: "ステータス", ko: "상태", zh: "状态" },
    tableActions: { en: "Actions", vi: "Thao tác", de: "Aktionen", es: "Acciones", fr: "Actions", ja: "アクション", ko: "작업", zh: "操作" },
    statusBanned: { en: "Banned", vi: "Đã bị cấm", de: "Gesperrt", es: "Baneado", fr: "Banni", ja: "禁止", ko: "차단됨", zh: "已封禁" },
    statusActive: { en: "Active", vi: "Hoạt động", de: "Aktiv", es: "Activo", fr: "Actif", ja: "アクティブ", ko: "활성", zh: "活跃" },
    viewChannel: { en: "View channel", vi: "Xem kênh", de: "Kanal ansehen", es: "Ver canal", fr: "Voir la chaîne", ja: "チャンネルを表示", ko: "채널 보기", zh: "查看频道" },
    unbanAccount: { en: "Unban account", vi: "Gỡ cấm tài khoản", de: "Konto-Sperre aufheben", es: "Desbanear cuenta", fr: "Débannir le compte", ja: "禁止を解除", ko: "차단 해제", zh: "解除封禁账号" },
    adminPanelTitle: { en: "Admin Panel", vi: "Bảng quản trị hệ thống", de: "Admin-Bereich", es: "Panel de administración", fr: "Panneau d'administration", ja: "管理パネル", ko: "管理 패널", zh: "管理面板" },
    overview: { en: "Overview", vi: "Tổng quan", de: "Übersicht", es: "Resumen", fr: "Aperçu", ja: "概要", ko: "개요", zh: "概览" },
    reports: { en: "Reports", vi: "Báo cáo vi phạm", de: "Berichte", es: "Reportes", fr: "Signalements", ja: "報告", ko: "신고", zh: "举报" }
  },
  Studio: {
    public: { en: "Public", vi: "Công khai", de: "Öffentlich", es: "Público", fr: "Public", ja: "公開", ko: "공개", zh: "公开" },
    private: { en: "Private", vi: "Riêng tư", de: "Privat", es: "Privado", fr: "Privé", ja: "非公開", ko: "비공개", zh: "私密" },
    ready: { en: "Ready", vi: "Sẵn sàng", de: "Bereit", es: "Listo", fr: "Prêt", ja: "準備完了", ko: "준비됨", zh: "就绪" },
    preparing: { en: "Preparing", vi: "Đang chuẩn bị", de: "Vorbereitung", es: "Preparando", fr: "Préparation", ja: "準備中", ko: "준비 중", zh: "准备中" },
    processing: { en: "Processing", vi: "Đang xử lý", de: "Verarbeitung", es: "Procesando", fr: "Traitement", ja: "処理中", ko: "처리 중", zh: "处理中" },
    errored: { en: "Errored", vi: "Lỗi", de: "Fehlerhaft", es: "Error", fr: "Erreur", ja: "エラー", ko: "오류 발생", zh: "出错" },
    no_subtitles: { en: "No subtitles", vi: "Không có phụ đề", de: "Keine Untertitel", es: "Sin subtítulos", fr: "Pas de sous-titres", ja: "字幕なし", ko: "자막 없음", zh: "无字幕" },
    combined: { en: "Combined", vi: "Kết hợp", de: "Kombiniert", es: "Combinado", fr: "Combiné", ja: "混合", ko: "결합됨", zh: "组合" },
    standard: { en: "Standard", vi: "Tiêu chuẩn", de: "Standard", es: "Estándar", fr: "Standard", ja: "標準", ko: "표준", zh: "标准" },
    empty: { en: "Empty", vi: "Trống", de: "Leer", es: "Vacío", fr: "Vide", ja: "空", ko: "비어 있음", zh: "空" },
    titleRequired: { en: "Title (required)", vi: "Tiêu đề (bắt buộc)", de: "Titel (erforderlich)", es: "Título (obligatorio)", fr: "Titre (obligatoire)", ja: "タイトル（必須）", ko: "제목 (필수)", zh: "标题（必填）" },
    uploadThumbnail: { en: "Upload a thumbnail", vi: "Tải lên ảnh thu nhỏ", de: "Thumbnail hochladen", es: "Subir miniatura", fr: "Télécharger une miniature", ja: "サムネイルをアップロード", ko: "썸네일 업로드", zh: "上传缩略图" },
    channelDashboard: { en: "Channel dashboard", vi: "Trang tổng quan của kênh", de: "Kanal-Dashboard", es: "Panel del canal", fr: "Tableau de bord de la chaîne", ja: "チャンネル ダッシュボード", ko: "채널 대시보드", zh: "频道信息中心" },
    uploadVideo: { en: "UPLOAD VIDEO", vi: "TẢI VIDEO LÊN", de: "VIDEO HOCHLADEN", es: "SUBIR VIDEO", fr: "CHARGER UNE VIDÉO", ja: "動画をアップロード", ko: "동영상 업로드", zh: "上传视频" },
    createPost: { en: "CREATE POST", vi: "TẢI BÀI ĐĂNG", de: "BEITRAG ERSTELLEN", es: "CREAR PUBLICACIÓN", fr: "CRÉER UNE PUBLICATION", ja: "投稿を作成", ko: "게시물 생성", zh: "创建帖子" },
    loadingCommunity: { en: "Loading community...", vi: "Đang tải cộng đồng...", de: "Community wird geladen...", es: "Cargando comunidad...", fr: "Chargement de la communauté...", ja: "コミュニティを読み込み中...", ko: "커뮤니티 로딩 중...", zh: "正在加载社区..." },
    errorLoadingCommunity: { en: "Error loading community data", vi: "Đã xảy ra lỗi khi tải dữ liệu cộng đồng", de: "Fehler beim Laden der Community-Daten", es: "Error al cargar los datos de la comunidad", fr: "Erreur lors du chargement des données de la communauté", ja: "コミュニティデータの読み込み中にエラーが発生しました", ko: "커뮤니티 데이터를 로드하는 중 오류가 발생했습니다", zh: "加载社区数据时出错" },
    errorLoadingCustomization: { en: "Error loading customization page", vi: "Lỗi khi tải trang tùy chỉnh", de: "Fehler beim Laden der Anpassungsseite", es: "Error al cargar la página de personalización", fr: "Erreur lors du chargement de la page de personnalisation", ja: "カスタマイズページの読み込み中にエラーが発生しました", ko: "맞춤설정 페이지를 로드하는 중 오류가 발생했습니다", zh: "加载自定义页面时出错" },
    loadingComments: { en: "Loading comments...", vi: "Đang tải bình luận...", de: "Kommentare werden geladen...", es: "Cargando comentarios...", fr: "Chargement des commentaires...", ja: "コメントを読み込み中...", ko: "댓글 로딩 중...", zh: "正在加载评论..." },
    errorLoadingComments: { en: "Error loading comments", vi: "Đã xảy ra lỗi khi tải bình luận", de: "Fehler beim Laden der Kommentare", es: "Error al cargar los comentarios", fr: "Erreur lors du chargement des commentaires", ja: "コメントの読み込み中にエラーが発生しました", ko: "댓글을 로드하는 중 오류가 발생했습니다", zh: "加载评论时出错" }
  },
  General: {
    notifications: { en: "Notifications", vi: "Thông báo", de: "Benachrichtigungen", es: "Notificaciones", fr: "Notifications", ja: "通知", ko: "알림", zh: "通知" },
    siteDescription: { en: "Owner-sama's video website", vi: "Trang web video của chủ nhân-sama", de: "Owner-samas Video-Website", es: "Sitio web de videos de Owner-sama", fr: "Site vidéo d'Owner-sama", ja: "ご主人様の動画サイト", ko: "주인님의 동영상 웹사이트", zh: "主人样的视频网站" }
  },
  Offline: {
    downloadedContent: { en: "Downloaded content", vi: "Nội dung tải xuống", de: "Heruntergeladene Inhalte", es: "Contenido descargado", fr: "Contenu téléchargé", ja: "オフライン", ko: "오프라인", zh: "下载" },
    videosAvailableOffline: { en: "{count} videos available to watch offline", vi: "{count} video có sẵn để xem ngoại tuyến", de: "{count} Videos zum Offline-Ansehen verfügbar", es: "{count} videos disponibles para ver sin conexión", fr: "{count} vidéos disponibles pour le visionnage hors ligne", ja: "{count} 本の動画がオフラインで視聴可能です", ko: "{count}개의 동영상을 오프라인에서 시청할 수 있습니다", zh: "{count} 个视频可离线观看" },
    noDownloadedContent: { en: "No downloaded content", vi: "Chưa có nội dung tải xuống", de: "Keine heruntergeladenen Inhalte", es: "Sin contenido descargado", fr: "Aucun contenu téléchargé", ja: "オフライン動画はありません", ko: "오프라인 동영상이 없습니다", zh: "无下载内容" },
    downloadVideosToWatchOffline: { en: "Videos you download to watch offline will appear here.", vi: "Video bạn tải xuống để xem ngoại tuyến sẽ xuất hiện ở đây.", de: "Videos, die du zum Offline-Ansehen herunterlädst, erscheinen hier.", es: "Los videos que descargues para ver sin conexión aparecerán aquí.", fr: "Les vidéos que vous téléchargez pour les regarder hors ligne apparaîtront ici.", ja: "オフラインで視聴するためにダウンロードした動画がここに表示されます。", ko: "오프라인 시청을 위해 다운로드한 동영상이 여기에 표시됩니다.", zh: "您下载供离线观看的视频将显示在此处。" },
    errorLoadingDownloadedVideos: { en: "Failed to load downloaded videos.", vi: "Không thể tải danh sách video đã tải.", de: "Fehler beim Laden der heruntergeladenen Videos.", es: "Error al cargar los videos descargados.", fr: "Échec du chargement des vidéos téléchargées.", ja: "オフライン動画の読み込みに失敗しました。", ko: "오프라인 동영상을 로드하지 못했습니다.", zh: "加载下载的视频失败。" },
    confirmDeleteDownloadedVideo: { en: "Are you sure you want to delete this video from downloads?", vi: "Bạn có chắc chắn muốn xóa video này khỏi danh sách tải xuống?", de: "Möchten Sie dieses Video wirklich aus den Downloads löschen?", es: "¿Estás seguro de que deseas eliminar este video de las descargas?", fr: "Êtes-vous sûr de vouloir supprimer cette vidéo des téléchargements ?", ja: "この動画をオフラインから削除してもよろしいですか？", ko: "이 동영상을 오프라인에서 삭제하시겠습니까?", zh: "您确定要从下载中删除此视频吗？" },
    videoDeleted: { en: "Video deleted.", vi: "Đã xóa video.", de: "Video gelöscht.", es: "Video eliminado.", fr: "Vidéo supprimée.", ja: "動画を削除しました。", ko: "동영상이 삭제되었습니다.", zh: "视频已删除。" },
    errorDeletingVideo: { en: "Error deleting video.", vi: "Lỗi khi xóa video.", de: "Fehler beim Löschen des Videos.", es: "Error al eliminar el video.", fr: "Erreur lors de la suppression de la vidéo.", ja: "動画の削除中にエラーが発生しました。", ko: "동영상 삭제 중 오류가 발생했습니다.", zh: "删除视频时出错。" },
    noLocalVideoData: { en: "No local video data found.", vi: "Không tìm thấy dữ liệu video cục bộ.", de: "Keine lokalen Videodaten gefunden.", es: "No se encontraron datos de video locales.", fr: "Aucune donnée vidéo locale trouvée.", ja: "ローカル動画データが見つかりません。", ko: "로컬 동영상 데이터를 찾을 수 없습니다.", zh: "未找到本地视频数据。" },
    cannotPlayVideo: { en: "Cannot play video.", vi: "Không thể phát video.", de: "Video kann nicht abgespielt werden.", es: "No se puede reproducir el video.", fr: "Impossible de lire la vidéo.", ja: "動画を再生できません。", ko: "동영상을 재생할 수 없습니다.", zh: "无法播放视频。" }
  }
};

locales.forEach(locale => {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    for (const [namespace, keys] of Object.entries(translationsToAdd)) {
      if (!data[namespace]) data[namespace] = {};
      
      for (const [key, langs] of Object.entries(keys)) {
        data[namespace][key] = langs[locale] || langs['en'];
      }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Updated ${locale}.json`);
  }
});
