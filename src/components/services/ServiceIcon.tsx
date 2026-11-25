import { useEffect, useState } from 'react';
import { Image, type ImageStyle, type StyleProp, type TextStyle } from 'react-native';

import AppText from '@/components/common/AppText';

interface ServiceIconProps {
  icon?: string | null;
  size?: number;
  textVariant?: 'title' | 'caption';
  textStyle?: StyleProp<TextStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  fallbackEmoji?: string;
}

function getHttpImageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if ((url.protocol === 'http:' || url.protocol === 'https:') && url.hostname) {
      return value;
    }
  } catch (error) {
    if (error instanceof TypeError) {
      return null;
    }

    throw error;
  }

  return null;
}

export default function ServiceIcon({
  icon,
  size = 22,
  textVariant = 'title',
  textStyle,
  imageStyle,
  fallbackEmoji = '🔧',
}: ServiceIconProps) {
  const normalizedIcon = icon?.trim() ?? '';
  const imageUrl = normalizedIcon ? getHttpImageUrl(normalizedIcon) : null;
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setFailedImageUrl(null);
  }, [normalizedIcon]);

  if (imageUrl && failedImageUrl !== imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[{ width: size, height: size }, imageStyle]}
        resizeMode="contain"
        onError={() => setFailedImageUrl(imageUrl)}
      />
    );
  }

  return (
    <AppText variant={textVariant} style={textStyle}>
      {imageUrl ? fallbackEmoji : normalizedIcon || fallbackEmoji}
    </AppText>
  );
}
