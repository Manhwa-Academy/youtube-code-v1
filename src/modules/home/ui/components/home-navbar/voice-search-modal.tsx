"use client";

import { useState, useEffect, useRef } from "react";
import { MicIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import { APP_URL } from "@/constants";

interface VoiceSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VoiceSearchModal = ({ open, onOpenChange }: VoiceSearchModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói.");
      return;
    }

    if (open) {
      setTranscript("");
      setInterimTranscript("");
      setError(null);
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Tắt continuous để giảm lỗi network
      recognition.interimResults = true;
      recognition.lang = "vi-VN";

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript((prev) => prev + final + " ");
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        
        // Mạng đôi khi bị lỗi tạm thời, chúng ta sẽ không báo lỗi ngay lập tức nếu đã có kết quả
        if (event.error === "network") {
          if (!transcript && !interimTranscript) {
            setError("Lỗi kết nối mạng. Hãy thử nói lại hoặc kiểm tra Internet.");
          }
        } else if (event.error === "not-allowed") {
          setError("Micro bị chặn. Vui lòng cấp quyền.");
        } else if (event.error !== "no-speech") {
          setError("Đã xảy ra lỗi. Hãy thử lại.");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [open]);

  const handleDone = () => {
    const finalQuery = (transcript + interimTranscript).trim();
    if (finalQuery) {
      const url = new URL("/search", APP_URL);
      url.searchParams.set("query", encodeURIComponent(finalQuery));
      router.push(url.toString());
      onOpenChange(false);
    }
  };

  return (
    <ResponsiveModal
      title="Tìm kiếm bằng giọng nói"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px] gap-8">
        <div className={`text-2xl font-medium text-center min-h-[3rem] px-4 ${error ? "text-red-500" : ""}`}>
          {error || transcript || interimTranscript || (isRecording ? "Đang nghe..." : "Nhấn vào micro để thử lại")}
        </div>

        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          )}
          <Button
            size="icon"
            variant={isRecording ? "destructive" : "secondary"}
            className="size-20 rounded-full shadow-lg relative z-10"
            onClick={() => {
              if (isRecording) {
                recognitionRef.current?.stop();
              } else {
                recognitionRef.current?.start();
              }
            }}
          >
            <MicIcon className="size-10" />
          </Button>
        </div>

        <div className="flex gap-4 w-full max-w-xs">
          <Button 
            variant="outline" 
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button 
            variant="default" 
            className="flex-1 rounded-full"
            onClick={handleDone}
            disabled={!(transcript || interimTranscript)}
          >
            Xong
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
