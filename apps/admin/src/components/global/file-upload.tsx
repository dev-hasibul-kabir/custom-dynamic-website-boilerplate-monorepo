'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import _ from 'lodash';

const FileSelectField = ({
    name,
    title,
    value,
    placeholder,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    isDisabled = false,
    acceptType = '*/*',
    maxFileSize = 5242880,
    errorMessage = '',
}: {
    name: string;
    title: string;
    value?: string | File;
    placeholder?: string;
    setFieldValue: (field: string, value: any) => void;
    setFieldTouched: (field: string, touched: boolean) => void;
    setFieldError: (field: string, value: string) => void;
    isDisabled?: boolean;
    acceptType?: 'image/*' | 'video/*' | 'application/*' | '*/*';
    maxFileSize?: number;
    errorMessage?: string;
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize from value prop if it's a File
    React.useEffect(() => {
        if (value instanceof File) {
            setSelectedFile(value);
            if (value.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(value);
            }
        } else if (typeof value === 'string' && value.startsWith('http')) {
            setPreview(value);
        }
    }, [value]);

    const clear = useCallback(() => {
        setSelectedFile(null);
        setPreview(null);
        setFieldValue(name, null);
        setFieldTouched(name, true);
        setFieldError(name, '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [name, setFieldValue, setFieldTouched, setFieldError]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > maxFileSize) {
            setFieldError(name, 'File size exceeds maximum!');
            return;
        }

        setSelectedFile(file);
        setFieldValue(name, file);
        setFieldTouched(name, true);
        setFieldError(name, '');

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const formatFileSize = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={name}>{title}</Label>
            <div
                className={cn(
                    'border-2 border-dashed rounded-lg p-6',
                    errorMessage && 'border-destructive',
                    isDisabled && 'opacity-50 cursor-not-allowed',
                )}
            >
                {!selectedFile && !value ? (
                    <div className="flex flex-col items-center justify-center text-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">{placeholder || 'Click to upload or drag and drop'}</p>
                        <Input
                            ref={fileInputRef}
                            id={name}
                            type="file"
                            accept={acceptType}
                            onChange={handleFileSelect}
                            disabled={isDisabled}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isDisabled}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose File
                        </Button>
                    </div>
                ) : (
                        <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {preview || (value && typeof value === 'string' && value.startsWith('http')) ? (
                                    <img
                                        src={preview || (typeof value === 'string' ? value : '')}
                                        alt="Preview"
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                ) : (
                                    <div className="h-20 w-20 bg-muted rounded flex items-center justify-center">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-medium">
                                        {selectedFile?.name || (typeof value === 'string' ? 'File URL' : 'File')}
                                    </span>
                                    {selectedFile && <span className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</span>}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={clear}
                                disabled={isDisabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        {typeof value === 'string' && value && !value.startsWith('http') && (
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">{title}:URL</Label>
                                <Input value={value} disabled className="flex-1" />
                            </div>
                        )}
                    </div>
                )}
            </div>
            {errorMessage && (
                <p id={`${name}-help`} className="text-sm text-destructive">
                    {errorMessage}
                </p>
            )}
        </div>
    );
};

export default FileSelectField;

