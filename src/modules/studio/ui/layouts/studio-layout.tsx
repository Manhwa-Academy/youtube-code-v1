import { SidebarProvider } from "@/components/ui/sidebar";

import { StudioNavbar } from "../components/studio-navbar";
import { StudioSidebar } from "../components/studio-sidebar";

interface StudioLayoutProps {
  children: React.ReactNode;
};

export const StudioLayout = ({ children }: StudioLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full h-[100dvh] flex flex-col overflow-hidden">
        <StudioNavbar />
        <div className="flex flex-1 overflow-hidden">
          <StudioSidebar />
          <main id="main-scroll-container" className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
