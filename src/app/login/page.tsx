'use client';

import { useActionState } from 'react';
import { manualLogin } from '@/lib/actions/manual-auth';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(manualLogin, { message: "" });

  return (
    <main className="flex items-center justify-center md:h-screen bg-slate-50">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex w-full items-end rounded-lg bg-indigo-600 p-3 md:h-36 mb-4">
          <div className="w-32 text-white md:w-36 text-4xl font-bold">ZAX</div>
        </div>
        
        <form action={formAction} className="space-y-3">
          <div className="flex-1 rounded-lg bg-white px-6 pb-4 pt-8 shadow-sm border border-slate-200">
            <h1 className="mb-3 text-2xl font-bold text-slate-900">
              ログイン
            </h1>
            <div className="w-full">
              <div>
                <label
                  className="mb-3 mt-5 block text-xs font-medium text-slate-900"
                  htmlFor="email"
                >
                  メールアドレス
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-md border border-slate-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-slate-500 text-slate-900"
                    id="email"
                    type="email"
                    name="email"
                    placeholder="大学のメールアドレスを入力"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label
                  className="mb-3 mt-5 block text-xs font-medium text-slate-900"
                  htmlFor="password"
                >
                  パスワード
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-md border border-slate-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-slate-500 text-slate-900"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="パスワードを入力"
                    required
                    minLength={1}
                  />
                </div>
              </div>
            </div>
            <LoginButton pending={isPending} />
            <div
              className="flex h-8 items-end space-x-1"
              aria-live="polite"
              aria-atomic="true"
            >
              {state.message && (
                <p className="text-sm text-red-500">{state.message}</p>
              )}
            </div>
          </div>
        </form>
        
        <div className="text-center text-sm">
          アカウントをお持ちでないですか？{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            新規登録はこちら
          </Link>
        </div>
      </div>
    </main>
  );
}

function LoginButton({ pending }: { pending: boolean }) {
  return (
    <button
      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center transition-colors"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? 'ログイン中...' : 'ログイン'}
    </button>
  );
}
