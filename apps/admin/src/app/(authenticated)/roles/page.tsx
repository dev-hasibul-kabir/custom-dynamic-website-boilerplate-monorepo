'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import _ from 'lodash';
import GenericViewGenerator from '@/components/global/GenericViewGenerator';
import { IAction } from '@/components/global/data-table';

const Page = () => {
    const router = useRouter();

    return (
        <Card>
            <CardContent className="pt-6">
                {useMemo(
                    () => (
                        <GenericViewGenerator
                            name={'role'}
                            title="Roles"
                            subtitle="Manage role here!"
                            viewAll={{
                                uri: `/api/v1/roles`,
                                ignoredColumns: ['id', 'type', 'permissions', 'createdAt', 'updatedAt'],
                                actionIdentifier: 'id',
                                onDataModify: data =>
                                    _.map(data, datum => ({
                                        ...datum,
                                        permissions: null,
                                    })),
                            }}
                            addNew={{
                                uri: `/api/v1/roles`,
                            }}
                            viewOne={{ uri: '/api/v1/roles/{id}', identifier: '{id}' }}
                            editExisting={{ uri: '/api/v1/roles/{id}', identifier: '{id}' }}
                            removeOne={{
                                uri: '/api/v1/roles/{id}',
                                identifier: '{id}',
                            }}
                            customActions={[
                                {
                                    color: 'default',
                                    icon: <ArrowRight className="h-4 w-4" />,
                                    text: 'Permissions',
                                    callback: (identifier: string | number) => {
                                        router.push(`/roles/${identifier}/permissions`);
                                    },
                                },
                            ] as IAction[]}
                            fields={[
                                {
                                    type: 'text',
                                    name: 'name',
                                    placeholder: 'Enter a name!',
                                    title: 'Role Name',
                                    initialValue: null,
                                    validate: (values: any) => {
                                        if (!values.name) return 'Name required!';

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

