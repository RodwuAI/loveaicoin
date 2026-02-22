'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// 12个真实分类 + 图标/颜色映射
const categoryMeta: Record<string, { icon: string; color: string }> = {
  'AI基础入门': { icon: '🤖', color: 'from-purple-500/20 to-indigo-500/20' },
  'Prompt工程': { icon: '💬', color: 'from-emerald-500/20 to-teal-500/20' },
  'AI编程': { icon: '💻', color: 'from-green-500/20 to-emerald-500/20' },
  'AI图像生成': { icon: '🎨', color: 'from-pink-500/20 to-rose-500/20' },
  'AI写作': { icon: '✍️', color: 'from-blue-500/20 to-cyan-500/20' },
  'AI视频制作': { icon: '🎬', color: 'from-red-500/20 to-orange-500/20' },
  'AI音频处理': { icon: '🎵', color: 'from-violet-500/20 to-purple-500/20' },
  'AI商业应用': { icon: '📈', color: 'from-amber-500/20 to-yellow-500/20' },
  'AI工具评测': { icon: '🔧', color: 'from-gray-500/20 to-slate-500/20' },
  'AI安全与伦理': { icon: '🛡️', color: 'from-red-500/20 to-pink-500/20' },
  '区块链与Web3': { icon: '⛓️', color: 'from-blue-500/20 to-indigo-500/20' },
  '高级AI技术': { icon: '🧠', color: 'from-indigo-500/20 to-violet-500/20' },
};

const difficultyLabel = (d: number) =>
  d === 1 ? '入门' : d === 2 ? '基础' : d === 3 ? '进阶' : '高级';
const difficultyColor = (d: number) =>
  d === 1 ? 'bg-green-50 text-green-600' :
  d === 2 ? 'bg-blue-50 text-blue-600' :
  d === 3 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600';
const rewardByDifficulty = (d: number) =>
  d === 1 ? 10 : d === 2 ? 20 : d === 3 ? 40 : 80;

