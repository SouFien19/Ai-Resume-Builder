'use client';

import { SignIn } from "@clerk/nextjs";
import AiIcon from "@/components/icons/AiIcon";
import DocumentIcon from "@/components/icons/DocumentIcon";
import AchievementIcon from "@/components/icons/AchievementIcon";

export default function Page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full">
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-12 text-white relative overflow-hidden">
        
        {/* Floating Icons */}
        <AiIcon className="absolute top-20 left-10 w-24 h-24 text-white/10 animate-float" />
        <DocumentIcon className="absolute bottom-10 right-20 w-32 h-32 text-white/10 animate-float-delay-1" />
        <AchievementIcon className="absolute top-1/2 left-1/3 w-20 h-20 text-white/10 animate-float-delay-2" />

        <div className="text-center z-10">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">ResumeCraft AI</h1>
          <p className="text-xl text-gray-300">
            Build your professional resume with the power of AI.
          </p>
        </div>
      </div>

      {/* Right Panel: Sign In Form */}
      <div className="flex flex-col justify-center items-center bg-gray-50 p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
             <h1 className="text-3xl font-bold tracking-tight text-gray-900">ResumeCraft AI</h1>
          </div>
           <div className="bg-white p-8 rounded-2xl shadow-lg w-full">
             <SignIn path="/sign-in" routing="path" />
           </div>
        </div>
      </div>
    </div>
  );
}
