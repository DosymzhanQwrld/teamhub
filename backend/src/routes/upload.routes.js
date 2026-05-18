import { createUploadthing, createRouteHandler } from "uploadthing/express";

const f = createUploadthing();

const uploadRouter = {
  avatarUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(() => {
      return {};
    })
    .onUploadComplete(({ file }) => {
      return { url: file.url, key: file.key, name: file.name, type: file.type };
    }),

  attachmentUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 4 },
    pdf: { maxFileSize: "8MB", maxFileCount: 4 }
  })
    .middleware(() => {
      return {};
    })
    .onUploadComplete(({ file }) => {
      return { url: file.url, key: file.key, name: file.name, type: file.type };
    })
};

export default createRouteHandler({ 
  router: uploadRouter,
  config: {
    callbackUrl: "https://teamhub-4tc5.onrender.com/api/uploadthing"
  }
});