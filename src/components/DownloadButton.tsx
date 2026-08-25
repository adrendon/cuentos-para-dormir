import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../theme/colors';
import { downloadBook, DownloadProgress } from '../services/downloadService';

interface DownloadButtonProps {
  folderName: string;
  sizeMB: number;
  accentColor: string;
  displayScale?: number;
  onDownloadComplete: () => void;
}

export function DownloadButton({ folderName, sizeMB, accentColor, displayScale = 1, onDownloadComplete }: DownloadButtonProps) {
  const [progress, setProgress] = useState<DownloadProgress>({
    status: 'idle',
    progress: 0,
    bytesDownloaded: 0,
    totalBytes: 0,
  });

  const handleDownload = useCallback(async () => {
    if (isActiveStatus(progress.status)) return;

    const success = await downloadBook(folderName, setProgress);
    if (success) onDownloadComplete();
  }, [folderName, progress.status, onDownloadComplete]);

  const handleRetry = useCallback(() => {
    setProgress({ status: 'idle', progress: 0, bytesDownloaded: 0, totalBytes: 0 });
  }, []);

  if (progress.status === 'done') return null;

  if (progress.status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { fontSize: 12 * displayScale }]}>{progress.error || 'Error al descargar'}</Text>
        <TouchableOpacity style={[styles.retryButton, { borderRadius: 14 * displayScale }]} onPress={handleRetry}>
          <Text style={[styles.retryText, { fontSize: 12 * displayScale }]}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = isActiveStatus(progress.status);
  const circleSize = 58 * displayScale;
  const arrowSize = 58 * displayScale;
  const progressWidth = 190 * displayScale;
  const progressHeight = 8 * displayScale;
  const percent = Math.round(progress.progress * 100);

  return (
    <View style={styles.container}>
      {isActive ? (
        <View style={styles.progressWrap}>
          <Text style={[styles.progressPercent, { fontSize: 26 * displayScale, lineHeight: 30 * displayScale }]}>{percent}%</Text>
          <View style={[styles.progressTrack, { width: progressWidth, height: progressHeight, borderRadius: progressHeight / 2 }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(0, Math.min(100, percent))}%`,
                  borderRadius: progressHeight / 2,
                  backgroundColor: accentColor || '#F3F4EA',
                },
              ]}
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleDownload} accessibilityLabel="Descargar cuento" accessibilityRole="button">
          <View style={[styles.circleWrap, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}>
            <Image source={require('../assets/ui/ic_download.png')} style={{ width: arrowSize, height: arrowSize, tintColor: '#FFFFFF' }} resizeMode="contain" />
          </View>
          <Text style={[styles.buttonText, { fontSize: 22 * displayScale, lineHeight: 27 * displayScale, marginTop: 7 * displayScale }]}>{sizeMB} MB</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function isActiveStatus(status: DownloadProgress['status']): boolean {
  return ['downloading', 'extracting', 'validating', 'installing'].includes(status);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.textWhite,
    fontFamily: 'Montserrat-ExtraBold',
  },
  progressWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-ExtraBold',
    marginBottom: 8,
  },
  progressTrack: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  progressFill: {
    height: '100%',
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'Montserrat-SemiBold',
  },
  retryButton: {
    backgroundColor: Colors.chipOrange,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  retryText: {
    color: Colors.textWhite,
    fontWeight: '700',
  },
});
