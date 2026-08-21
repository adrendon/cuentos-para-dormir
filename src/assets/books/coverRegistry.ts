/**
 * Static require() registry for bundled cover images.
 * React Native requires static paths for bundled assets.
 */

const covers: Record<string, any> = {
  ADayInReverse: require('./covers/ADayInReverse.webp'),
  AFunWalk: require('./covers/AFunWalk.webp'),
  AGoodIdea: require('./covers/AGoodIdea.webp'),
  AGreatFriendship: require('./covers/AGreatFriendship.webp'),
  ALittleAntsBigJob: require('./covers/ALittleAntsBigJob.webp'),
  AllIsNotLost: require('./covers/AllIsNotLost.webp'),
  APerfectHome: require('./covers/APerfectHome.webp'),
  Belka: require('./covers/Belka.webp'),
  BirdsChoir: require('./covers/BirdsChoir.webp'),
};

/**
 * Get the bundled cover image source for a book.
 * Returns a require() result usable in <Image source={...} />
 */
export function getBookCover(folderName: string): any | undefined {
  return covers[folderName];
}
