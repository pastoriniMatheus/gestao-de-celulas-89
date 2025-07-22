
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ContactAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ContactAvatar: React.FC<ContactAvatarProps> = ({
  name,
  photoUrl,
  size = 'md',
  className = ''
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={photoUrl || ''} alt={name} />
      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-white font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};