function Stars({ count }: { count: number }) {
  return (
    <span className="text-sm">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className={i < count ? 'text-gold' : 'text-gray-300'}>★</span>
      ))}
    </span>
  );
}

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeSort, setActiveSort] = useState('最新');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>(['全部']);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const allCourses = data || [];
        setCourses(allCourses);

        // 从数据中提取实际分类
        const cats = [...new Set(allCourses.map((c: any) => c.category))].filter(Boolean).sort();
        setCategories(['全部', ...cats]);
      } catch (err: any) {
        setError(err.message || '加载课程失败');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // 排序逻辑
  const sortedCourses = [...courses].sort((a, b) => {
    if (activeSort === '最新') return 0; // 已按created_at desc
    if (activeSort === '难度') return (a.difficulty || 1) - (b.difficulty || 1);
    if (activeSort === '时长') return (a.estimated_duration || 30) - (b.estimated_duration || 30);
    if (activeSort === '奖励') return (rewardByDifficulty(b.difficulty) - rewardByDifficulty(a.difficulty));
    return 0;
  });

  const filteredCourses =
    activeCategory === '全部'
      ? sortedCourses
      : sortedCourses.filter((c) => c.category === activeCategory);

  // 热门课程：取前5门（按分类多样性）
  const hotCourses = courses.slice(0, 5);
  // OpenClaw相关课程
  const openclawCourses = courses
    .filter((c) => {
      const t = (c.title || '').toLowerCase();
      const d = (c.description || '').toLowerCase();
      return t.includes('openclaw') || t.includes('agent') || t.includes('prompt') || d.includes('openclaw');
    })
    .slice(0, 5);

  const sortOptions = ['最新', '难度', '时长', '奖励'];

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pb-20 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Learn & Earn</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-6 tracking-tight">
            学习中心
          </h1>
          <p className="text-lg text-gray-500 max-w-[680px] mx-auto leading-relaxed">
            学习即挖矿，每一步都有价值 · 共 {courses.length} 门课程
          </p>
        </div>
      </section>

      {/* Featured Zones */}
      <section className="py-12 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 热门专区 */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center text-2xl">🔥</div>
                <div>
                  <h3 className="text-lg font-bold text-navy">热门专区</h3>
                  <p className="text-xs text-gray-400">最受欢迎的AI课程</p>
                </div>
              </div>
              <div className="space-y-3">
                {hotCourses.map((course) => {
                  const meta = categoryMeta[course.category] || { icon: '📚', color: '' };
                  return (
                    <Link href={`/learn/${course.id}`} key={course.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold/[0.03] transition-colors">
                      <span className="text-xl">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-navy truncate">{course.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="px-1.5 py-0.5 bg-gold/10 text-gold rounded text-[10px] font-semibold">{course.category}</span>
                          <span>{difficultyLabel(course.difficulty)}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gold font-semibold">{rewardByDifficulty(course.difficulty)} LAC</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Prompt & AI编程专区 */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy/10 to-gold/10 flex items-center justify-center text-2xl">💡</div>
                <div>
                  <h3 className="text-lg font-bold text-navy">Prompt & 编程 专区</h3>
                  <p className="text-xs text-gray-400">掌握与AI对话的艺术，释放生产力</p>
                </div>
              </div>
              <div className="space-y-3">
                {(openclawCourses.length > 0 ? openclawCourses : courses.filter(c => c.category === 'Prompt工程' || c.category === 'AI编程').slice(0, 5)).map((course) => {
                  const meta = categoryMeta[course.category] || { icon: '📚', color: '' };
                  return (
                    <Link href={`/learn/${course.id}`} key={course.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold/[0.03] transition-colors">
                      <span className="text-xl">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-navy truncate">{course.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${difficultyColor(course.difficulty)}`}>
                            {difficultyLabel(course.difficulty)}
                          </span>
                          <span>{course.estimated_duration || 30}分钟</span>
                        </div>
                      </div>
                      <span className="text-xs text-gold font-semibold">{rewardByDifficulty(course.difficulty)} LAC</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="card p-8 lg:p-10">
            <h2 className="text-xl font-bold text-navy mb-8">学习 Dashboard</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-3">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#E8EAF0" strokeWidth="8" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#C5975B" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40 * 0} ${2 * Math.PI * 40}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-navy">0%</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">总体进度</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl font-black text-navy mb-1">0</div>
                <span className="text-sm text-gray-500">已完成课程</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl font-black gold-text mb-1">0</div>
                <span className="text-sm text-gray-500">累计获得 LAC</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl font-black text-navy mb-1">Lv.1</div>
                <span className="text-sm text-gray-500">当前等级</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs + Sort + Course Grid */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-white text-gray-500 border border-[#E8EAF0] hover:border-gold-light hover:text-navy'
                }`}
              >
                {cat !== '全部' && (categoryMeta[cat]?.icon || '📚')} {cat}
                {cat === '全部' && ` (${courses.length})`}
                {cat !== '全部' && ` (${courses.filter(c => c.category === cat).length})`}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xs text-gray-400 mr-1">排序：</span>
            {sortOptions.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSort(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeSort === s
                    ? 'bg-gold/10 text-gold border border-gold/30'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">{filteredCourses.length} 门课程</span>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-500">加载课程中...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-lg font-bold text-gray-700 mb-2">加载失败</div>
              <div className="text-sm text-gray-500 mb-4">{error}</div>
              <button onClick={() => window.location.reload()} className="btn btn-secondary btn-sm">重新加载</button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📚</div>
              <div className="text-lg font-bold text-gray-700 mb-2">暂无课程</div>
              <div className="text-sm text-gray-500">该分类下还没有课程，敬请期待</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.slice(0, 30).map((course) => {
                const meta = categoryMeta[course.category] || { icon: '📚', color: 'from-gray-400/20 to-gray-500/20' };
                const reward = course.base_lac_reward || rewardByDifficulty(course.difficulty);
                const hasContent = !!(course.metadata?.chapter_content && course.metadata.chapter_content.length > 0);

                const cardInner = (
                  <div className={`card overflow-hidden group ${hasContent ? 'cursor-pointer hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-1' : 'opacity-75'} transition-all duration-300`}>
                    <div className={`h-40 bg-gradient-to-br ${meta.color} flex items-center justify-center relative`}>
                      <span className={`text-5xl ${hasContent ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>{meta.icon}</span>
                      {!hasContent && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-navy text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          🔜 即将上线
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gold bg-gold/10 px-2.5 py-0.5 rounded-full">{course.category}</span>
                        <Stars count={course.difficulty || 1} />
                      </div>
                      <h3 className={`text-lg font-bold text-navy mb-3 ${hasContent ? 'group-hover:text-gold' : ''} transition-colors duration-200 line-clamp-2`}>{course.title}</h3>
                      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                        <span>⏱ {course.estimated_duration || 30}分钟</span>
                        <span className="gold-text font-semibold">🏆 {reward} LAC</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${difficultyColor(course.difficulty)}`}>
                          {difficultyLabel(course.difficulty)}
                        </span>
                      </div>
                      {hasContent ? (
                        <div className="btn btn-primary btn-sm w-full group-hover:bg-navy transition-colors duration-200">开始学习</div>
                      ) : (
                        <div className="btn btn-sm w-full bg-gray-100 text-gray-400 cursor-not-allowed">即将上线</div>
                      )}
                    </div>
                  </div>
                );

                return hasContent ? (
                  <Link key={course.id} href={`/learn/${course.id}`}>{cardInner}</Link>
                ) : (
                  <div key={course.id}>{cardInner}</div>
                );
              })}
            </div>
          )}

          {/* Load more hint */}
          {filteredCourses.length > 30 && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-400">显示前 30 门课程，共 {filteredCourses.length} 门</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
