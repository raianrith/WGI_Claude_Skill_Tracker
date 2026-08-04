"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { createClient } from "@/lib/supabase/client";

export function ProfilePhotoButton({
  personId,
  personName,
  avatarUrl,
  authUserId,
}: {
  personId: string;
  personName: string;
  avatarUrl?: string | null;
  authUserId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const displayUrl = preview ?? avatarUrl;

  function pickFile() {
    setError(null);
    inputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Pick an image file (jpg, png, webp).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Keep it under 2MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    startTransition(async () => {
      const supabase = createClient();
      const ext =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : file.type === "image/gif"
              ? "gif"
              : "jpg";
      const path = `${authUserId}/avatar.${ext}`;

      // Clear prior extensions so only one avatar file sticks around
      await supabase.storage
        .from("avatars")
        .remove([
          `${authUserId}/avatar.jpg`,
          `${authUserId}/avatar.png`,
          `${authUserId}/avatar.webp`,
          `${authUserId}/avatar.gif`,
        ]);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });

      if (uploadError) {
        setError(uploadError.message);
        setPreview(null);
        URL.revokeObjectURL(localPreview);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("people")
        .update({ avatar_url: publicUrl })
        .eq("id", personId);

      if (updateError) {
        setError(updateError.message);
        setPreview(null);
        URL.revokeObjectURL(localPreview);
        return;
      }

      URL.revokeObjectURL(localPreview);
      setPreview(publicUrl);
      router.refresh();
    });
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={pickFile}
        disabled={pending}
        title="Add or change your photo"
        className="group relative shrink-0 outline-none ring-offset-2 ring-offset-suede focus-visible:ring-2 focus-visible:ring-orange disabled:opacity-60"
      >
        <Avatar name={personName} url={displayUrl} size="sm" />
        <span className="absolute inset-0 flex items-center justify-center bg-suede/70 text-[9px] font-display tracking-wider text-white uppercase opacity-0 transition-opacity group-hover:opacity-100">
          {pending ? "…" : "Edit"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />
      {error && (
        <span className="absolute right-0 top-full z-10 mt-1 w-48 border border-orange bg-white px-2 py-1 text-xs text-dk-gray shadow">
          {error}
        </span>
      )}
    </div>
  );
}
