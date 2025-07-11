import Link from "next/link";
import { Card,CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, ShieldCheck, User } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Guard Card */}
        <Card className="shadow-xl hover:shadow-2xl transition rounded-2xl">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <ShieldCheck className="h-12 w-12 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Employee (Guard)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Proceed to check-in/out visitors and validate QR/OTP codes.
            </p>
            <Link href="/guard-view" passHref>
              <Button className="w-full cursor-pointer" variant="default">
                Login as Guard
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Client Card */}
        <Card className="shadow-xl hover:shadow-2xl transition rounded-2xl">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <UserCog className="h-12 w-12 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Client (Admin)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Schedule and manage visitor passes and monitor visit logs.
            </p>
            <Link href="/client-view/sign-in" passHref>
              <Button className="w-full cursor-pointer" variant="default">
                Login as Client
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* End User Card */}
        <Card className="shadow-xl hover:shadow-2xl transition rounded-2xl">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <User className="h-12 w-12 text-purple-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">End User</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Review and approve visitor requests assigned to you.
            </p>
            <Link href="/end-user-view/sign-in" passHref>
              <Button className="w-full cursor-pointer" variant="default">
                Login as End User
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
