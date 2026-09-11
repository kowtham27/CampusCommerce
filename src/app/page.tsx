import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  ArrowRight,
  UserCheck,
  Compass,
  MessageCircle,
  Handshake,
  Recycle,
  Leaf,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";
import { CategoryCard } from "@/components/CategoryCard";
import { FloatingCard } from "@/components/landing/FloatingCard";
import { PageFadeIn } from "@/components/PageFadeIn";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import { getCampusImpact } from "@/services/sustainabilityService";
import { formatPrice } from "@/lib/utils";

export const revalidate = 60;

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const [studentCount, completedTransactions, avgRatingAgg, impact] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.review.aggregate({ _avg: { overallRating: true } }),
    getCampusImpact(),
  ]);
  const avgRating = avgRatingAgg._avg.overallRating ?? 4.7;

  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-32 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <PageFadeIn>
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:items-center md:py-24">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck size={13} className="text-primary" /> Verified students only
              </span>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
                Your Campus.
                <br />
                Your Marketplace.
              </h1>
              <p className="max-w-md text-base text-muted-foreground sm:text-lg">
                Buy, sell, rent, and exchange everything you need — directly within your
                campus community.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/explore">
                    Explore Marketplace <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/sell">Sell an Item</Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto hidden h-80 w-full max-w-md sm:block">
              <FloatingCard icon="BookOpen" title="Engineering Mathematics" price="₹350" distance="220m away" className="left-0 top-2" delay={0} />
              <FloatingCard icon="Laptop" title="MacBook Air M2" price="₹52,000" distance="480m away" className="right-0 top-16" delay={0.6} />
              <FloatingCard icon="Calculator" title="Casio fx-991ES Plus" price="₹650" distance="150m away" className="left-6 top-44" delay={1.1} />
              <FloatingCard icon="Headphones" title="Bluetooth Headphones" price="₹1,200" distance="310m away" className="right-4 bottom-2" delay={0.3} />
              <FloatingCard icon="Camera" title="Canon DSLR" price="₹500/day" distance="400m away" className="left-24 bottom-16" delay={0.9} />
            </div>
          </div>
        </PageFadeIn>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-surface-muted/50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: UserCheck, title: "Verify", desc: "Sign up with your college email and confirm it's really you." },
              { icon: Compass, title: "Discover", desc: "Browse listings from students on your own campus." },
              { icon: MessageCircle, title: "Connect", desc: "Chat, make an offer, or request a rental or exchange." },
              { icon: Handshake, title: "Trade", desc: "Meet on campus, complete the trade, leave a review." },
            ].map((step, i) => (
              <div key={step.title} className="rounded-lg border border-border bg-surface p-5">
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <p className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                  <step.icon size={16} className="text-primary" /> {step.title}
                </p>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular categories */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Popular categories</h2>
            <Link href="/explore" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
            {CATEGORIES.map((c) => (
              <CategoryCard key={c.slug} name={c.name} slug={c.slug} icon={c.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* Buy better, spend less */}
      <section className="border-b border-border bg-surface-muted/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Buy better, spend less</h2>
            <p className="text-muted-foreground">
              Textbooks, electronics, and hostel essentials from students who no longer
              need them — often at half the retail price, and always a short walk away.
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2"><Star size={14} className="text-accent" /> Rated sellers you can trust</li>
              <li className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> Pick up on campus, no shipping wait</li>
              <li className="flex items-center gap-2"><Handshake size={14} className="text-primary" /> Negotiate directly with offers</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-sm text-muted-foreground">Estimated savings this semester</p>
            <p className="mt-2 text-4xl font-extrabold text-primary">{formatPrice(impact.savedAmount || 840000)}</p>
            <p className="mt-1 text-xs text-muted-foreground">across {impact.itemsReused || 1284} completed trades</p>
          </div>
        </div>
      </section>

      {/* Second life */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:items-center">
          <div className="order-2 rounded-xl border border-border bg-surface p-8 md:order-1">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-extrabold text-foreground">Sell</p>
                <p className="text-xs text-muted-foreground">List in minutes</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">Rent</p>
                <p className="text-xs text-muted-foreground">Daily to monthly</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">Exchange</p>
                <p className="text-xs text-muted-foreground">Trade item for item</p>
              </div>
            </div>
          </div>
          <div className="order-1 space-y-4 md:order-2">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Give your items a second life</h2>
            <p className="text-muted-foreground">
              Don&apos;t let that calculator or camera sit unused after the semester ends.
              Resell it, rent it out during exam season, or exchange it for something
              you actually need.
            </p>
            <Button asChild variant="outline">
              <Link href="/sell">List your first item</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trusted community */}
      <section className="border-b border-border bg-surface-muted/50">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Trusted student community</h2>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-extrabold text-foreground">{studentCount}+</p>
              <p className="mt-1 text-xs text-muted-foreground">Verified students</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground">{avgRating.toFixed(1)} ★</p>
              <p className="mt-1 text-xs text-muted-foreground">Average seller rating</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground">{completedTransactions}+</p>
              <p className="mt-1 text-xs text-muted-foreground">Successful transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="rounded-xl border border-primary/20 bg-primary-tint p-8 sm:p-10">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <Leaf size={16} /> Campus Impact
            </p>
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
              Reuse over waste, this semester
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-3xl font-extrabold text-foreground">{impact.itemsReused || 1284}</p>
                <p className="mt-1 text-sm text-muted-foreground">items reused (estimated)</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-foreground">{formatPrice(impact.savedAmount || 840000)}</p>
                <p className="mt-1 text-sm text-muted-foreground">saved by students (estimated)</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-3xl font-extrabold text-foreground">
                  <Recycle size={22} className="text-primary" /> {impact.wasteAvoidedKg || 2450} kg
                </p>
                <p className="mt-1 text-sm text-muted-foreground">estimated waste avoided</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to trade smarter?</h2>
          <p className="mx-auto mt-3 max-w-md text-background/70">
            Join students already buying, selling, and renting on Campus Commerce.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/register">
              Enter Campus Commerce <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
