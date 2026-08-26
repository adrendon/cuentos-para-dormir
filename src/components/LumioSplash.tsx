import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const BLUE = '#004B82';
type Props = { onComplete?: () => void };

export default function LumioSplash({ onComplete }: Props) {
  const onCompleteRef = useRef(onComplete);
  const player = useVideoPlayer(require('../../assets/splash/lumio-splash.mp4'), (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      onCompleteRef.current?.();
    });
    return () => subscription.remove();
  }, [player]);

  return (
    <View style={styles.root}>
      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
        contentFit="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: BLUE,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});
