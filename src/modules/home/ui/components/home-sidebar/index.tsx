"use client";

import { SignedIn } from "@clerk/nextjs"

import { Separator } from "@/components/ui/separator"

import { useIsOnline } from "@/hooks/use-is-online"

import { MainSection } from "./main-section"
import { TrendingSection } from "./trending-section"
import { PersonalSection } from "./personal-section"
import { SubscriptionsSection } from "./subscriptions-section"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar"

export const HomeSidebar = () => {
  const isOnline = useIsOnline();
  const t = useTranslations("General");

  return (
    <Sidebar className="z-40 border-none md:pt-16" collapsible="offcanvas">
      <SidebarHeader className="bg-background sm:hidden p-0 shrink-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Image src="/yuuka.png" alt="Logo" width={28} height={28} />
          <span className="font-semibold text-base">{t("siteTitle")}</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-background pb-10 sm:pb-0">
        {isOnline && (
          <>
            <MainSection />
            <Separator />
            <TrendingSection />
            <Separator />
          </>
        )}
        <PersonalSection />
        {isOnline && (
          <SignedIn>
            <>
              <Separator />
              <SubscriptionsSection />
            </>
          </SignedIn>
        )}
      </SidebarContent>
    </Sidebar>
  )
}