"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { PhotoGallery, type GalleryPhoto } from "@/components/PhotoGallery";
import { PhotoUpload } from "@/components/PhotoUpload";

export function ClubPhotoGallery({
  clubId,
  initialPhotos,
  locale,
}: {
  clubId: string;
  initialPhotos: GalleryPhoto[];
  locale: string;
}) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMember, setIsMember] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      setCurrentUser(user);
      if (!user) return;
      const { data: membership } = await supabase
        .from("club_members")
        .select("id")
        .eq("club_id", clubId)
        .eq("user_id", user.id)
        .maybeSingle();
      setIsMember(!!membership);
    });
  }, [supabase, clubId]);

  const label = locale === "he" ? "גלריה" : "Gallery";

  if (photos.length === 0 && !isMember) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold tracking-tight">
          {label}{" "}
          {photos.length > 0 && (
            <span className="ur-chip text-[10px] uppercase tracking-wider ms-2">{photos.length}</span>
          )}
        </h2>
        {isMember && (
          <PhotoUpload
            target={{ mode: "club", entityId: clubId }}
            onUploaded={(p) => setPhotos((prev) => [p, ...prev])}
            locale={locale}
          />
        )}
      </div>
      {photos.length === 0 ? (
        <div className="text-sm text-[color:var(--ur-fg-3)]">
          {locale === "he"
            ? "עדיין אין תמונות. לחץ על 'הוסף תמונות' כדי להתחיל."
            : "No photos yet. Click 'Add photos' to get started."}
        </div>
      ) : (
        <PhotoGallery
          photos={photos}
          currentUser={isMember ? currentUser : null}
          deleteTarget={{ table: "club_photos", ownerField: null }}
          onDeleted={(id) => setPhotos((prev) => prev.filter((p) => p.id !== id))}
        />
      )}
    </section>
  );
}
