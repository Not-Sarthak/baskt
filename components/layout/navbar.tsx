"use client";
import { ChevronsDown, Github, Menu } from "lucide-react";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ToggleTheme } from "./toogle-theme";
import { ReferralDrawer } from "../layout/cards/referral";
import { Toaster } from "sonner";
import { ConnectButton } from "@mysten/dapp-kit";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: "/dashboard",
    label: "Baskets",
  },
  {
    href: "/create",
    label: "Create",
  },
  {
    href: "#",
    label: "Referral",
  },
  {
    href: "/portfolio",
    label: "Portfolio",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);

  const handleReferralClick = () => {
    setIsReferralOpen(true);
    setIsOpen(false); // Close mobile menu if open
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <header className="shadow-inner bg-opacity-15 w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center p-2 bg-card">
        <Link href="/" className="font-bold text-lg flex items-center">
          <ChevronsDown className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white" />
          Baskt
        </Link>

        {/* Mobile Menu */}
        <div className="flex items-center lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Menu
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer lg:hidden"
              />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
            >
              <div>
                <SheetHeader className="mb-4 ml-4">
                  <SheetTitle className="flex items-center">
                    <Link href="/" className="flex items-center">
                      <ChevronsDown className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white" />
                      Baskt
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-2">
                  {routeList.map(({ href, label }) => (
                    <Button
                      key={label}
                      onClick={() => {
                        if (label === "Referral") {
                          handleReferralClick();
                        } else {
                          setIsOpen(false);
                        }
                      }}
                      asChild={label !== "Referral"}
                      variant="ghost"
                      className="justify-start text-base"
                    >
                      {label !== "Referral" ? (
                        <Link href={href}>{label}</Link>
                      ) : (
                        label
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <SheetFooter className="flex-col sm:flex-col justify-start items-start">
                <Separator className="mb-2" />
                <ToggleTheme />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:block mx-auto">
          <NavigationMenuList>
            <NavigationMenuItem>
              {routeList.map(({ href, label }) => {
                if (label === "Referral") {
                  return (
                    <Button
                      key={label}
                      onClick={handleReferralClick}
                      variant="ghost"
                      className="text-base px-2"
                    >
                      {label}
                    </Button>
                  );
                }
                return (
                  <NavigationMenuLink key={href} asChild>
                    <Link href={href} className="text-base px-2">
                      {label}
                    </Link>
                  </NavigationMenuLink>
                );
              })}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ConnectButton />

        <div className="hidden lg:flex">
          <ToggleTheme />
          <Button asChild size="sm" variant="ghost" aria-label="View on GitHub">
            <Link
              aria-label="View on GitHub"
              href="https://github.com/Not-Sarthak/baskt.git"
              target="_blank"
            >
              <Github className="size-5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Referral Drawer */}
      <Sheet open={isReferralOpen} onOpenChange={setIsReferralOpen}>
        <ReferralDrawer
          isOpen={isReferralOpen}
          onClose={() => setIsReferralOpen(false)}
        />
      </Sheet>
    </>
  );
};
