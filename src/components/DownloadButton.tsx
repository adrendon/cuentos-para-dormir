import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { downloadBook, DownloadProgress, DownloadStatus } from '../services/downloadService';

interface DownloadButtonProps {
  folderName: string;
  onDownloadComplete: () => void;
}

export function DownloadButton({ folderName, onDownloadComplete }: DownloadButtonProps) {
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

  // Format bytes to readable size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusLabel = (): string => {
    switch (progress.status) {
      case 'idle':
        return 'Descargar';
      case 'downloading':
        return progress.totalBytes > 0
          ? `${formatSize(progress.bytesDownloaded)} / ${formatSize(progress.totalBytes)}`
          : 'Descargando...';
      case 'extracting':
        return 'Instalando...';
      case 'done':
        return 'Listo';
      case 'error':
        return 'Error';
      default:
        return 'Descargar';
    }
  };

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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isActive && styles.buttonActive]}
        onPress={handleDownload}
        disabled={isActive}
        accessibilityLabel={`Descargar cuento`}
        accessibilityRole="button"
      >
        {isActive ? (
          <ActivityIndicator size="small" color={Colors.textWhite} />
        ) : (
          <Text style={styles.downloadIcon}>⬇</Text>
        )}
        <Text style={styles.buttonText}>{getStatusLabel()}</Text>
      </TouchableOpacity>

      {/* Progress bar */}
      {isActive && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
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
    width: '100%',
    alignItems: 'center',
    paddingTop: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonGreenStart,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
    width: '100%',
  },
  buttonActive: {
    backgroundColor: 'rgba(27, 150, 104, 0.6)',
  },
  downloadIcon: {
    fontSize: 14,
    color: Colors.textWhite,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.buttonGreenEnd,
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
