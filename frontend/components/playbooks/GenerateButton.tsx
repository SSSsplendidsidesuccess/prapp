import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerateButtonProps {
  onClick: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export default function GenerateButton({
  onClick,
  isGenerating = false,
  disabled = false,
  label = 'Generate with AI',
  size = 'default',
  variant = 'default',
  className = '',
}: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isGenerating}
      size={size}
      variant={variant}
      className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}
