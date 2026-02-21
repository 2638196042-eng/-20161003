import React, { useState } from 'react';
import { HistoryRecord, LearningTask } from '../types';
import { Calendar, ChevronDown, ChevronUp, Trophy, CheckCircle2, Circle } from 'lucide-react';
import { CATEGORY_CONFIGS } from '../constants';

// Helper to extract numbers from string
const extractCount = (str: string): number => {
    // Matches numbers before specific keywords like 本, 集, 章
    // Or just first number found
    const match = str.match(/(\d+)\s*(本|集|章|pages?)/);
    if (match) return parseInt(match[1], 10);
    const simpleMatch = str.match(/(\d+)/);
    return simpleMatch ? parseInt(simpleMatch[1], 10) : 1;
};

interface HistoryViewProps {
    history: HistoryRecord[];
    onToggleHistoryTask: (date: string, taskId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onToggleHistoryTask }) => {
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    // Calculate stats - ONLY COMPLETED TASKS
    const totalBooks = history.reduce((acc, record) => {
        return acc + record.tasks.reduce((tAcc, task) => {
            if (!task.completed) return tAcc;
            return tAcc + extractCount(task.details);
        }, 0);
    }, 0);

    const totalDays = new Set(history.map(h => h.date)).size;

    const toggleDate = (date: string) => {
        if (expandedDate === date) setExpandedDate(null);
        else setExpandedDate(date);
    };

    return (
        <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <Trophy className="absolute right-4 top-4 w-24 h-24 text-white/20 rotate-12" />
                <h2 className="text-2xl font-black mb-1">阅读成就榜</h2>
                <p className="opacity-90 mb-6">累计完成阅读任务统计</p>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">累计阅读完成</p>
                        <p className="text-4xl font-black">{totalBooks}<span className="text-lg ml-1">本/集</span></p>
                    </div>
                    <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">坚持打卡</p>
                        <p className="text-4xl font-black">{totalDays}<span className="text-lg ml-1">天</span></p>
                    </div>
                </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-xl">
                    <Calendar className="w-6 h-6 text-kid-sky" />
                    打卡记录
                </h3>
                
                {history.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">还没有记录哦，快去生成计划打卡吧！</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.sort((a, b) => b.timestamp - a.timestamp).map((record) => {
                            const completedCount = record.tasks.filter(t => t.completed).length;
                            const totalCount = record.tasks.length;
                            
                            return (
                                <div key={record.date + record.timestamp} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all">
                                    <button 
                                        onClick={() => toggleDate(record.date)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded-lg text-sm">
                                                {record.displayDate}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-medium text-sm ${completedCount === totalCount ? 'text-green-500' : 'text-gray-600'}`}>
                                                    完成 {completedCount} / {totalCount}
                                                </span>
                                                {completedCount === totalCount && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                            </div>
                                        </div>
                                        {expandedDate === record.date ? 
                                            <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        }
                                    </button>
                                    
                                    {expandedDate === record.date && (
                                        <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-2">
                                            {record.tasks.map((task, idx) => {
                                                const config = CATEGORY_CONFIGS[task.category];
                                                return (
                                                    <div 
                                                        key={task.id} 
                                                        className="flex items-center justify-between p-2 rounded hover:bg-white cursor-pointer group"
                                                        onClick={() => onToggleHistoryTask(record.date, task.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {task.completed ? (
                                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                                                            )}
                                                            <div className={`flex flex-col ${task.completed ? 'opacity-50' : ''}`}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${config.bgColor}`}></div>
                                                                    <span className={`font-medium text-sm ${task.completed ? 'line-through' : 'text-gray-700'}`}>{task.name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 text-xs">
                                                            {task.details}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
