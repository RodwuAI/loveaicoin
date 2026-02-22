'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { quizAPI, miningLearnAPI } from '@/lib/api';

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
  d === 1 ? 'bg-green-100 text-green-700 border-green-200' :
  d === 2 ? 'bg-blue-100 text-blue-700 border-blue-200' :
  d === 3 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-700 border-red-200';
const rewardByDifficulty = (d: number) =>
  d === 1 ? 10 : d === 2 ? 20 : d === 3 ? 40 : 80;

export default function CourseDetailClient() {
  const params = useParams();
  const id = params?.id as string;
  const { isLoggedIn, token } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [relatedCourses, setRelatedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());
  const [showingContent, setShowingContent] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchCourse = async () => {
      try {
        const { data, error: err } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();

        if (err) throw err;
        setCourse(data);

        // Fetch related courses in same category
        if (data?.category) {
          const { data: related } = await supabase
            .from('courses')
            .select('id, title, category, difficulty, estimated_duration')
            .eq('category', data.category)
            .neq('id', id)
            .limit(4);
          setRelatedCourses(related || []);
        }
      } catch (err: any) {
        setError(err.message || '课程不存在');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const toggleChapter = (index: number) => {
    const next = new Set(completedChapters);
    next.has(index) ? next.delete(index) : next.add(index);
    setCompletedChapters(next);
  };

  const startLearning = () => {
    if (!isLoggedIn) {
      window.__toast?.('请先登录后开始学习 🔐');
      return;
    }

    const chapters = course.metadata?.chapter_titles || course.metadata?.chapter_content || [];
    const hasContent = chapters.length > 0;
    const hasQuiz = course.metadata?.quiz && course.metadata.quiz.length > 0;
    
    if (hasContent) {
      setShowingContent(true);
      setCurrentChapter(0);
    } else if (hasQuiz) {
      startQuiz();
    } else {
      // No content and no quiz — show coming soon
      window.__toast?.('该课程内容即将上线，敬请期待 📚');
      return;
    }
  };

  const nextChapter = () => {
    const chapters = course.metadata?.chapter_titles || course.metadata?.chapter_content || [];
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    } else {
      // All chapters completed, start quiz
      startQuiz();
    }
  };

  const startQuiz = async () => {
    if (!token) return;

    try {
      const quiz = await quizAPI.getQuiz(id, token || undefined);
      setQuizData(quiz);
      setShowQuiz(true);
      setShowingContent(false);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      window.__toast?.('该课程测验即将上线 📝');
    }
  };

  const submitQuiz = async () => {
    if (!token || !quizData) return;

    try {
      const result = await quizAPI.submitQuiz(token, id, quizAnswers);
      setQuizResult(result);
      setQuizSubmitted(true);

      // If quiz passed, record mining learn completion
      if (result.passed) {
        try {
          await miningLearnAPI.complete(token, id);
        } catch (error) {
          console.error('Failed to record mining completion:', error);
          // Don't show error to user, this is just for mining tracking
        }
      }
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      alert(error.message || '提交失败，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-16 text-center">
        <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-gray-500">加载课程中...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="pt-32 pb-16 text-center">
        <div className="text-6xl mb-6">📚</div>
        <h1 className="text-2xl font-bold text-navy mb-4">课程未找到</h1>
        <p className="text-gray-500 mb-8">{error || '该课程可能已下架'}</p>
        <Link href="/learn" className="btn btn-primary">返回学习中心</Link>
      </div>
    );
  }

  const meta = categoryMeta[course.category] || { icon: '📚', color: 'from-gray-400/20 to-gray-500/20' };
  const reward = course.base_lac_reward || rewardByDifficulty(course.difficulty);
  const chapters = course.metadata?.chapter_titles || [];
  const objectives = course.metadata?.learning_objectives || [];
  const tags = course.metadata?.tags || [];
  const totalChapters = chapters.length || 1;
  const completedCount = completedChapters.size;
  const progressPercentage = Math.round((completedCount / totalChapters) * 100);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <Link href="/learn" className="inline-flex items-center text-sm text-gray-500 hover:text-navy mb-6 transition-colors">
                ← 返回学习中心
              </Link>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${difficultyColor(course.difficulty)}`}>
                  {difficultyLabel(course.difficulty)}
                </span>
                <span className="text-sm text-gray-500">⏱ {course.estimated_duration || 30}分钟</span>
                <span className="text-sm gold-text font-semibold">🏆 {reward} LAC</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{course.category}</span>
              </div>

              <h1 className="text-3xl lg:text-5xl font-black text-navy leading-[1.1] mb-4 tracking-tight">
                {course.title}
              </h1>

              {course.metadata?.title_en && (
                <p className="text-lg text-gray-400 mb-4">{course.metadata.title_en}</p>
              )}

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {course.description}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-navy/5 text-navy px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}

              {!isLoggedIn ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
                    <div className="text-sm text-yellow-700 mb-2">请先登录开始学习</div>
                    <Link href="/login" className="btn btn-primary btn-sm">登录</Link>
                  </div>
                </div>
              ) : (
                <button onClick={startLearning} className="btn btn-primary btn-lg">开始学习</button>
              )}
            </div>

            <div className={`h-80 lg:h-96 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}>
              <span className="text-8xl">{meta.icon}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* Learning Objectives */}
              {objectives.length > 0 && (
                <div className="card p-8">
                  <h2 className="text-2xl font-bold text-navy mb-6">🎯 学习目标</h2>
                  <ul className="space-y-3">
                    {objectives.map((obj: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-gold mt-0.5">✓</span>
                        <span className="text-gray-600">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chapters */}
              {chapters.length > 0 ? (
                <div className="card p-8">
                  <h2 className="text-2xl font-bold text-navy mb-6">📖 课程大纲</h2>
                  <div className="space-y-3">
                    {chapters.map((ch: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={completedChapters.has(i)}
                            onChange={() => toggleChapter(i)}
                            className="w-5 h-5 text-gold border-2 border-gray-300 rounded focus:ring-gold/20"
                          />
                        </label>
                        <div className="flex-1">
                          <span className={`font-medium ${completedChapters.has(i) ? 'text-gray-400 line-through' : 'text-navy'}`}>
                            第{i + 1}章：{ch}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card p-8">
                  <h2 className="text-2xl font-bold text-navy mb-6">📖 课程介绍</h2>
                  <p className="text-gray-600 leading-relaxed">{course.description}</p>
                </div>
              )}

              {/* Prerequisites */}
              {course.metadata?.prerequisites && course.metadata.prerequisites.length > 0 && (
                <div className="card p-8">
                  <h2 className="text-2xl font-bold text-navy mb-6">📋 前置知识</h2>
                  <ul className="space-y-2">
                    {course.metadata.prerequisites.map((p: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-gray-600">
                        <span className="text-navy mt-0.5">•</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Progress */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-navy mb-4">学习进度</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">完成进度</span>
                    <span className="font-medium text-navy">{completedCount}/{totalChapters}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gold h-3 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">{progressPercentage}%</div>
                </div>
                <div className="text-sm text-gray-500">预计学习时间：{course.estimated_duration || 30}分钟</div>
              </div>

              {/* Reward */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-navy mb-4">LAC 奖励</h3>
                <div className="text-center">
                  <div className="text-3xl gold-text font-black mb-2">{reward}</div>
                  <div className="text-sm text-gray-500 mb-4">完成课程可获得 LAC</div>
                  <div className="text-xs text-gray-400">奖励将在课程完成后自动发放</div>
                </div>
              </div>

              {/* Related Courses */}
              {relatedCourses.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-navy mb-4">相关课程</h3>
                  <div className="space-y-3">
                    {relatedCourses.map((rc) => (
                      <Link
                        key={rc.id}
                        href={`/learn/${rc.id}`}
                        className="block p-3 rounded-lg border border-gray-100 hover:border-gold/30 hover:bg-gold/5 transition-colors group"
                      >
                        <h4 className="font-medium text-navy text-sm mb-1 group-hover:text-gold transition-colors line-clamp-2">{rc.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${difficultyColor(rc.difficulty)}`}>
                            {difficultyLabel(rc.difficulty)}
                          </span>
                          <span>{rc.estimated_duration || 30}分钟</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Chapter Content Modal */}
      {showingContent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden w-full">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-navy">
                  第{currentChapter + 1}章：{(course.metadata?.chapter_titles || course.metadata?.chapter_content || [])[currentChapter]}
                </h3>
                <button onClick={() => setShowingContent(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto mb-8">
                <div className="prose prose-lg max-w-none">
                  {course.metadata?.chapter_content && course.metadata?.chapter_content[currentChapter] ? (
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {typeof course.metadata.chapter_content[currentChapter] === 'string' 
                        ? course.metadata.chapter_content[currentChapter]
                        : course.metadata.chapter_content[currentChapter].content || '本章节的详细内容正在准备中。'}
                    </div>
                  ) : (
                    <p className="text-gray-500">本章节的详细内容正在准备中。请继续阅读下一章节。</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  第 {currentChapter + 1} 章 / 共 {(course.metadata?.chapter_titles || course.metadata?.chapter_content || []).length} 章
                </span>
                <button onClick={nextChapter} className="btn btn-primary">
                  {currentChapter < (course.metadata?.chapter_titles || course.metadata?.chapter_content || []).length - 1 ? '下一章' : '开始测验'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden w-full">
            <div className="p-8">
              {!quizSubmitted ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-navy">课程测验</h3>
                    <button onClick={() => setShowQuiz(false)} className="text-gray-400 hover:text-gray-600">
                      ✕
                    </button>
                  </div>

                  {quizData && quizData.questions ? (
                    <div className="max-h-[60vh] overflow-y-auto mb-8">
                      <div className="space-y-6">
                        {quizData.questions.map((question: any, qIndex: number) => (
                          <div key={qIndex} className="border rounded-xl p-6">
                            <h4 className="font-semibold text-navy mb-4">
                              {qIndex + 1}. {question.question}
                            </h4>
                            <div className="space-y-3">
                              {question.options.map((option: string, oIndex: number) => (
                                <label key={oIndex} className="flex items-center gap-3 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`question-${qIndex}`}
                                    value={oIndex}
                                    onChange={() => {
                                      const newAnswers = [...quizAnswers];
                                      newAnswers[qIndex] = oIndex;
                                      setQuizAnswers(newAnswers);
                                    }}
                                    className="w-4 h-4 text-gold border-2 border-gray-300"
                                  />
                                  <span className="text-gray-700">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="text-gray-500">加载测验中...</div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      请完成所有题目
                    </span>
                    <button 
                      onClick={submitQuiz} 
                      disabled={!quizData || quizAnswers.length !== quizData.questions?.length}
                      className="btn btn-primary"
                    >
                      提交答案
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-6">
                    {quizResult?.passed ? '🎉' : '😔'}
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-4">
                    {quizResult?.passed ? '恭喜通过！' : '未通过测验'}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    得分：{quizResult?.score || 0}%
                  </p>
                  {quizResult?.passed && (
                    <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6 mb-6">
                      <div className="text-lg font-bold gold-text mb-2">
                        🏆 获得奖励：{quizResult?.reward || reward} LAC
                      </div>
                      <div className="text-sm text-gray-600">
                        奖励已自动发放到您的账户
                      </div>
                    </div>
                  )}
                  <button onClick={() => setShowQuiz(false)} className="btn btn-primary">
                    关闭
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
