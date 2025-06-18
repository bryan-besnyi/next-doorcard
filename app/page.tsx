import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-grow flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Faculty Doorcard App
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create and manage your office hours and class schedules
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register">Register</Link>
            </Button>
            <div className="text-center text-sm">
              <Link
                href="/dashboard"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
