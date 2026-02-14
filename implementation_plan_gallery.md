# Implementation Plan: Central Media Gallery (Atelier Assets)

## Objective
Create a unified "Gallery" where the user can upload and manage images once, then reuse them for Products, Banners, and branding without re-uploading.

---

## 🏗 Phase 1: Database Architecture
Add a new `MediaAsset` model to track all uploaded files in the database.

```prisma
// File: prisma/schema.prisma
model MediaAsset {
  id        String   @id @default(cuid())
  url       String   // Storage path or cloud URL
  filename  String
  type      String   @default("image")
  size      Int?     // Optional: size in bytes
  createdAt DateTime @default(now())
}
```

---

## 🚀 Phase 2: Backend Logic (Server Actions)
Create `src/app/actions/media.ts` to handle file operations.

1. **`getMediaAssets`**: Retrieves all gallery items sorted by date.
2. **`uploadToGallery`**: 
   - Handles `FormData` (file upload).
   - Saves file to `/public/uploads/gallery`.
   - Creates a record in the `MediaAsset` table.
3. **`deleteFromGallery`**: Removes the record and deletes the physical file.

---

## 🎨 Phase 3: Gallery Management Page
Create `src/app/dashboard/gallery/page.tsx`.

- **Gallery Grid**: A premium, visually dense grid of all assets.
- **Bulk Upload**: Drag-and-drop zone using standard HTML5 file API.
- **Asset Metadata**: View dimensions and file size on hover.
- **Copy URL**: Fast one-click copy for manual usage.

---

## 🛠 Phase 4: Integrated Media Picker Component
Create `src/components/MediaPicker.tsx` — a reusable modal used across the dashboard.

- **Tab 1: "Upload From PC"**: Immediate upload and selection.
- **Tab 2: "Atelier Library"**: Browse the central gallery and select existing images.
- **Feature**: Multi-selection support for product galleries.

---

## 🔄 Phase 5: Dashboard Integration
1. **Inventory Page (`/dashboard/inventory`)**:
   - Update the "Add Product" and "Edit Product" modals.
   - Replace the image URL text box with the "Select/Upload" button.
2. **Banners Page (`/dashboard/website/banners`)**:
   - Update the banner setup to use the Media Picker.
3. **Settings Page**:
   - Use the picker for Logo and Favicon selection.

---

## 💡 Recommended Next Steps
1. **Cloud Storage**: For a professional live site, we should eventually move images from `/public` to a service like **Cloudinary** or **Uploadthing**. This ensures images load fast globally and don't take up server disk space.
2. **Image Optimization**: Automatically generate small thumbnails for the gallery grid to keep the dashboard fast.
