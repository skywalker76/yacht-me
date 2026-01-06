import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { message, sessionId } = await req.json();

        // Check if environment variable is set
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

        if (!n8nWebhookUrl) {
            console.error('N8N_WEBHOOK_URL is not defined');
            return NextResponse.json(
                { message: 'Errore configurazione server. Contattare l\'amministratore.' },
                { status: 500 }
            );
        }

        // Forward request to n8n
        const n8nResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                sessionId,
                source: 'web' // Explicitly mark source for n8n logic
            }),
        });

        if (!n8nResponse.ok) {
            console.error('n8n Webhook Error:', n8nResponse.status, n8nResponse.statusText);
            throw new Error('Failed to reach AI agent');
        }

        const data = await n8nResponse.json();

        // Expecting n8n to return { message: "..." } based on our workflow
        return NextResponse.json(data);

    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json(
            { message: 'Si è verificato un errore durante la comunicazione con l\'assistente.' },
            { status: 500 }
        );
    }
}
