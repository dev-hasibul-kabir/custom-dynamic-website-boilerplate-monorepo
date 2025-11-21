'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { File } from 'lucide-react';
import _ from 'lodash';
import GenericViewGenerator from '@/components/global/GenericViewGenerator';
import { getGeneralStatusOptions } from '@/utils';
import { IAction } from '@/components/global/data-table';

const Page = () => {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="pt-6">
        {useMemo(
          () => (
            <GenericViewGenerator
              name={'folder'}
              title="Folders"
              subtitle="Manage folder here!"
              viewAll={{
                uri: `/api/v1/folders`,
                ignoredColumns: ['id', 'createdAt', 'updatedAt'],
                actionIdentifier: 'id',
                onDataModify: data =>
                  _.map(data, datum => ({
                    ...datum,
                  })),
              }}
              addNew={{
                uri: `/api/v1/folders`,
              }}
              viewOne={{ uri: '/api/v1/folders/{id}', identifier: '{id}' }}
              editExisting={{ uri: '/api/v1/folders/{id}', identifier: '{id}' }}
              removeOne={{
                uri: '/api/v1/folders/{id}',
                identifier: '{id}',
              }}
              customActions={
                [
                  {
                    color: 'default',
                    icon: <File className="h-4 w-4" />,
                    text: 'Files',
                    callback: (identifier: string | number) => {
                      router.push(`/folders/${identifier}/files`);
                    },
                  },
                ] as IAction[]
              }
              fields={[
                {
                  type: 'text',
                  name: 'name',
                  placeholder: 'Enter a name!',
                  title: 'Folder Name',
                  initialValue: null,
                  validate: (values: any) => {
                    if (!values.name) return 'Required!';

                    return null;
                  },
                },
                {
                  type: 'select-sync',
                  name: 'status',
                  placeholder: 'Select status!',
                  title: 'Status',
                  initialValue: 'ACTIVE',
                  options: getGeneralStatusOptions(),
                  validate: (values: any) => {
                    if (!values.status) return 'Required!';

                    return null;
                  },
                },
              ]}
            />
          ),
          [],
        )}
      </CardContent>
    </Card>
  );
};

export default Page;
