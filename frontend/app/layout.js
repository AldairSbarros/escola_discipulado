export const metadata = {
  title: 'Escola de Discipulado Digital',
  description: 'Curso interativo de discipulado com IA, vídeos e quizzes',
  manifest: '/manifest.json',
  themeColor: '#1e3a8a',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}