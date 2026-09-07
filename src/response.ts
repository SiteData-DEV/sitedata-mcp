import { SiteDataApiError } from './api-client.js';

export const SITEDATA_PAYMENT_URL = 'https://sitedata.dev/payment';

function asStructuredContent(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return { data: value };
}

function membershipRequired(error: SiteDataApiError) {
  if (
    typeof error.body !== 'object' ||
    error.body === null ||
    Array.isArray(error.body) ||
    (error.body as Record<string, unknown>).code !== 'membership_required'
  ) {
    return null;
  }

  const body = error.body as Record<string, unknown>;
  const message =
    typeof body.message === 'string' && body.message.trim()
      ? body.message.trim()
      : 'An active SiteData membership is required to access rankings.';
  return {
    message: `${message} Subscribe or upgrade at ${SITEDATA_PAYMENT_URL}`,
    paymentUrl: SITEDATA_PAYMENT_URL,
  };
}

export function toToolResult(value: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value) }],
    structuredContent: asStructuredContent(value),
  };
}

export function toToolError(error: unknown) {
  if (error instanceof SiteDataApiError) {
    const membership = membershipRequired(error);
    const messages: Record<number, string> = {
      400: 'Invalid SiteData API parameters.',
      401: 'SiteData authorization is invalid or expired.',
      403: 'This SiteData account does not have access to the requested resource.',
      404: 'The requested SiteData resource was not found.',
      429: 'Too many SiteData requests. Please try again later.',
    };
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text:
            membership?.message ||
            messages[error.status] ||
            'SiteData request failed.',
        },
      ],
      structuredContent: {
        status: error.status,
        error: asStructuredContent(error.body),
        ...(membership ? { paymentUrl: membership.paymentUrl } : {}),
      },
    };
  }

  return {
    isError: true,
    content: [
      {
        type: 'text' as const,
        text: error instanceof Error ? error.message : 'Tool execution failed.',
      },
    ],
  };
}
