"use client";

import { useEffect } from 'react';
import ChatWidget from '@/components/chat-widget';

export default function WidgetPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const sourceId = typeof searchParams.source === 'string' ? searchParams.source : 'widget-embed';

    useEffect(() => {
        // Force transparent background for the widget iframe
        document.body.style.background = 'transparent';
        // Also remove any default padding/margin if necessary, though globals usually handles it
        return () => {
            document.body.style.background = '';
        };
    }, []);

    return (
        <>
            <style jsx global>{`
                body, html {
                    background: transparent !important;
                }
            `}</style>
            <div className="bg-transparent w-full h-full">
                {/* 
                  We use mode="widget" here. 
                  The ChatWidget will handle the toggle button and the chat window.
                  It will also send postMessages to the parent to resize the iframe.
                */}
                <ChatWidget mode="widget" sourceId={sourceId} />
            </div>
        </>
    );
}
