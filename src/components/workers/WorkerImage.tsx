import React, { useEffect, useState } from 'react';
import { Image, ImageProps } from 'react-native';

const fallbackImage = require('../../../assets/images/man1.png');

interface WorkerImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
}

export default function WorkerImage({ uri, ...imageProps }: WorkerImageProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const isValidUri = /^https?:\/\/\S+$/i.test(uri.trim());

  useEffect(() => {
    setHasLoadError(false);
  }, [uri]);

  return (
    <Image
      {...imageProps}
      source={isValidUri && !hasLoadError ? { uri } : fallbackImage}
      onError={() => setHasLoadError(true)}
    />
  );
}
