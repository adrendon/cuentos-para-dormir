const { withMainActivity } = require('expo/config-plugins');

/**
 * Make Android's physical volume buttons always control the media stream.
 * Without this, Android can select the ringtone stream while the app is open
 * but no narration is actively requesting audio focus (for example onboarding).
 */
module.exports = function withMusicVolumeControls(config) {
  return withMainActivity(config, (androidConfig) => {
    if (androidConfig.modResults.language !== 'kt') {
      throw new Error('withMusicVolumeControls expects a Kotlin MainActivity');
    }

    let source = androidConfig.modResults.contents;
    if (!source.includes('import android.media.AudioManager')) {
      source = source.replace(
        /^(package\s+[^\n]+\n)/m,
        '$1\nimport android.media.AudioManager\n'
      );
    }

    if (!source.includes('volumeControlStream = AudioManager.STREAM_MUSIC')) {
      source = source.replace(
        /(override fun onCreate\([^)]*\)\s*\{)/,
        '$1\n    volumeControlStream = AudioManager.STREAM_MUSIC'
      );
    }

    androidConfig.modResults.contents = source;
    return androidConfig;
  });
};
