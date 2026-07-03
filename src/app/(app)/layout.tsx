import { AppSidebar } from "@/components/layout/app-sidebar";
import { LiquidBackground } from "@/components/shared/liquid-background";
import { PrayerNotifications } from "@/features/routine/components/prayer-notifications";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <LiquidBackground variant="alpine">
      <AppSidebar user={session.user} />
      <main className="relative z-10 lg:pl-68">
        <div className="container mx-auto max-w-7xl p-4 pt-16 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
      <PrayerNotifications />
    </LiquidBackground>
  );
}
