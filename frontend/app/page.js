'use client';

import { useState } from 'react';
import { BookOpen, Play, Headphones, MessageCircle, Radio, Users, Upload, Loader2 } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<{ success: boolean; job?: string; collection?: string; message?: string } | null>(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (whatsapp.length > 8) {
      setIsLoggedIn(true);
    }
  };

  const handleIngestModule = async () => {
    setIsIngesting(true);
    setIngestionStatus(null);
    try {
      const response = await fetch('/api/escola/ingestao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: '../conteudos/Escola_Discipulado_Modulo1.docx',
          fileName: 'Escola_Discipulado_Modulo1.docx',
          colecao: 'escola_discipulado'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha na ingestão');

      setIngestionStatus({ success: true, job: data.job_id, collection: data.colecao });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setIngestionStatus({ success: false, message: msg });
    } finally {
      setIsIngesting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <BookOpen className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Escola de Discipulado</h1>
            <p className="text-gray-600 mt-2">Acesse com seu WhatsApp</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(92) 99999-9999"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-xl font-bold">Escola de Discipulado</h1>
          </div>
          <div className="text-sm">Módulo 1</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-4xl mx-auto">
        {/* Painel de Admin / Ingestão */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Ingestão de Conteúdo (Multitenant)
            </h2>
            <button
              onClick={handleIngestModule}
              disabled={isIngesting}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {isIngesting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Processar Módulo 1'}
            </button>
          </div>

          {ingestionStatus && (
            <div className={`p-3 rounded-lg text-sm ${ingestionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {ingestionStatus.success ? (
                <>
                  <strong>Sucesso!</strong> Job ID: {ingestionStatus.job}. Coleção: {ingestionStatus.collection}.
                  O conteúdo já está sendo vetorizado no Qdrant.
                </>
              ) : (
                <><strong>Erro:</strong> {ingestionStatus.message}</>
              )}
            </div>
          )}
        </div>

        {/* Progresso */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Seu Progresso</h2>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: '15%' }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">1 de 10 ministrações completadas</p>
        </div>

        {/* Menu Principal */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <Play className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Vídeos</span>
          </button>

          <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <Headphones className="w-8 h-8 mx-auto text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Áudios TTS</span>
          </button>

          <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <MessageCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Quiz</span>
          </button>

          <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <Radio className="w-8 h-8 mx-auto text-red-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">WebRádio</span>
          </button>
        </div>

        {/* Lições */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ministrações do Módulo 1</h2>

          <div className="space-y-3">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="font-medium text-gray-800">1. A Bíblia</h3>
              <p className="text-sm text-gray-600">Concluída ✓</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2 cursor-pointer hover:bg-blue-50">
              <h3 className="font-medium text-gray-800">2. Panorama do AT</h3>
              <p className="text-sm text-gray-600">Em andamento</p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4 py-2 opacity-60">
              <h3 className="font-medium text-gray-800">3. Panorama do NT</h3>
              <p className="text-sm text-gray-600">Bloqueada</p>
            </div>
          </div>
        </div>

        {/* Botão Videoconferência */}
        <button className="w-full mt-6 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Entrar na Sala ao Vivo</span>
        </button>
      </main>
    </div>
  );
}