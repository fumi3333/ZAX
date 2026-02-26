'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Candidate {
  userId: string;
  nickname: string;
  affiliation: string;
  reasoning: string;
  statsVector: string | null;
  distance: number;
  contactEmail?: string | null;
}

export default function MatchingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await fetch('/api/matching/candidates');
        const data = await res.json();
        if (data.success) {
          setCandidates(data.candidates);
        } else {
          setError(data.message || data.error || 'マッチング候補の取得に失敗しました。');
        }
      } catch (e) {
        setError('エラーが発生しました。');
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium uppercase tracking-widest text-xs animate-pulse">Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl shadow-sm border border-red-100 max-w-md text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-semibold text-lg mb-2">アクセスできません</p>
          <p className="text-sm opacity-90 mb-4">{error}</p>
          <Link href="/diagnostic" className="inline-block bg-white text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors border border-red-200">
            診断を受ける
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            あなたと<span className="text-slate-900">価値観の合う</span>仲間たち
          </h1>
          <div className="mt-4 space-y-4">
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              学内であなたと感性が近く、気の合う友達やプロジェクトメンバーになれる可能性が高いユーザーを提案します。
            </p>
            <div className="bg-slate-100/50 rounded-xl p-4 max-w-2xl mx-auto border border-slate-200">
              <p className="text-xs text-slate-500 font-bold leading-relaxed text-left">
                ※当機能は、学内での健全な友達・仲間探しやプロジェクトメンバーとの出会いをサポートするものです。「出会い系サイト規制法」に定義されるインターネット異性紹介事業（恋愛や交際を主目的としたいわゆる出会い系サイト・マッチングアプリ）には該当しません。
              </p>
            </div>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-lg">現在、条件に合う候補が見つかりませんでした。</p>
            <p className="text-slate-400 text-sm mt-2">学内の利用者が増えるのをお待ちください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate, idx) => {
               // Calculate a pseudo-compatibility score just for UI (100 - (distance / 2) * 100 scaled)
               // pgvector cosine distance: 0 (exact match) to 2 (exact opposite).
               const compatibility = Math.max(0, Math.min(100, Math.round((1 - candidate.distance / 2) * 100)));
               
               return (
                <Card key={candidate.userId} className="overflow-hidden shadow-none transition-all duration-300 border-gray-200 rounded-none bg-white group">
                  <div className="h-1 w-full bg-black opacity-100 transition-opacity"></div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-800">
                          {candidate.nickname || "匿名ユーザー"}
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-500 mt-1">
                          {candidate.affiliation || "武蔵野大学"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">マッチ度</span>
                        <div className="text-2xl font-black text-slate-800">
                          {compatibility}<span className="text-sm font-bold text-slate-400 ml-1">%</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed italic relative">
                      <span className="text-2xl absolute -top-1 -left-1 text-slate-300">"</span>
                      <p className="relative z-10 px-2">{candidate.reasoning || "あなたと深い部分で価値観を共有しています。"}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-6 px-6">
                    <a 
                      href={candidate.contactEmail ? `mailto:${candidate.contactEmail}` : '#'} 
                      onClick={(e) => {
                        if (!candidate.contactEmail) {
                          e.preventDefault();
                          alert('相手の連絡先メールアドレスが設定されていません。');
                        }
                      }}
                      className="w-full"
                    >
                      <Button className="w-full bg-black hover:bg-gray-800 text-white transition-colors py-6 rounded-none font-bold uppercase tracking-widest text-xs shadow-none">
                        大学メールで連絡をとる
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
