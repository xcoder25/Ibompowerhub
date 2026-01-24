'use client';

import { useState } from 'react';
import { forumTopics } from '@/lib/data';
import { CreateTopicDialog } from '@/components/forums/create-topic-dialog';
import { ForumTopicCard } from '@/components/forums/forum-topic-card';

export default function ForumsPage() {
  const [topics, setTopics] = useState(forumTopics);

  const handleCreateTopic = (newTopic: any) => {
    setTopics((prev) => [newTopic, ...prev]);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">Community Forums</h1>
          <p className="text-muted-foreground mt-1">Discuss topics, share news, and connect with your neighbors.</p>
        </div>
        <CreateTopicDialog onCreateTopic={handleCreateTopic} />
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <ForumTopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}
