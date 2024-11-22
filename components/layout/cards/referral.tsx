"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReferralDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralDrawer = ({ isOpen, onClose }: ReferralDrawerProps) => {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://baskt.com/ref/123456";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy referral link");
    }
  };

  return (
    <SheetContent
      side="right"
      className="w-full sm:w-[400px]"
      onInteractOutside={onClose}
      onEscapeKeyDown={onClose}
    >
      <SheetHeader className="mb-6">
        <SheetTitle>Invite Friends</SheetTitle>
        <SheetDescription>
          Share your referral link with friends and earn rewards when they join!
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Your Referral Link</h4>
          <div className="flex space-x-2">
            <Input readOnly value={referralLink} className="flex-1" />
            <Button onClick={copyToClipboard} size="icon" variant="outline">
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Lifetime Earnings: $0.00</h4>
          <div className="grid gap-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">No. of Referrals</p>
                <p className="text-sm text-muted-foreground">0</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Referral Volume</p>
                <p className="text-sm text-muted-foreground">0 USD</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Share via</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                const text = `Check out Baskt! Use my referral link: ${referralLink}`;
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    text
                  )}`,
                  "_blank"
                );
              }}
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                const text = `Check out Baskt! Use my referral link: ${referralLink}`;
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(text)}`,
                  "_blank"
                );
              }}
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      <SheetFooter className="mt-6">
        <Button className="w-full" onClick={copyToClipboard}>
          {copied ? "Copied!" : "Copy Referral Link"}
        </Button>
      </SheetFooter>
    </SheetContent>
  );
};
