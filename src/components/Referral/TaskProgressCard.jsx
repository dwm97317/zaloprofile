import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 任务进度卡片组件
 */
const TaskProgressCard = ({ tasks, userType }) => {
  const { t } = useTranslation();

  const title = userType === 'referrer' 
    ? t('referral.your_tasks', 'งานของคุณ')
    : t('referral.friend_tasks', 'งานของเพื่อน');

  return (
    <div className="bg-white rounded-2xl p-4">
      <h3 className="font-bold mb-3">{title}</h3>
      <div className="space-y-3">
        {tasks && tasks.map((task, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              task.is_completed ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              {task.is_completed && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{task.task_name}</div>
              {task.task_desc && (
                <div className="text-xs text-gray-500">{task.task_desc}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskProgressCard;
