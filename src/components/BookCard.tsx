import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, BookCardLayout } from '../types/book';
import { Colors } from '../theme/colors';
import { DownloadButton } from './DownloadButton';
import { BookCardMenu } from './BookCardMenu';
import { getStableBookCover } from '../assets/books/bookVisualRegistry';

interface BookCardProps { book: Book; onPress:(book:Book,layout:BookCardLayout)=>void; onDownloadComplete:(bookId:string)=>void; onToggleFavorite:(bookId:string)=>void; onDelete:(bookId:string)=>void; index?:number; cardWidth:number; }
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const animatedBooks = new Set<string>();

function BookCardComponent({ book,onPress,onDownloadComplete,onToggleFavorite,onDelete,index=0,cardWidth }:BookCardProps){
  const isAvailable=book.isDownloaded; const isIncluded=book.isEmbedded; const alreadyAnimated=animatedBooks.has(book.id);
  const displayScale=cardWidth/361;
  // Covers remain responsive, but controls/chrome must not grow beyond the
  // Android reference size on wide devices.
  const uiScale=clamp(displayScale,0.72,1);
  const titleSize=clamp(cardWidth*0.078,20,28);
  const edgeWidth=12*uiScale; const cardHeight=cardWidth*(402/361);
  const [showMenu,setShowMenu]=useState(false); const [menuAnchor,setMenuAnchor]=useState({x:0,y:0});
  const fadeAnim=useRef(new Animated.Value(alreadyAnimated?1:0)).current; const scaleAnim=useRef(new Animated.Value(alreadyAnimated?1:0.94)).current;
  const translateXAnim=useRef(new Animated.Value(alreadyAnimated?0:index%3===0?-30:index%3===2?30:0)).current; const translateYAnim=useRef(new Animated.Value(alreadyAnimated?0:index%3===1?22:14)).current;
  const pressScale=useRef(new Animated.Value(1)).current; const cardRef=useRef<any>(null);
  useEffect(()=>{ if(animatedBooks.has(book.id)) return; const delay=Math.min(index,8)*65; Animated.parallel([
    Animated.timing(fadeAnim,{toValue:1,duration:360,delay,useNativeDriver:true}), Animated.spring(scaleAnim,{toValue:1,delay,speed:16,bounciness:2,useNativeDriver:true}), Animated.timing(translateXAnim,{toValue:0,duration:420,delay,useNativeDriver:true}), Animated.timing(translateYAnim,{toValue:0,duration:420,delay,useNativeDriver:true})
  ]).start(()=>animatedBooks.add(book.id)); },[book.id,fadeAnim,index,scaleAnim,translateXAnim,translateYAnim]);
  const handlePress=()=>{ if(!isAvailable&&!isIncluded)return; Animated.sequence([Animated.spring(pressScale,{toValue:1.035,speed:28,bounciness:5,useNativeDriver:true}),Animated.timing(pressScale,{toValue:0.975,duration:90,useNativeDriver:true}),Animated.timing(pressScale,{toValue:1,duration:90,useNativeDriver:true})]).start(()=>cardRef.current?.measureInWindow((x:number,y:number,width:number,height:number)=>onPress(book,{x,y,width,height}))); };
  const coverSource=getStableBookCover(book.folderName);
  return <Animated.View style={[styles.cardShadow,{width:cardWidth,height:cardHeight,borderRadius:12*uiScale,opacity:fadeAnim,transform:[{translateX:translateXAnim},{translateY:translateYAnim},{scale:Animated.multiply(scaleAnim,pressScale)}]}]}>
    <TouchableOpacity ref={cardRef} style={[styles.container,{width:cardWidth,height:cardHeight,borderRadius:12*uiScale,backgroundColor:book.coverColor}]} onPress={handlePress} activeOpacity={isAvailable||isIncluded?0.85:1}>
      <View style={[styles.coverSurface,{right:edgeWidth}]}>{coverSource?<Image source={coverSource} style={styles.coverImage} resizeMode="cover"/>:<View style={[styles.placeholder,{backgroundColor:book.coverColor}]}><Text style={styles.placeholderEmoji}>📖</Text></View>}
        <LinearGradient colors={['transparent','rgba(0,0,0,0.84)']} locations={[0.35,1]} style={[styles.titleGradient,{minHeight:cardWidth*0.31,paddingBottom:15*uiScale,paddingHorizontal:13*uiScale}]}><Text style={[styles.title,{fontSize:titleSize,lineHeight:titleSize*1.12,textShadowRadius:4*uiScale}]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>{book.title}</Text></LinearGradient>
        {!isAvailable&&!book.isEmbedded&&<View style={styles.downloadContainer} pointerEvents="box-none"><DownloadButton folderName={book.folderName} sizeMB={book.sizeMB} accentColor={book.coverColor} displayScale={uiScale} onDownloadComplete={()=>onDownloadComplete(book.id)}/></View>}
      </View>
      <View style={[styles.bookEdge,{width:edgeWidth,backgroundColor:book.coverColor}]}><View style={styles.edgeHighlightStrong}/><View style={styles.edgeHighlightSoft}/><View style={styles.edgeShadow}/></View>
      <Image source={require('../assets/ui/ic_page_mark.png')} style={[styles.ribbon,{top:-2*uiScale,right:18*uiScale,width:45*uiScale,height:62*uiScale}]} resizeMode="stretch"/>
      <TouchableOpacity style={[styles.menuButton,{top:4*uiScale,right:29*uiScale,width:24*uiScale,height:42*uiScale}]} onPress={(event)=>{event.stopPropagation?.();setMenuAnchor({x:event.nativeEvent.pageX,y:event.nativeEvent.pageY});setShowMenu(true);}}><Text style={[styles.menuButtonText,{fontSize:28*uiScale,lineHeight:31*uiScale}]}>⋮</Text></TouchableOpacity>
      {isAvailable&&book.isRead&&<View style={[styles.readBadge,{bottom:10*uiScale,left:8*uiScale}]}><Text style={styles.readBadgeText}>✓</Text></View>}{book.isFavorite&&<View style={[styles.favoriteBadge,{top:7*uiScale,left:8*uiScale}]}><Text style={styles.favoriteText}>★</Text></View>}
    </TouchableOpacity>
    <BookCardMenu visible={showMenu} book={book} anchor={menuAnchor} onToggleFavorite={()=>onToggleFavorite(book.id)} onDelete={()=>onDelete(book.id)} onClose={()=>setShowMenu(false)}/>
  </Animated.View>;
}

export const BookCard = memo(BookCardComponent, (previous, next) =>
  previous.book === next.book && previous.index === next.index && previous.cardWidth === next.cardWidth && previous.onPress === next.onPress && previous.onDownloadComplete === next.onDownloadComplete && previous.onToggleFavorite === next.onToggleFavorite && previous.onDelete === next.onDelete
);

const styles=StyleSheet.create({cardShadow:{elevation:9,shadowColor:'#000',shadowOffset:{width:0,height:5},shadowOpacity:0.36,shadowRadius:8},container:{overflow:'hidden'},coverSurface:{position:'absolute',top:0,left:0,bottom:0,overflow:'hidden'},coverImage:{width:'100%',height:'100%'},placeholder:{flex:1,justifyContent:'center',alignItems:'center'},placeholderEmoji:{fontSize:48},titleGradient:{position:'absolute',bottom:0,left:0,right:0,justifyContent:'flex-end'},title:{color:Colors.textWhite,fontFamily:'Montserrat-ExtraBold',textAlign:'center',textShadowColor:'rgba(0,0,0,0.65)',textShadowOffset:{width:0,height:2}},downloadContainer:{position:'absolute',top:0,left:0,right:0,bottom:0},bookEdge:{position:'absolute',top:0,right:0,bottom:0,overflow:'hidden'},edgeHighlightStrong:{position:'absolute',top:0,bottom:0,left:1,width:3,backgroundColor:'rgba(255,255,255,0.48)'},edgeHighlightSoft:{position:'absolute',top:0,bottom:0,left:5,width:2,backgroundColor:'rgba(255,255,255,0.24)'},edgeShadow:{position:'absolute',top:0,bottom:0,right:0,width:3,backgroundColor:'rgba(0,0,0,0.22)'},ribbon:{position:'absolute',tintColor:'#FFFFFF'},menuButton:{position:'absolute',justifyContent:'center',alignItems:'center'},menuButtonText:{color:'#4F5364',fontWeight:'bold'},readBadge:{position:'absolute',width:22,height:22,borderRadius:11,backgroundColor:Colors.success,justifyContent:'center',alignItems:'center'},readBadgeText:{color:Colors.textWhite,fontSize:12,fontWeight:'bold'},favoriteBadge:{position:'absolute',width:22,height:22,borderRadius:11,backgroundColor:Colors.chipOrange,justifyContent:'center',alignItems:'center'},favoriteText:{color:Colors.textWhite,fontSize:13}});
