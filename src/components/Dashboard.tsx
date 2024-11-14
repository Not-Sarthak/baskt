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
import { RefreshCw } from "lucide-react";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

interface WalletInfo {
  address: string;
  privateKey: string;
}

const DashboardComponent = () => {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [privateKey, setPrivateKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const navigateToBuckets = () => {
    router.push("/buckets");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Wallet Connected</CardTitle>
              <CardDescription>Address: {wallet.address}</CardDescription>
              <CardDescription className="mt-2">
                Private Key: {wallet.privateKey}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={loadWallet}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push("/portfolio")}
                className="flex-1"
              >
                View Portfolio
              </Button>
              <Button onClick={navigateToBuckets} className="flex-1">
                Buy Buckets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Sui Fund</CardTitle>
          <CardDescription>
            Create or import your wallet to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="create">Create Wallet</TabsTrigger>
              <TabsTrigger value="import">Import Wallet</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <Button onClick={createWallet} className="w-full">
                Create New Wallet
              </Button>
            </TabsContent>
            <TabsContent value="import">
              <div className="space-y-4">
                <Input
                  placeholder="Enter your private key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
                <Button onClick={importWallet} className="w-full">
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

export default DashboardComponent;
