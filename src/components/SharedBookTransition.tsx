import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BookCardLayout } from '../types/book';
import { Colors } from '../theme/colors';

interface SharedBookTransitionProps { direction:'opening'|'closing'; source:BookCardLayout; coverSource?:ImageSourcePropType; firstPageSource?:ImageSourcePropType; coverColor:string; title:string; onComplete:()=>void; }
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export function SharedBookTransition({direction,source,coverSource,firstPageSource,coverColor,title,onComplete}:SharedBookTransitionProps){
  const {width,height}=useWindowDimensions(); const uiScale=clamp(height/407,0.78,1.08);
  const pageHeight=Math.min(height*0.72,300*uiScale); const pageWidth=Math.min(width*0.29,pageHeight*0.9); const bookLeft=(width-pageWidth*2)/2; const bookTop=(height-pageHeight)/2;
  const target:BookCardLayout={x:bookLeft+pageWidth,y:bookTop,width:pageWidth,height:pageHeight}; const progress=useSharedValue(0);
  useEffect(()=>{ progress.value=0; progress.value=withTiming(1,{duration:direction==='opening'?2280:2100,easing:Easing.inOut(Easing.cubic)},finished=>{if(finished)runOnJS(onComplete)();}); },[direction,onComplete,progress]);

  const backdrop=useAnimatedStyle(()=>({opacity:direction==='opening'?interpolate(progress.value,[0,0.16,1],[0,0.72,0.88]):interpolate(progress.value,[0,0.8,1],[0.88,0.68,0])}));
  const rightPage=useAnimatedStyle(()=>({opacity:direction==='opening'?interpolate(progress.value,[0.42,0.58,1],[0,1,1]):interpolate(progress.value,[0,0.5,0.7],[1,1,0]),transform:[{scale:direction==='opening'?interpolate(progress.value,[0.75,1],[1,1.9]):interpolate(progress.value,[0,0.24],[1.9,1])}]}));
  const leftPage=useAnimatedStyle(()=>({opacity:direction==='opening'?interpolate(progress.value,[0.56,0.72,1],[0,1,1]):interpolate(progress.value,[0,0.42,0.58],[1,1,0])}));
  const coverStyle=useAnimatedStyle(()=>{
    if(direction==='opening'){
      const travel=interpolate(progress.value,[0,0.38],[0,1],'clamp'); const left=interpolate(travel,[0,1],[source.x,target.x]); const top=interpolate(travel,[0,1],[source.y,target.y]); const w=interpolate(travel,[0,1],[source.width,target.width]); const h=interpolate(travel,[0,1],[source.height,target.height]); const rot=interpolate(progress.value,[0.38,0.72],[0,-178],'clamp'); const opacity=interpolate(progress.value,[0.82,1],[1,0]);
      return {left,top,width:w,height:h,opacity,borderRadius:9*uiScale,transform:[{perspective:1800},{translateX:-w/2},{rotateY:`${rot}deg`},{translateX:w/2}]};
    }
    const rot=interpolate(progress.value,[0.2,0.52],[-178,0],'clamp'); const travel=interpolate(progress.value,[0.52,1],[0,1],'clamp'); const left=interpolate(travel,[0,1],[target.x,source.x]); const top=interpolate(travel,[0,1],[target.y,source.y]); const w=interpolate(travel,[0,1],[target.width,source.width]); const h=interpolate(travel,[0,1],[target.height,source.height]); return {left,top,width:w,height:h,borderRadius:9*uiScale,transform:[{perspective:1800},{translateX:-w/2},{rotateY:`${rot}deg`},{translateX:w/2}]};
  });
  const chrome=useAnimatedStyle(()=>({opacity:direction==='opening'?interpolate(progress.value,[0,0.34,0.5],[1,1,0]):interpolate(progress.value,[0.62,0.85,1],[0,0.4,1])}));
  const spine=useAnimatedStyle(()=>({opacity:direction==='opening'?interpolate(progress.value,[0.32,0.48,0.75],[0,1,0.78]):interpolate(progress.value,[0,0.5,0.7],[0.78,1,0])}));

  return <View style={styles.root} pointerEvents="auto"><Animated.View style={[styles.background,backdrop]}/>
    {firstPageSource&&<>
      <Animated.View style={[styles.leftPage,{left:bookLeft,top:bookTop,width:pageWidth,height:pageHeight,borderColor:coverColor},leftPage]}><Image source={firstPageSource} style={styles.artwork} resizeMode="cover"/></Animated.View>
      <Animated.View style={[styles.rightPage,{left:bookLeft+pageWidth,top:bookTop,width:pageWidth,height:pageHeight,borderColor:coverColor},rightPage]}><Image source={firstPageSource} style={styles.artwork} resizeMode="cover"/></Animated.View>
    </>}
    <Animated.View style={[styles.spine,{left:bookLeft+pageWidth-5*uiScale,top:bookTop+5*uiScale,width:10*uiScale,height:pageHeight-10*uiScale},spine]}/>
    <Animated.View style={[styles.cover,{backgroundColor:coverColor,borderColor:coverColor},coverStyle]}>
      <View style={styles.coverFront}>{coverSource?<Image source={coverSource} style={styles.artwork} resizeMode="cover"/>:<Text style={styles.title}>{title}</Text>}<Animated.View style={[StyleSheet.absoluteFill,chrome]}><LinearGradient colors={['transparent','rgba(0,0,0,0.8)']} style={styles.titleGradient}><Text style={[styles.cardTitle,{fontSize:22*uiScale}]} numberOfLines={2}>{title}</Text></LinearGradient><Image source={require('../assets/ui/ic_page_mark.png')} style={[styles.ribbon,{right:24*uiScale,width:42*uiScale,height:58*uiScale}]}/></Animated.View></View>
      <View style={[styles.coverBack,{backgroundColor:coverColor}]}/>
    </Animated.View>
  </View>;
}

const styles=StyleSheet.create({root:{...StyleSheet.absoluteFillObject,zIndex:1000,overflow:'hidden'},background:{...StyleSheet.absoluteFillObject,backgroundColor:Colors.backgroundDark},cover:{position:'absolute',borderWidth:3,elevation:14,shadowColor:'#000',shadowOffset:{width:0,height:8},shadowOpacity:0.45,shadowRadius:12},coverFront:{...StyleSheet.absoluteFillObject,overflow:'hidden',borderRadius:7,backfaceVisibility:'hidden'},coverBack:{...StyleSheet.absoluteFillObject,borderRadius:7,backfaceVisibility:'hidden',transform:[{rotateY:'180deg'}]},leftPage:{position:'absolute',overflow:'hidden',borderWidth:3,borderTopLeftRadius:10,borderBottomLeftRadius:10,backgroundColor:'#F3F0E3'},rightPage:{position:'absolute',overflow:'hidden',borderWidth:3,borderTopRightRadius:10,borderBottomRightRadius:10,backgroundColor:'#F3F0E3'},spine:{position:'absolute',zIndex:4,backgroundColor:'rgba(0,0,0,0.32)',borderRadius:6},artwork:{width:'100%',height:'100%'},title:{flex:1,padding:24,color:'#FFF',fontSize:28,fontFamily:'BalooBhaijaan',textAlign:'center',textAlignVertical:'center'},titleGradient:{position:'absolute',left:0,right:0,bottom:0,paddingVertical:14,paddingHorizontal:14},cardTitle:{color:'#FFF',fontFamily:'Montserrat-SemiBold',fontWeight:'700',textAlign:'center'},ribbon:{position:'absolute',top:-2,tintColor:'#FFF'}});
