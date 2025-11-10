import { UploadForm } from "@/components/upload-form";

export default function Ltcat() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Upload de PDF</h1>
      <UploadForm />
    </div>
  );
}
