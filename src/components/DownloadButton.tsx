import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { downloadBook, DownloadProgress } from '../services/downloadService';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DownloadButtonProps {
  folderName: string;
  sizeMB: number;
  accentColor: string;
  onDownloadComplete: () => void;
}

export function DownloadButton({ folderName, sizeMB, accentColor, onDownloadComplete }: DownloadButtonProps) {
  const [progress, setProgress] = useState<DownloadProgress>({
    status: 'idle',
    progress: 0,
    bytesDownloaded: 0,
    totalBytes: 0,
  });
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress.progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress.progress]);

  const handleDownload = useCallback(async () => {
    if (progress.status === 'downloading' || progress.status === 'extracting') return;

    const success = await downloadBook(folderName, (p) => {
      setProgress(p);
    });

    if (success) {
      onDownloadComplete();
    }
  }, [folderName, progress.status, onDownloadComplete]);

  const handleRetry = useCallback(() => {
    setProgress({ status: 'idle', progress: 0, bytesDownloaded: 0, totalBytes: 0 });
  }, []);

  if (progress.status === 'done') {
    return null;
  }

  if (progress.status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{progress.error || 'Error al descargar'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = progress.status === 'downloading' || progress.status === 'extracting';
  const circleSize = 52;
  const strokeWidth = 2;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleDownload}
        disabled={isActive}
        accessibilityLabel="Descargar cuento"
        accessibilityRole="button"
      >
        <View style={styles.circleWrap}>
          <Svg width={circleSize} height={circleSize} style={styles.svgCircle}>
            {/* Background circle track */}
            <Circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            {isActive && (
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="#FFFFFF"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={circumference * (1 - progress.progress)}
                strokeLinecap="round"
                transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
              />
            )}
          </Svg>
          <Text style={styles.downloadIcon}>↓</Text>
        </View>
        <Text style={styles.buttonText}>
          {isActive ? `${Math.round(progress.progress * 100)}%` : `${sizeMB} MB`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    minHeight: 80,
  },
  circleWrap: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgCircle: {
    position: 'absolute',
  },
  downloadIcon: {
    fontSize: 24,
    color: Colors.textWhite,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontFamily: 'Montserrat-ExtraBold',
    fontWeight: '800',
    marginTop: 6,
  },
  errorText: {
    color: Colors.error,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: Colors.chipOrange,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  retryText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '600',
  },
});
