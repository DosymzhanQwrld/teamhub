import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: "https://teamhub-4tc5.onrender.com/api/uploadthing"
});