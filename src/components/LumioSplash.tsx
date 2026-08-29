import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const BLUE = '#004B82';
const FALLBACK_TIMEOUT_MS = 10000;

type Props = { onComplete?: () => void };

export default function LumioSplash({ onComplete }: Props) {
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current?.();
  };

  const player = useVideoPlayer(require('../../assets/lumio-splash.mp4'), (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = true;
  });

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const statusSubscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        player.currentTime = 0;
        player.play();
      }
    });

    const endSubscription = player.addListener('playToEnd', finish);

    const fallback = setTimeout(finish, FALLBACK_TIMEOUT_MS);

    // In case the player reached the ready state before the listener was attached.
    if (player.status === 'readyToPlay') {
      player.currentTime = 0;
      player.play();
    }

    return () => {
      clearTimeout(fallback);
      statusSubscription.remove();
      endSubscription.remove();
    };
  }, [player]);

  return (
    <View style={styles.root}>
      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
        contentFit="cover"
        fullscreenOptions={{ enable: false }}
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
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
