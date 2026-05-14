export const STATUS_MAP = {
  ready: "Ready",
  preparing: "Preparing",
  processing: "Processing",
  errored: "Errored",
} as const;

export const VISIBILITY_MAP = {
  public: "Public",
  private: "Private",
} as const;

export const TRACK_STATUS_MAP = {
  ready: "Ready",
  preparing: "Preparing",
  processing: "Processing",
  errored: "Errored",
  no_subtitles: "No subtitles",
} as const;
