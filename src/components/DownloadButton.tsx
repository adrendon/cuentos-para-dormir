import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../theme/colors';
import { downloadBook, DownloadProgress } from '../services/downloadService';

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
    return null; // Hide once done
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
  const percentage = Math.round(progress.progress * 100);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleDownload}
        disabled={isActive}
        accessibilityLabel={`Descargar cuento`}
        accessibilityRole="button"
      >
        {!isActive && <Text style={styles.downloadIcon}>↓</Text>}
        <Text style={styles.buttonText}>
          {isActive ? `${percentage}%` : `${sizeMB} MB`}
        </Text>
      </TouchableOpacity>

      {/* Progress bar */}
      {isActive && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
            styles.progressBarFill,
            { backgroundColor: accentColor },
            { width: `${Math.round(progress.progress * 100)}%` },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    minHeight: 80,
  },
  downloadIcon: {
    width: 48,
    height: 48,
    lineHeight: 43,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFF',
    textAlign: 'center',
    fontSize: 32,
    color: Colors.textWhite,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 20,
    fontFamily: 'Montserrat-ExtraBold',
    marginTop: 5,
  },
  progressBarContainer: {
    width: '72%',
    height: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 6,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
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
