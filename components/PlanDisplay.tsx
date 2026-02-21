import React from 'react';
import { GeneratedPlanProps, LearningTask } from '../types';
import { BookOpen, Headphones, Star, Check, Circle } from 'lucide-react';
import { CATEGORY_CONFIGS } from '../constants';

export const PlanDisplay: React.FC<GeneratedPlanProps> = ({ tasks, dateStr, onToggleTask }) => {
  // Group tasks by category
  const groupedTasks = {
    core: tasks.filter(t => t.category === 'core'),
    extensive: tasks.filter(t => t.category === 'extensive'),
    audio: tasks.filter(t => t.category === 'audio'),
  };

  const coreName = groupedTasks.core.length > 0 ? groupedTasks.core[0].name : '无';
  const totalCategories = Object.values(groupedTasks).filter(g => g.length > 0).length;

  const renderTask = (task: LearningTask, colorClass: string) => {
      const isCompleted = task.completed;
      return (
        <div 
            key={task.id} 
            className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border-2 mb-3 shadow-sm hover:shadow-md active:scale-[0.98] ${
                isCompleted 
                ? 'bg-green-50 border-green-400' 
                : 'bg-white border-transparent hover:border-gray-200'
            }`}
            onClick={() => onToggleTask(task.id)}
        >
          <div className="flex items-center gap-4">
            <div className={`transition-all duration-300 flex-shrink-0 ${isCompleted ? 'scale-110' : 'hover:scale-110'}`}>
                {isCompleted ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                        <Check className="w-5 h-5 text-white stroke-[4]" />
                    </div>
                ) : (
                    <Circle className={`w-8 h-8 ${colorClass} opacity-30 stroke-[3]`} />
                )}
            </div>
            <span className={`font-black text-xl text-gray-800 ${isCompleted ? 'text-green-800' : ''}`}>
                {task.name}
            </span>
          </div>
          <span className={`px-4 py-1.5 rounded-full font-bold text-base md:text-lg whitespace-nowrap ${
              isCompleted 
              ? 'bg-white text-green-600 border-2 border-green-200' 
              : 'bg-gray-100 text-gray-500 border-2 border-transparent'
            }`}>
            {task.details}
          </span>
        </div>
      );
  };

  return (
    <div id="plan-card" className="bg-white rounded-3xl shadow-xl border-4 border-kid-sky overflow-hidden relative">
      {/* Decorative top bar */}
      <div className="bg-kid-sky h-4 w-full flex space-x-2 px-4 items-center">
        <div className="w-2 h-2 rounded-full bg-white/50"></div>
        <div className="w-2 h-2 rounded-full bg-white/50"></div>
        <div className="w-2 h-2 rounded-full bg-white/50"></div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 border-b-2 border-dashed border-gray-200 pb-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
            📅 英语专项执行清单
          </h2>
          <p className="text-gray-500 font-medium">{dateStr}</p>
        </div>

        {/* Summary */}
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <p className="text-gray-700 leading-relaxed font-medium">
            <span className="text-xl mr-2">📊</span>
            <span className="font-bold text-gray-800">今日任务概览：</span>
            本次计划共覆盖 {totalCategories} 类材料。重点攻克项目为
            <span className="mx-1 px-2 py-0.5 bg-kid-pink text-white rounded-full text-sm font-bold transform inline-block -rotate-2">
              {coreName}
            </span>。
          </p>
        </div>

        {/* Module 1: Core */}
        {groupedTasks.core.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-kid-pink">
              <Star className="w-6 h-6 fill-current" />
              <h3 className="text-xl font-black">模块一：核心精读（高专注区）</h3>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 border-l-4 border-kid-pink">
              {groupedTasks.core.map((task) => renderTask(task, 'text-kid-pink'))}
              <p className="text-sm text-gray-600 flex items-start pt-2 mt-2 border-t border-red-200/50">
                <span className="mr-2 text-kid-pink">💡</span>
                执行重点：需朗读并进行指读，确保理解 80% 以上内容。
              </p>
            </div>
          </div>
        )}

        {/* Module 2: Extensive */}
        {groupedTasks.extensive.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-kid-blue">
              <BookOpen className="w-6 h-6" />
              <h3 className="text-xl font-black">模块二：泛读拓展（流利度训练）</h3>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 border-l-4 border-kid-blue">
              {groupedTasks.extensive.map((task) => renderTask(task, 'text-kid-blue'))}
              <p className="text-sm text-gray-600 flex items-start pt-2 mt-2 border-t border-green-200/50">
                <span className="mr-2 text-kid-blue">🚀</span>
                执行重点：侧重故事情节理解，不纠结个别生词。
              </p>
            </div>
          </div>
        )}

        {/* Module 3: Audio/Visual */}
        {groupedTasks.audio.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-kid-yellow">
              <Headphones className="w-6 h-6" />
              <h3 className="text-xl font-black text-yellow-600">模块三：沉浸式输入（磨耳朵）</h3>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4 border-l-4 border-kid-yellow">
              {groupedTasks.audio.map((task) => renderTask(task, 'text-yellow-600'))}
              <p className="text-sm text-gray-600 flex items-start pt-2 mt-2 border-t border-yellow-200/50">
                <span className="mr-2 text-kid-yellow">👂</span>
                执行重点：裸听/裸看，培养语感。
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t-2 border-dashed border-gray-200 mt-6">
          <p className="text-xs text-gray-400 font-mono">Generative English Plan • Keep Learning</p>
        </div>
      </div>
    </div>
  );
};
