import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-[72px] min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-black text-navy mb-4">404</div>
        <h1 className="text-2xl font-bold text-navy mb-4">页面未找到</h1>
        <p className="text-gray-500 mb-8">抱歉，您访问的页面不存在。</p>
        <Link href="/" className="btn btn-primary">
          返回首页
        </Link>
      </div>
    </div>
  );
}