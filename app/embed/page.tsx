"use client";

import { useEffect, use } from 'react';
import ChatWidget from '@/components/chat-widget';

export default function WidgetPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = use(searchParams);
    // [중요] 기본 모드를 'embed'(전체화면)로 설정합니다. 
    // 위젯으로 쓰려면 URL 뒤에 ?mode=widget 을 붙여야 합니다.
    const mode = resolvedParams.mode === 'widget' ? 'widget' : 'embed';
    const sourceId = typeof resolvedParams.source === 'string' ? resolvedParams.source : 'default';

    useEffect(() => {
        // Force transparent background for the widget iframe
        document.body.style.background = 'transparent';
        // Also remove any default padding/margin if necessary, though globals usually handles it
        return () => {
            document.body.style.background = '';
        };
    }, []);

    return (
        <div className="bg-transparent w-full h-full">
            {/* 
              We use mode="widget" here. 
              The ChatWidget will handle the toggle button and the chat window.
              It will also send postMessages to the parent to resize the iframe.
            */}
            <ChatWidget mode={mode} sourceId={sourceId} />
        </div>
    );
}
