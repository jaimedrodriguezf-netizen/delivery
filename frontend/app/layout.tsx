import React from 'react';

export const metadata = {
  title: 'Envíos Logísticos Quito - Checkout',
  description: 'Plataforma modular de envíos estándar para Quito (Fase 1)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-900 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
