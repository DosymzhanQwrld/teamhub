import { createUploadthing, createRouteHandler } from "uploadthing/express";

const f = createUploadthing();

const uploadRouter = {
  avatarUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(() => {
      // Проверяем в консоли бэкенда, доходит ли запрос сюда и видны ли ключи
      console.log("Uploadthing middleware triggered. Secret Key exists:", !!process.env.UPLOADTHING_SECRET);
      return {};
    })
    .onUploadComplete(({ file }) => {
      console.log("Avatar upload complete! URL:", file.url);
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
      console.log("Attachment upload complete! URL:", file.url);
      return { url: file.url, key: file.key, name: file.name, type: file.type };
    })
};

export default createRouteHandler({ 
  router: uploadRouter,
  config: {
    callbackUrl: "http://localhost:5000/api/uploadthing",
    isDev: true
  }
});