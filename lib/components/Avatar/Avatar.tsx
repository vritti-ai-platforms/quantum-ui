import {
  Avatar as ShadcnAvatar,
  AvatarBadge as ShadcnAvatarBadge,
  AvatarFallback as ShadcnAvatarFallback,
  AvatarGroup as ShadcnAvatarGroup,
  AvatarGroupCount as ShadcnAvatarGroupCount,
  AvatarImage as ShadcnAvatarImage,
} from '../../../shadcn/shadcnAvatar';

/**
 * Avatar component for displaying user profile images with fallback support.
 *
 * @example
 * ```tsx
 * <Avatar>
 *   <AvatarImage src="/avatar.jpg" alt="User" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 * ```
 */
export const Avatar = ShadcnAvatar;

/**
 * Image component for Avatar. Displays the user's profile image.
 */
export const AvatarImage = ShadcnAvatarImage;

/**
 * Fallback component for Avatar. Displays when image hasn't loaded or errored.
 */
export const AvatarFallback = ShadcnAvatarFallback;

/**
 * Badge component for Avatar. Displays a status indicator.
 */
export const AvatarBadge = ShadcnAvatarBadge;

/**
 * Group component for displaying multiple avatars in a stack.
 *
 * @example
 * ```tsx
 * <AvatarGroup>
 *   <Avatar>...</Avatar>
 *   <Avatar>...</Avatar>
 *   <AvatarGroupCount>+3</AvatarGroupCount>
 * </AvatarGroup>
 * ```
 */
export const AvatarGroup = ShadcnAvatarGroup;

/**
 * Count component for AvatarGroup. Shows overflow count.
 */
export const AvatarGroupCount = ShadcnAvatarGroupCount;
