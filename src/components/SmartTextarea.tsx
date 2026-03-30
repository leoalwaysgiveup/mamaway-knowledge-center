"use client";

import React, { useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { stripListPrefixForPreview } from "@/lib/product-contracts";

interface SmartTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  name: string;
  defaultValue?: string;
}

export function SmartTextarea({ id, name, defaultValue, className, ...props }: SmartTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyBulletMode = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;
    if (!hasSelection) {
      alert("請先選取要套用條列的文字")
      return;
    }

    const selectedText = textarea.value.slice(start, end);
    const lines = selectedText.split("\n");
    const transformed = lines.map((line) => {
      const normalized = stripListPrefixForPreview(line);
      if (!normalized) return "";
      return `● ${normalized}`;
    });

    const nextValue = transformed.join("\n");
    textarea.value = textarea.value.slice(0, start) + nextValue + textarea.value.slice(end);
    textarea.selectionStart = start;
    textarea.selectionEnd = start + nextValue.length;
    textarea.focus();
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={applyBulletMode}
          className="text-[10px] px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        >
          套用條列
        </button>
      </div>
      <Textarea
        ref={textareaRef}
        id={id}
        name={name}
        defaultValue={defaultValue}
        className={`${className} font-medium`}
        {...props}
      />
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium px-1">
        <span className="bg-rose-100 text-rose-600 px-1 rounded">提示</span>
        <span>Enter 只會換行。請先選取文字，再按「套用條列」。</span>
      </div>
    </div>
  );
}
