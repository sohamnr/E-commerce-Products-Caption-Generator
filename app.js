function captionApp() {
  return {
    loading: false,
    dragging: false,
    hasImage: false,
    showResult: false,
    copied: false,
    error: "",
    status: "Ready.",
    file: null,
    fileName: "",
    previewUrl: "",
    result: null,

    get uploadZoneClass() {
      if (this.loading) return "border-[#c9a876]/70";
      if (this.dragging) return "border-[#c9a876] bg-white/90";
      return "border-stone-200 hover:border-[#c9a876]/50";
    },

    get formattedJson() {
      return this.result ? JSON.stringify(this.result, null, 2) : "{}";
    },

    handleFileSelect(event) {
      const [file] = event.target.files;
      this.setFile(file);
    },

    handleDrop(event) {
      this.dragging = false;
      const [file] = event.dataTransfer.files;
      this.setFile(file);
    },

    setFile(file) {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        this.setError("Please select an image file.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.setError("Image is too large. Please upload an image under 10MB.");
        return;
      }

      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }

      this.file = file;
      this.fileName = file.name;
      this.previewUrl = URL.createObjectURL(file);
      this.hasImage = true;
      this.showResult = false;
      this.result = null;
      this.error = "";
      this.status = "Image ready.";
      this.copied = false;
    },

    setError(message) {
      this.error = message;
      this.status = message;
      this.loading = false;
    },

    async submitUpload() {
      if (!this.file || this.loading) return;

      const formData = new FormData();
      formData.append("file", this.file);

      this.loading = true;
      this.error = "";
      this.showResult = false;
      this.status = "Uploading and analyzing image...";
      this.copied = false;

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Request failed.");
        }

        this.result = data;
        this.showResult = true;
        this.status = "Caption metadata generated.";
      } catch (error) {
        this.setError(error.message || "Something went wrong.");
      } finally {
        this.loading = false;
      }
    },

    async copyResult() {
      if (!this.result) return;

      await navigator.clipboard.writeText(this.formattedJson);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 1400);
    },
  };
}
