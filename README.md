# Bengkel App

Aplikasi manajemen bengkel berbasis Next.js, Material UI, dan Firebase.

## Requirements

- Node.js 20.9 atau lebih baru
- npm
- Firebase Project (dibuat melalui [Firebase Console](https://console.firebase.google.com/))
- Firebase Web App

## Firebase Setup

Sebelum menjalankan aplikasi, lakukan langkah berikut di Firebase Console:

1. Buat atau pilih Firebase Project.
2. Register Web App pada project tersebut.
3. Aktifkan **Cloud Firestore** (mode Production atau Test).
4. Aktifkan **Authentication** → Sign-in method → **Email/Password**.
5. Buat user pertama secara manual melalui Firebase Console → Authentication → Users.
6. Isi file `.env.local` dengan konfigurasi Firebase Web App (lihat bagian Environment).
7. Deploy `firestore.rules` ke Firebase sebelum production:
   ```bash
   firebase deploy --only firestore:rules
   ```

> **Catatan:** `firestore.rules` saat ini menggunakan baseline yang mengizinkan akses
> untuk semua pengguna yang sudah login. Rules akan diperketat setelah desain
> collection dan role selesai dirancang.

## Environment

Salin file contoh dan isi dengan konfigurasi Firebase Web App Anda:

```bash
cp .env.example .env.local
```

Kemudian isi `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> **Jangan** commit `.env.local` ke repository. File ini sudah terdaftar di `.gitignore`.

## Development

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Validation

```bash
npm run lint
npm run build
```

## Tech Stack

- [Next.js](https://nextjs.org/) — App Router
- [Material UI](https://mui.com/) — UI components
- [Firebase](https://firebase.google.com/) — Authentication & Firestore (Client SDK)
- TypeScript

