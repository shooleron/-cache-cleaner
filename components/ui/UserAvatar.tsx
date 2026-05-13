'use client';

import React from 'react';
import { User } from '@/lib/types';
import { ANIMALS } from '@/lib/animalAvatars';

interface UserAvatarProps {
  user: Pick<User, 'name' | 'avatar' | 'color' | 'avatarAnimal' | 'photoUrl'>;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function UserAvatar({ user, size = 36, className, style }: UserAvatarProps) {
  const sharedStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  };

  if (user.photoUrl) {
    return (
      <img
        src={user.photoUrl}
        alt={user.name}
        className={className}
        style={{ ...sharedStyle, objectFit: 'cover' }}
      />
    );
  }

  if (user.avatarAnimal) {
    const animal = ANIMALS.find(a => a.id === user.avatarAnimal);
    if (animal) {
      const { Illustration } = animal;
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={className}
          style={{ borderRadius: '50%', flexShrink: 0, display: 'block', ...style }}
        >
          <circle cx="50" cy="50" r="50" fill={animal.bg} />
          <Illustration />
        </svg>
      );
    }
  }

  // Default: initials
  return (
    <div
      className={className}
      style={{
        ...sharedStyle,
        background: user.color,
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.38,
        fontFamily: 'Manrope, sans-serif',
        letterSpacing: '0.02em',
      }}
    >
      {user.avatar}
    </div>
  );
}
