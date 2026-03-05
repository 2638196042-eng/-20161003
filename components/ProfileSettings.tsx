import React, { useState } from 'react';
import { ChildProfile } from '../types';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface ProfileSettingsProps {
  profiles: ChildProfile[];
  onSave: (profiles: ChildProfile[]) => void;
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profiles, onSave, onClose }) => {
  const [editingProfiles, setEditingProfiles] = useState<ChildProfile[]>([...profiles]);

  const handleAdd = () => {
    const newId = `child_${Date.now()}`;
    setEditingProfiles([
      ...editingProfiles,
      { id: newId, name: `宝贝${editingProfiles.length + 1}`, avatar: '👶' }
    ]);
  };

  const handleRemove = (id: string) => {
    if (editingProfiles.length <= 1) return;
    setEditingProfiles(editingProfiles.filter(p => p.id !== id));
  };

  const handleChange = (id: string, field: keyof ChildProfile, value: string) => {
    setEditingProfiles(editingProfiles.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSave = () => {
    // Ensure at least one profile
    if (editingProfiles.length === 0) return;
    onSave(editingProfiles);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-kid-sky p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">管理宝贝档案</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {editingProfiles.map((profile, index) => (
            <div key={profile.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <div className="relative w-12 h-12 flex-shrink-0">
                <select 
                  value={profile.avatar}
                  onChange={(e) => handleChange(profile.id, 'avatar', e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  <option value="👦">👦 男孩</option>
                  <option value="👧">👧 女孩</option>
                  <option value="👶">👶 婴儿</option>
                  <option value="🦊">🦊 狐狸</option>
                  <option value="🐱">🐱 小猫</option>
                  <option value="🐶">🐶 小狗</option>
                  <option value="🐼">🐼 熊猫</option>
                  <option value="🐯">🐯 老虎</option>
                  <option value="🐰">🐰 兔子</option>
                </select>
                <div className="w-full h-full bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-2xl pointer-events-none">
                  {profile.avatar}
                </div>
              </div>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange(profile.id, 'name', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 font-bold focus:outline-none focus:border-kid-sky"
                  placeholder="宝贝名字"
                  maxLength={10}
                />
              </div>

              {editingProfiles.length > 1 && (
                <button 
                  onClick={() => handleRemove(profile.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          {editingProfiles.length < 5 && (
            <button 
              onClick={handleAdd}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-kid-sky hover:text-kid-sky hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加宝贝
            </button>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleSave}
            className="w-full bg-kid-sky hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};
