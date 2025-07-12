"use client";

import * as React from "react";
import { Input } from "./input";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={className}
    />
  );
}
