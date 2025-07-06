"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { IdeaFeed } from "./idea-feed";

export function ClientHome() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                YazamutForum
              </Link>
              <span className="text-sm text-gray-500 hidden sm:inline">
                From idea to team in 30 days
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {session ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {session.user?.name ?? session.user?.email}
                  </span>
                  <Link
                    href="/api/auth/signout"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Sign out
                  </Link>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50">
        <IdeaFeed currentUserId={session?.user?.id} />
      </main>
    </>
  );
}
