import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { api, HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth";
import { IdeaDetail } from "~/app/_components/idea-detail";

interface IdeaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function IdeaPage({ params }: IdeaPageProps) {
  const session = await auth();
  const { id } = await params;

  try {
    // Prefetch the idea data
    void api.idea.getById.prefetch({ id });
    void api.comment.getByIdea.prefetch({ ideaId: id });
    
    return (
      <HydrateClient>
        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Ideas</span>
                </Link>
                <div className="w-px h-6 bg-gray-300" />
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  YazamutForum
                </Link>
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
          <IdeaDetail ideaId={id} currentUserId={session?.user?.id} />
        </main>
      </HydrateClient>
    );
  } catch {
    notFound();
  }
}
