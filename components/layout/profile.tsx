"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { RefreshCw, Wallet, ArrowRight, Copy, Check, Key, Shield } from "lucide-react";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

interface WalletInfo {
  address: string;
  privateKey: string;
}

const ProfileComponent = () => {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [privateKey, setPrivateKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState<'address' | 'privateKey' | null>(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = () => {
    setIsLoading(true);
    setTimeout(() => {
      const savedWallet = localStorage.getItem("suiWallet");
      if (savedWallet) {
        setWallet(JSON.parse(savedWallet));
      }
      setIsLoading(false);
    }, 1000);
  };

  const createWallet = () => {
    setIsLoading(true);
    try {
      const keypair = new Ed25519Keypair();
      const newWallet = {
        address: keypair.getPublicKey().toSuiAddress(),
        privateKey: keypair.getSecretKey().toString(),
      };
      localStorage.setItem("suiWallet", JSON.stringify(newWallet));
      setWallet(newWallet);
    } catch (error) {
      console.error("Error creating wallet:", error);
    }
    setIsLoading(false);
  };

  const importWallet = () => {
    if (!privateKey.trim()) return;
    setIsLoading(true);
    try {
      const keypair = Ed25519Keypair.fromSecretKey(privateKey);
      const importedWallet = {
        address: keypair.getPublicKey().toSuiAddress(),
        privateKey: keypair.getSecretKey().toString(),
      };
      localStorage.setItem("suiWallet", JSON.stringify(importedWallet));
      setWallet(importedWallet);
    } catch (error) {
      console.error("Error importing wallet:", error);
    }
    setIsLoading(false);
  };

  const copyToClipboard = async (text: string, type: 'address' | 'privateKey') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading && !wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-[#f5f5f5] dark:bg-background">
        <Card className="w-full max-w-md bg-white dark:bg-card relative overflow-hidden">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-card/80 animate-pulse rounded-full mx-auto mb-4" />
            <div className="space-y-3">
              <div className="h-8 w-48 bg-gray-200 dark:bg-card/80 animate-pulse rounded mx-auto" />
              <div className="h-4 w-72 bg-gray-200 dark:bg-card/80 animate-pulse rounded mx-auto" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="h-10 w-full bg-gray-200 dark:bg-card/80 animate-pulse rounded-full" />
              <div className="h-12 w-full bg-gray-200 dark:bg-card/80 animate-pulse rounded-lg" />
            </div>
          </CardContent>
  
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="text-center space-y-4">
              <div className="shimmer text-xl font-medium">
                Initializing...
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-[#f5f5f5] dark:bg-background">
        <Card className="w-full max-w-2xl bg-white dark:bg-card">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Wallet Connected
                </CardTitle>
                <CardDescription>
                  Your secure gateway to DeFi investments
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={loadWallet}
                className="h-8 w-8 rounded-full"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 mt-6 p-4 bg-gray-50 dark:bg-card/80 rounded-xl">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Address</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => copyToClipboard(wallet.address, 'address')}
                  >
                    {copied === 'address' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <code className="block p-2 bg-gray-100 dark:bg-card rounded text-sm font-mono break-all">
                  {wallet.address}
                </code>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Private Key</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => copyToClipboard(wallet.privateKey, 'privateKey')}
                  >
                    {copied === 'privateKey' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <code className="block p-2 bg-gray-100 dark:bg-card rounded text-sm font-mono break-all">
                  {wallet.privateKey}
                </code>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push("/portfolio")}
                className="h-14 text-lg relative overflow-hidden group bg-indigo-500 hover:bg-indigo-600"
              >
                <span className="relative z-10 flex items-center gap-2">
                  View Portfolio
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                className="h-14 text-lg relative overflow-hidden group bg-primary hover:bg-primary/90"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Stacks
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#f5f5f5] dark:bg-background">
      <Card className="w-full max-w-md bg-white dark:bg-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Baskt</CardTitle>
          <CardDescription className="text-base">
            Your gateway to decentralized investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create" className="rounded-full">Create Wallet</TabsTrigger>
              <TabsTrigger value="import" className="rounded-full">Import Wallet</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl text-sm text-muted-foreground">
                Create a new wallet to start managing your digital assets securely.
              </div>
              <Button 
                onClick={createWallet} 
                className="w-full h-12 text-base bg-primary hover:bg-primary/90"
              >
                Create New Wallet
              </Button>
            </TabsContent>
            <TabsContent value="import" className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Enter your private key"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Button 
                  onClick={importWallet} 
                  className="w-full h-12 text-base bg-primary hover:bg-primary/90 rounded-2xl"
                  disabled={!privateKey.trim()}
                >
                  Import Existing Wallet
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileComponent;