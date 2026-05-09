"use client";

import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const StudioSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  
  const [value, setValue] = useState(query);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    router.push(`/studio?query=${encodeURIComponent(value)}`);
  };

  return (
    <form 
      onSubmit={onSubmit}
      className="flex items-center w-full max-w-[600px]"
    >
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <SearchIcon className="size-4 text-neutral-400" />
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tìm kiếm trên kênh của bạn"
          className="w-full bg-neutral-900 border border-neutral-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>
    </form>
  );
};
