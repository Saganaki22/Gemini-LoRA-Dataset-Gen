<div align="center">

# 🍌 Gemini LoRA Dataset Generator

**All-in-one LoRA training dataset creation powered by Google Gemini**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Gemini-API-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)

*A [Nano Banana Pro](https://drbaph.is-a.dev/Gemini-LoRA-Dataset-Gen/) Tool*

</div>

![11](https://github.com/user-attachments/assets/70440703-5183-43af-aab1-bc973eec90ce)


---

## ✨ Features

### 🎨 Three Generation Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Pair** | Generate START → END transformation pairs | Training LoRAs that learn specific changes (zoom, lighting, style transfer) |
| **Single** | Generate individual styled images | Style LoRAs without transformations |
| **Reference** | Generate variations from uploaded images | Character consistency, product variations |

### 🤖 Flexible Captioning Models

| Model | Best For | Speed | Quality |
|-------|----------|-------|---------|
| **Gemini 3 Pro** | Premium quality captions | ⭐ | ⭐⭐⭐ |
| **Gemini 3 Flash** | Balanced speed & quality | ⭐⭐ | ⭐⭐ |
| **Gemini 2.5 Flash** | Fast & economical | ⭐⭐⭐ | ⭐ |

### 🚀 Key Features

- **🔒 Secure** - API key stored encrypted locally in your browser
- **⚡ Fast** - Parallel processing up to 10 images simultaneously  
- **📊 Live Console** - Real-time progress tracking with A-A font size control
- **🖼️ Gallery View** - Click any image to view full-size with navigation
- **✏️ Edit Captions** - Edit generated captions with auto-save
- **🔄 Rerun Anytime** - Regenerate individual images or just captions
- **📦 ZIP Export** - Download dataset with images + caption text files
- **🏷️ Trigger Words** - Prepend trigger words to all captions automatically
- **📷 Multi-Reference** - Upload up to 6 reference images per generation (Reference mode)

---

## 🛠️ Tech Stack

```
├── Frontend
│   ├── React 19 + TypeScript 5.9
│   ├── Vite 7 (Build tool)
│   ├── Tailwind CSS 3 + shadcn/ui
│   └── Lucide Icons
├── API
│   ├── Gemini 3 Pro Image Preview (Image Generation)
│   └── Gemini 3 Pro / 3 Flash / 2.5 Flash (Captioning)
└── Storage
    └── Encrypted LocalStorage (API Key)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/Saganaki22/Gemini-LoRA-Dataset-Gen.git
cd Gemini-LoRA-Dataset-Gen/app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
# Output in ./dist folder
```

---

## 📖 Usage Guide

### 1. Enter API Key
Your API key is encrypted and stored locally in your browser. Never sent to any server except Google's API.

### 2. Select Generation Mode
- **Pair Mode**: For transformation datasets (before/after pairs)
- **Single Mode**: For style/aesthetic datasets
- **Reference Mode**: For consistency datasets (upload 1-6 reference images)

### 3. Configure Settings
Click the settings card to open the full editor:
- **Theme/Style**: Describe your subject matter or aesthetic
- **Transformation** (Pair mode only): Describe the change to learn
- **Trigger Word**: Optional word prepended to all captions

### 4. Adjust Options
- **Resolution**: 1K or 2K quality
- **Aspect Ratio**: Auto, 1:1, 16:9, 9:16, 4:3, 3:4, 5:4, 4:5
- **Number of Images/Pairs**: Total to generate
- **Parallel Requests**: How many to process at once (1-10)

### 5. Generate & Export
1. Click **Start Generation**
2. Watch progress in real-time
3. Click any image to view/edit caption
4. Click **Export ZIP** when done

---

## 📁 Output Format

ZIP file contains:
```
dataset_2024-01-15.zip
├── pair_0001_start.png    # START image (Pair mode)
├── pair_0001_end.png      # END image (Pair mode)
├── pair_0001.txt          # Caption with trigger word
├── image_0001.png         # Single mode
├── image_0001.txt
├── variation_0001.png     # Reference mode
├── variation_0001.txt
└── ...
```

---

## 🔒 Security

- API keys are encrypted before storing in localStorage
- No data is sent to any third-party servers
- All processing happens client-side
- Reference images are processed locally

---

## 🤝 Part of Nano Banana Pro

This tool is part of the [Nano Banana Pro](https://drbaph.is-a.dev/Gemini-LoRA-Dataset-Gen/) ecosystem - a suite of AI-powered creative tools.

### Related Tools
- [Jewelry Studio Pro](https://github.com/Saganaki22/Jewelry-Studio-PRO) - Product photography batch engine
- [Gemini Img Tagger](https://github.com/Saganaki22/Gemini-Img-tagger) - Image captioning tool

---

## 📝 License

MIT License - Feel free to use, modify, and distribute.

---

## Credits

- Powered by [Google Gemini API](https://ai.google.dev/)
- UI Components by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---
>
