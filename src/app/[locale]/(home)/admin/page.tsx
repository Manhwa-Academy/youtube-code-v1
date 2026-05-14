"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AdminDashboardSection } from "@/modules/admin/ui/sections/admin-dashboard-section";
import { AdminUsersSection } from "@/modules/admin/ui/sections/admin-users-section";
import { AdminReportsSection } from "@/modules/reports/ui/sections/admin-reports-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Admin");
  
  const currentTab = searchParams.get("tab") || "overview";

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-y-6">
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
        <div className="px-6 pt-6 bg-white dark:bg-neutral-900 border-b sticky top-0 z-10">
          <h1 className="text-3xl font-bold mb-4">{t("adminPanelTitle")}</h1>
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-0 pb-3 font-bold"
            >
              {t("overview")}
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-0 pb-3 font-bold"
            >
              {t("users")}
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-0 pb-3 font-bold"
            >
              {t("reports")}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview">
          <AdminDashboardSection />
        </TabsContent>
        <TabsContent value="users">
          <AdminUsersSection />
        </TabsContent>
        <TabsContent value="reports">
          <AdminReportsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
