import { ShieldCheck, MapPin, Eye, MessageSquareWarning, Ban, Gavel, UserX, AlertTriangle } from "lucide-react";

export const metadata = { title: "Safety Center" };

const SAFE_TRANSACTION_TIPS = [
  { icon: MapPin, text: "Meet in public campus locations like the library or cafeteria." },
  { icon: Eye, text: "Check the product in person before paying." },
  { icon: ShieldCheck, text: "Never share your password, OTP, or payment PIN with anyone." },
  { icon: MessageSquareWarning, text: "Report suspicious users or listings immediately." },
];

const RULES = [
  { icon: Ban, text: "No illegal products of any kind." },
  { icon: Gavel, text: "No prohibited or restricted campus items." },
  { icon: AlertTriangle, text: "No fraudulent or misleading listings." },
  { icon: UserX, text: "No harassment of other students, ever." },
];

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-tint text-primary">
          <ShieldCheck size={20} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Safety Center</h1>
          <p className="text-sm text-muted-foreground">Guidelines for a safe, trustworthy campus marketplace.</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-bold text-foreground">Safe transactions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SAFE_TRANSACTION_TIPS.map((tip) => (
            <div key={tip.text} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
                <tip.icon size={15} />
              </span>
              <p className="text-sm text-foreground">{tip.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">Campus marketplace rules</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {RULES.map((rule) => (
            <div key={rule.text} className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive-tint p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-destructive">
                <rule.icon size={15} />
              </span>
              <p className="text-sm text-foreground">{rule.text}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Something feel off? Use the <span className="font-medium text-foreground">Report</span> button on any
        listing or profile, and our team will review it.
      </p>
    </div>
  );
}
