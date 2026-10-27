import { atomResponse } from '@lib/feeds/response';
import type { APIContext } from 'astro';
import { defaultLocale } from '@/i18n';

export const GET = (context: APIContext) => atomResponse(context, defaultLocale);
