import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 pb-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Coin Not Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The cryptocurrency you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
          <Link href="/">
            <Button>Back to Coin List</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
