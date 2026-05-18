"use client";

import { useUploadThing } from "../lib/uploadthing";

export default function UploadButton({ endpoint, onUploaded, onLocalSelect, children }) {
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (files) => {
      if (files?.[0]) {
        onUploaded(files[0]);
      }
    },
    onUploadError: (error) => {
      alert(`Upload failed: ${error.message}`);
    }
  });

  return (
    <button
      type="button"
      disabled={isUploading}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = endpoint === "avatarUploader" ? "image/*" : "image/*,application/pdf";
        input.onchange = async () => {
          if (input.files?.length) {
            const file = input.files[0];

            if (endpoint === "avatarUploader" && onLocalSelect) {
              const localUrl = URL.createObjectURL(file);
              onLocalSelect(localUrl);
            }

            await startUpload([file]);
          }
        };
        input.click();
      }}
    >
      {isUploading ? "Uploading..." : children}
    </button>
  );
}