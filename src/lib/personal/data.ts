import projectsData from '@/data/mizuki/projects.json';
import timelineData from '@/data/mizuki/timeline.json';

export interface ProjectRecord {
  id: string;
  title: string;
  description: string;
  image?: string;
  showImage?: boolean;
  category: string;
  techStack: string[];
  status: string;
  sourceCode?: string;
  demo?: string;
  startDate: string;
  endDate?: string;
  featured?: boolean;
}

export interface TimelineRecord {
  id: string;
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate?: string;
  organization?: string;
  position?: string;
  location?: string;
  achievements?: string[];
  skills?: string[];
  links?: { name: string; url: string; type?: string }[];
  icon?: string;
  color?: string;
}

export const projectCategoryLabels: Record<string, string> = {
  web: 'Web 应用',
  desktop: '桌面应用',
  mobile: '移动应用',
  other: '其他项目',
};

export const projectStatusLabels: Record<string, string> = {
  completed: '已完成',
  'in-progress': '进行中',
  planned: '计划中',
};

export const timelineTypeLabels: Record<string, string> = {
  project: '项目',
  education: '学习与生活',
  achievement: '里程碑',
  work: '工作',
};

export const projects: ProjectRecord[] = [...projectsData].sort((a, b) => b.startDate.localeCompare(a.startDate));
export const timeline: TimelineRecord[] = [...timelineData].sort((a, b) => b.startDate.localeCompare(a.startDate));

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'UTC',
});

/** An explicit UTC date keeps date-only source values on their original calendar day. */
export const displayPersonalDate = (date: string): string => dateFormatter.format(new Date(`${date}T00:00:00Z`));

/** Stable input order is retained for events sharing the same start date. */
export function groupTimelineByYear(events: readonly TimelineRecord[]) {
  const groups = new Map<string, TimelineRecord[]>();
  for (const event of [...events].sort((a, b) => b.startDate.localeCompare(a.startDate))) {
    const year = event.startDate.slice(0, 4);
    const entries = groups.get(year) ?? [];
    entries.push(event);
    groups.set(year, entries);
  }
  return [...groups].map(([year, events]) => ({ year, events }));
}
