
import React from 'react';
import type { Activity, Group } from '../types';
import ActivityItem from './ActivityItem';

interface ActivityFeedProps {
  activities: Activity[];
  group: Group;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, group }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No activities yet.</p>
        <p className="text-gray-400 text-sm">Add an expense to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold my-4 text-gray-800 dark:text-white">Activity</h2>
      <div className="space-y-4">
        {activities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} group={group} />
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
