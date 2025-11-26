import ChatWidget from '@/components/chat-widget';

export default function EmbedPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const sourceId = typeof searchParams.source === 'string' ? searchParams.source : 'embed';

    return (
        <div className="bg-transparent min-h-screen">
            <ChatWidget sourceId={sourceId} />
        </div>
    );
}
