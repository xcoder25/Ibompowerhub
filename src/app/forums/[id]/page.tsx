import { forumTopics } from '@/lib/data';
import { ForumTopicDetails } from '@/components/forums/forum-topic-details';

// Required for static export
export async function generateStaticParams() {
    return forumTopics.map((topic) => ({
        id: topic.id.toString(),
    }));
}

export default async function ForumTopicPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <ForumTopicDetails id={Number(id)} />;
}
