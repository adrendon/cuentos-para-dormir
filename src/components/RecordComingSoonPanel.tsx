import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/colors';

export function RecordComingSoonPanel({ firstPageUri, onClose }: { firstPageUri?: string; onClose: () => void }) {
  return (
    <View style={styles.container}>
      {!!firstPageUri && <Image source={{ uri: firstPageUri }} style={styles.background} resizeMode="cover" />}
      <View style={styles.shade} />
      <View style={styles.leftIcons}>
        <ModeIcon source={require('../assets/ui/ic_book_read.png')} />
        <ModeIcon source={require('../assets/ui/ic_book_listen.png')} />
        <View style={[styles.iconWrap, styles.iconActive]}>
          <View style={styles.micSmall}><View style={styles.micHead} /><View style={styles.micStand} /></View>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Cerrar">
          <Image source={require('../assets/ui/ic_close.png')} style={styles.closeIcon} />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Narraciones personales</Text>
        <Text style={styles.description}>Graba tu propia narración para este cuento</Text>
        <TouchableOpacity style={styles.recordButton} disabled accessibilityLabel="Grabar (próximamente)">
          <View style={styles.recordCircle}><View style={styles.recordDot} /></View>
          <Text style={styles.recordText}>Próximamente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ModeIcon({ source }: { source: number }) {
  return <View style={styles.iconWrap}><Image source={source} style={styles.icon} /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  background: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  shade: { position: 'absolute', inset: 0, backgroundColor: 'rgba(8, 4, 30, 0.78)' },
  leftIcons: { position: 'absolute', left: 18, top: '50%', marginTop: -80, gap: 12, zIndex: 10 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  iconActive: { backgroundColor: '#238FDD', borderWidth: 2, borderColor: '#25C8EE' },
  icon: { width: 22, height: 22, tintColor: '#FFF', resizeMode: 'contain' },
  micSmall: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  micHead: { width: 9, height: 14, borderRadius: 5, borderWidth: 2, borderColor: '#FFF' },
  micStand: { width: 14, height: 8, marginTop: -5, borderBottomWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#FFF', borderRadius: 7 },
  content: { flex: 1, marginLeft: 80, paddingTop: 32, paddingRight: 32, justifyContent: 'center' },
  closeButton: { position: 'absolute', top: 18, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 20 },
  closeIcon: { width: 16, height: 16, tintColor: '#FFF' },
  sectionTitle: { color: Colors.titleGold, fontSize: 16, fontFamily: 'Montserrat-ExtraBold', marginBottom: 12 },
  description: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontFamily: 'Montserrat-SemiBold', marginBottom: 28 },
  recordButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 28, paddingHorizontal: 24, paddingVertical: 14, gap: 14, opacity: 0.5 },
  recordCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: '#FF4800', justifyContent: 'center', alignItems: 'center' },
  recordDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF4800' },
  recordText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
});
