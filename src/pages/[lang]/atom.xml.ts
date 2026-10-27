import { atomResponse } from '@lib/feeds/response';
import type { APIContext } from 'astro';
import { getLocaleStaticPaths } from '../_shared/utils';

export const getStaticPaths = getLocaleStaticPaths;
export const GET = (context: APIContext) => atomResponse(context, context.params.lang ?? 'zh');
