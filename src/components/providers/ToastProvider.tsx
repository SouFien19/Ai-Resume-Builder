"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export default function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:dark:border-gray-800 group-[.toaster]:shadow-lg",
          title: "group-[.toast]:text-gray-900 group-[.toast]:dark:text-white group-[.toast]:font-semibold",
          description: "group-[.toast]:text-gray-600 group-[.toast]:dark:text-gray-400",
          actionButton: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-pink-500 group-[.toast]:to-orange-500 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:dark:bg-gray-800 group-[.toast]:text-gray-700 group-[.toast]:dark:text-gray-300",
          closeButton: "group-[.toast]:bg-white group-[.toast]:dark:bg-gray-900 group-[.toast]:border-gray-200 group-[.toast]:dark:border-gray-800",
          success: "group-[.toast]:border-green-200 group-[.toast]:dark:border-green-900",
          error: "group-[.toast]:border-red-200 group-[.toast]:dark:border-red-900",
          warning: "group-[.toast]:border-orange-200 group-[.toast]:dark:border-orange-900",
          info: "group-[.toast]:border-pink-200 group-[.toast]:dark:border-pink-900",
        },
      }}
    />
  );
}
