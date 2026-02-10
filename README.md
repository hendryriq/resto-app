# Restaurant POS System (Frontend)

System Point of Sale (POS) berbasis web untuk manajemen restoran, dibangun dengan React, TypeScript, dan Vite. Aplikasi ini mencakup fitur untuk manajemen meja, pemesanan, menu, dan struk pembayaran.

> **Note**: Frontend ini terhubung dengan backend yang memiliki repository terpisah. Silakan cek [hendryriq/resto-api](https://github.com/hendryriq/resto-api) untuk setup backend.

## Fitur Utama

- **Authentication**: Login aman untuk staff/kasir.
- **Dashboard**:
  - Monitoring status meja secara real-time (Available, Occupied).
  - Quick stats (Meja terisi vs kosong).
  - Toggle view antara Grid dan List.
- **Manajemen Pesanan (Orders)**:
  - Membuat pesanan baru per meja.
  - Menyimpan draft pesanan (Auto-save).
  - Mengirim pesanan ke dapur (Send to Kitchen).
  - Menutup pesanan (Close Order) dan cetak struk (Receipt).
  - Riwayat pesanan (Order History).
- **Manajemen Menu**: CRUD untuk item makanan dan minuman.
- **Guest View**: Tampilan publik untuk tamu melihat status meja restoran.

## Teknologi yang Digunakan

- **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Component Library**: [Material UI (MUI)](https://mui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (Versi 18 atau lebih baru direkomendasikan).
- Backend API server yang sudah berjalan. Source code backend dapat diakses di: [https://github.com/hendryriq/resto-api](https://github.com/hendryriq/resto-api).

## Instalasi & Setup

1.  **Clone repository ini:**
    ```bash
    git clone <repository_url>
    cd resto-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variables:**
    Buat file `.env` di root direktori project (sejajar dengan `package.json`). Anda bisa menyalin format di bawah ini:

    ```env
    # URL Backend API Anda
    VITE_API_BASE_URL=http://localhost:8000/api
    ```

4.  **Jalankan server development:**
    ```bash
    npm run dev
    ```
    Aplikasi biasanya akan berjalan di `http://localhost:5173`.

## 📂 Struktur Project

```
src/
├── components/     # Komponen UI reusable (Layout, Common)
├── pages/          # Halaman aplikasi (Dashboard, Orders, Menu, Login)
├── services/       # Logic API calls (authService, orderService, etc.)
├── store/          # Global state management (Zustand)
├── types/          # TypeScript definitions
├── App.tsx         # Main entry component & routing
└── main.tsx        # Application root
```