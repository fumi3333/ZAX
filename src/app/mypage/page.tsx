import MyPageClient from './MyPageClient';

export const metadata = {
  title: '変遷ログ | ZAX',
  description: '過去の診断レポートと6Dベクトルの変化を確認できます。',
};

export default function MyPage() {
  return <MyPageClient />;
}
