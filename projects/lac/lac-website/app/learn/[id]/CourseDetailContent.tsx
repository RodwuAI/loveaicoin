'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Chapter {
  title: string;
  duration: number;
  completed: boolean;
}

interface Course {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: string;
  duration: number;
  lac_reward: number;
  enrolled: number;
  rating: number;
  cover: string;
  chapters: Chapter[];
  category: string;
  icon: string;
  color: string;
  progress: number;
}

interface RelatedCourse {
  id: number;
  title: string;
  duration: number;
  difficulty: string;
}

interface CourseDetailContentProps {
  course: Course;
  relatedCourses: RelatedCourse[];
}

export default function CourseDetailContent({ course, relatedCourses }: CourseDetailContentProps) {
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());

  const toggleChapter = (index: number) => {
    const newCompleted = new Set(completedChapters);
    if (completedChapters.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedChapters(newCompleted);
  };

  const completedCount = completedChapters.size;
  const totalChapters = course.chapters.length;
  const progressPercentage = Math.round((completedCount / totalChapters) * 100);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '入门':
        return 'bg-green-100 text-green-700 border-green-200';
      case '进阶':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '高级':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      {/* Hero区域 */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <Link href="/learn" className="inline-flex items-center text-sm text-gray-500 hover:text-navy mb-6 transition-colors">
                ← 返回学习中心
              </Link>
              
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
                <span className="text-sm text-gray-500">⏱ {course.duration}分钟</span>
                <span className="text-sm gold-text font-semibold">🏆 {course.lac_reward} LAC</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-navy leading-[1.1] mb-4 tracking-tight">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {course.subtitle}
              </p>

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
                <div className="flex items-center gap-1">
                  <span className="text-gold">★</span>
                  <span className="font-medium text-gray-700">{course.rating}</span>
                </div>
                <span>👥 {course.enrolled.toLocaleString()} 已报名</span>
                <span>📚 {course.chapters.length} 章节</span>
              </div>

              <button 
                onClick={() => window.__toast?.('课程学习功能即将开放')}
                className="btn btn-primary btn-lg"
              >
                开始学习
              </button>
            </div>

            {/* 课程封面占位符 */}
            <div className={`h-80 lg:h-96 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-lg`}>
              <span className="text-8xl">{course.icon}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 主要内容区域 */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* 左侧主要内容 */}
            <div className="lg:col-span-2 space-y-12">
              {/* 课程介绍 */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-navy mb-6">课程介绍</h2>
                <div className="prose prose-lg max-w-none">
                  {course.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-600 leading-relaxed mb-4">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>

              {/* 课程大纲 */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-navy mb-6">课程大纲</h2>
                <div className="space-y-4">
                  {course.chapters.map((chapter, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={completedChapters.has(index)}
                          onChange={() => toggleChapter(index)}
                          className="w-5 h-5 text-gold border-2 border-gray-300 rounded focus:ring-gold/20 focus:ring-2"
                        />
                      </label>
                      <div className="flex-1">
                        <h3 className={`font-medium ${completedChapters.has(index) ? 'text-gray-500 line-through' : 'text-navy'}`}>
                          第{index + 1}章：{chapter.title}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-500">{chapter.duration}分钟</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 讲师信息 */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-navy mb-6">讲师介绍</h2>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl">💫</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-navy mb-2">小嘀嗒 AI</h3>
                    <p className="text-gray-600 leading-relaxed">
                      LAC平台的AI讲师，专注于区块链、AI和Web3领域的教育。拥有丰富的技术背景和教学经验，
                      擅长将复杂的技术概念转化为易懂的内容。致力于帮助每一位学习者掌握未来科技，
                      在数字化时代中获得成长和成功。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧侧栏 */}
            <div className="space-y-8">
              {/* 学习进度 */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-navy mb-4">学习进度</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">完成进度</span>
                    <span className="font-medium text-navy">{completedCount}/{totalChapters}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gold h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">{progressPercentage}%</div>
                </div>
                <div className="text-sm text-gray-500">
                  预计完成时间：{course.duration}分钟
                </div>
              </div>

              {/* 获得奖励 */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-navy mb-4">获得LAC奖励</h3>
                <div className="text-center">
                  <div className="text-3xl gold-text font-black mb-2">{course.lac_reward}</div>
                  <div className="text-sm text-gray-500 mb-4">完成课程可获得 LAC 代币</div>
                  <div className="text-xs text-gray-400">
                    奖励将在课程完成后自动发放到您的账户
                  </div>
                </div>
              </div>

              {/* 相关课程推荐 */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-navy mb-4">相关课程</h3>
                <div className="space-y-3">
                  {relatedCourses.filter(c => c.id !== course.id).slice(0, 3).map((relatedCourse) => (
                    <Link 
                      key={relatedCourse.id}
                      href={`/learn/${relatedCourse.id}`}
                      className="block p-3 rounded-lg border border-gray-100 hover:border-gold/30 hover:bg-gold/5 transition-colors group"
                    >
                      <h4 className="font-medium text-navy text-sm mb-1 group-hover:text-gold transition-colors">
                        {relatedCourse.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{relatedCourse.difficulty}</span>
                        <span>•</span>
                        <span>{relatedCourse.duration}分钟</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}