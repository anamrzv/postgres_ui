export type Table = {
    name: string;
    schema: string;
};

export type TableColumn = {
    column_name: string;
    data_type: string;
    character_maximum_length: number | null;
    is_nullable: string;
    column_default: string | null;
    ordinal_position: number;
    is_primary_key?: boolean;
};

export type TableSchema = {
    tableName: string;
    schema: string;
    columns: TableColumn[];
}

export type Options = {
    page?: number;
    limit?: number;
    filters?: Record<string, any>[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export type TableData = {
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
}

export type Project = {
    fullName: string;
    projectNameInternal: string;
    projectNameCV: string;
    role: string;
    dateStart: Date;
    dateEnd: Date;
    industry?: string;
    tools?: string;
    coreBusinessTopics?: string;
    projectMethods?: string;
    achievements?: string;
    neverRegenerate?: boolean;
}

export const PROJECT_COLUMN_MAP: Record<keyof Project, string> = {
  fullName:            'profile_id',
  projectNameInternal: 'project_id',
  projectNameCV:       'name',
  role:                'role',
  dateStart:           'from',
  dateEnd:             'to',
  industry:            'industry',
  tools:               'tools',
  coreBusinessTopics:  'coreBusinessTopics',
  projectMethods:      'projectMethods',
  achievements:        'achievements',
  neverRegenerate:     'never_regenerate',
};