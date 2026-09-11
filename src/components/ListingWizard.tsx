"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  X,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceEstimator } from "@/components/PriceEstimator";
import { CONDITION_LABELS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { uploadListingImages } from "@/services/storageService";
import type { ConditionInput } from "@/services/pricingService";

const STEPS = ["Details", "Photos", "Condition", "Pricing", "Location", "Type", "Preview"];
const CONDITIONS: ConditionInput[] = ["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR", "USED"];

export function ListingWizard({
  categories,
  locations,
}: {
  categories: { id: string; name: string; slug: string }[];
  locations: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [condition, setCondition] = useState<ConditionInput>("GOOD");
  const [originalPrice, setOriginalPrice] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [ageMonths, setAgeMonths] = useState("6");
  const [locationId, setLocationId] = useState("");
  const [isSellable, setIsSellable] = useState(true);
  const [isRentable, setIsRentable] = useState(false);
  const [isExchangeable, setIsExchangeable] = useState(false);
  const [rentDaily, setRentDaily] = useState("");
  const [rentWeekly, setRentWeekly] = useState("");
  const [rentMonthly, setRentMonthly] = useState("");
  const [rentDeposit, setRentDeposit] = useState("");
  const [exchangeWants, setExchangeWants] = useState("");

  const selectedCategory = categories.find((c) => c.id === categoryId);

  function onPhotosSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - photos.length);
    if (files.length === 0) return;
    setPhotos((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  }
  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  function canAdvance() {
    if (step === 0) return title.trim().length >= 3 && description.trim().length >= 10 && !!categoryId;
    if (step === 1) return photos.length >= 1;
    if (step === 3) return Number(price) >= 0 && (!isSellable || Number(price) > 0);
    if (step === 4) return !!locationId;
    if (step === 5) return isSellable || isRentable || isExchangeable;
    return true;
  }

  const validationMessage = useMemo(() => {
    if (step === 0) return "Add a title (3+ characters), description (10+ characters), and category.";
    if (step === 1) return "Add at least one photo.";
    if (step === 3) return "Enter a valid price.";
    if (step === 4) return "Select a pickup location.";
    if (step === 5) return "Select at least one: Sell, Rent, or Exchange.";
    return "";
  }, [step]);

  async function publish() {
    setPublishing(true);
    try {
      const imageUrls = await uploadListingImages(photos, title || "listing");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          condition,
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          price: Number(price || 0),
          images: imageUrls,
          locationId,
          isSellable,
          isRentable,
          rentDaily: rentDaily ? Number(rentDaily) : undefined,
          rentWeekly: rentWeekly ? Number(rentWeekly) : undefined,
          rentMonthly: rentMonthly ? Number(rentMonthly) : undefined,
          rentDeposit: rentDeposit ? Number(rentDeposit) : undefined,
          isExchangeable,
          exchangeWants: exchangeWants ? exchangeWants.split(",").map((s) => s.trim()).filter(Boolean) : [],
          brand: brand || undefined,
          ageMonths: ageMonths ? Number(ageMonths) : undefined,
          tags: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't publish your listing.");
        return;
      }
      toast.success("Listing published!");
      router.push(`/product/${data.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 md:py-8">
      <h1 className="mb-1 text-xl font-bold text-foreground sm:text-2xl">Sell an item</h1>
      <p className="mb-5 text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
      <Progress value={((step + 1) / STEPS.length) * 100} className="mb-8" />

      <div className="rounded-xl border border-border bg-surface p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Casio FX-991ES Plus" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the item's condition, usage, and why you're selling it..." />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Label>Photos ({photos.length}/6)</Label>
            <div className="grid grid-cols-3 gap-3">
              {photoPreviews.map((src, i) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-md border border-border">
                  <Image src={src} alt="" fill className="object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border-strong text-muted-foreground hover:bg-surface-muted">
                  <ImagePlus size={20} />
                  <span className="text-xs">Add photo</span>
                  <input type="file" accept="image/*" multiple onChange={onPhotosSelected} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Your photos are uploaded and shown exactly as you added them.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Label>Condition</Label>
            <div className="space-y-2">
              {CONDITIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCondition(c)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors",
                    condition === c ? "border-primary bg-primary-tint text-primary" : "border-border-strong text-foreground hover:bg-surface-muted"
                  )}
                >
                  {CONDITION_LABELS[c]}
                  {condition === c && <Badge>Selected</Badge>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="originalPrice">Original price (₹)</Label>
                <Input id="originalPrice" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="1200" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Selling price (₹)</Label>
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="650" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="brand">Brand (optional)</Label>
                <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Casio" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Age (months)</Label>
                <Input id="age" type="number" value={ageMonths} onChange={(e) => setAgeMonths(e.target.value)} />
              </div>
            </div>

            {selectedCategory && (
              <PriceEstimator
                categorySlug={selectedCategory.slug}
                originalPrice={Number(originalPrice) || 0}
                ageMonths={Number(ageMonths) || 6}
                condition={condition}
                brand={brand}
                onApply={(p) => setPrice(String(p))}
              />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-1.5">
            <Label>Pickup location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger>
              <SelectContent>
                {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="flex items-center gap-2.5">
                <Checkbox checked={isSellable} onCheckedChange={(v) => setIsSellable(!!v)} />
                <span className="text-sm font-medium text-foreground">Sell</span>
              </label>
              <label className="flex items-center gap-2.5">
                <Checkbox checked={isRentable} onCheckedChange={(v) => setIsRentable(!!v)} />
                <span className="text-sm font-medium text-foreground">Rent</span>
              </label>
              <label className="flex items-center gap-2.5">
                <Checkbox checked={isExchangeable} onCheckedChange={(v) => setIsExchangeable(!!v)} />
                <span className="text-sm font-medium text-foreground">Exchange</span>
              </label>
            </div>

            {isRentable && (
              <div className="grid grid-cols-2 gap-3 rounded-md bg-surface-muted p-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rentDaily">Per day (₹)</Label>
                  <Input id="rentDaily" type="number" value={rentDaily} onChange={(e) => setRentDaily(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rentWeekly">Per week (₹)</Label>
                  <Input id="rentWeekly" type="number" value={rentWeekly} onChange={(e) => setRentWeekly(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rentMonthly">Per month (₹)</Label>
                  <Input id="rentMonthly" type="number" value={rentMonthly} onChange={(e) => setRentMonthly(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rentDeposit">Security deposit (₹)</Label>
                  <Input id="rentDeposit" type="number" value={rentDeposit} onChange={(e) => setRentDeposit(e.target.value)} />
                </div>
              </div>
            )}

            {isExchangeable && (
              <div className="space-y-1.5 rounded-md bg-surface-muted p-3">
                <Label htmlFor="wants">Looking for (comma separated)</Label>
                <Input id="wants" value={exchangeWants} onChange={(e) => setExchangeWants(e.target.value)} placeholder="Engineering books, Calculator" />
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="relative aspect-[4/3] bg-surface-muted">
                {photoPreviews[0] && <Image src={photoPreviews[0]} alt="" fill className="object-cover" />}
              </div>
              <div className="space-y-1 p-3.5">
                <p className="font-semibold text-foreground">{title || "Untitled listing"}</p>
                <p className="text-lg font-bold text-foreground">
                  {isRentable && rentDaily ? `${formatPrice(Number(rentDaily))}/day` : formatPrice(Number(price) || 0)}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="secondary">{CONDITION_LABELS[condition]}</Badge>
                  {isSellable && <Badge variant="outline">Sell</Badge>}
                  {isRentable && <Badge variant="accent">Rent</Badge>}
                  {isExchangeable && <Badge variant="accent">Exchange</Badge>}
                </div>
                <p className="pt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <Button onClick={publish} disabled={publishing} className="w-full" size="lg">
              {publishing ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
              Publish listing
            </Button>
          </div>
        )}
      </div>

      {step < STEPS.length - 1 && (
        <div className="mt-5 flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft size={15} /> Back
          </Button>
          <div className="text-right">
            {!canAdvance() && <p className="mb-1 text-xs text-muted-foreground">{validationMessage}</p>}
            <Button onClick={() => canAdvance() && setStep((s) => s + 1)} disabled={!canAdvance()}>
              Next <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}
      {step === STEPS.length - 1 && (
        <div className="mt-5">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))}>
            <ChevronLeft size={15} /> Back
          </Button>
        </div>
      )}
    </div>
  );
}
