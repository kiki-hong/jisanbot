import ChatWidget from '@/components/chat-widget';

export default function EmbedPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const sourceId = typeof searchParams.source === 'string' ? searchParams.source : 'embed';

    return (
        <div className="w-full h-screen bg-transparent">
            <ChatWidget mode="embed" sourceId={sourceId} />
        </div>
    );
}
