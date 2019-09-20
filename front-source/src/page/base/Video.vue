<template>
    <div class="video-box">
        <div >
            <span class="viewItemPlay"><i class="w_icon_pause" :class="{'w_icon_play':videoPlay}" @click="handlePlaying"></i></span>

            <div @mousedown="barDown">
                <el-slider class="video-slider" v-model="viewPlayValue" :show-tooltip="false" @change="changeSlider"></el-slider>
            </div>
            <span class="video-time">{{currentMusic.currentTime | format}}<span v-show="currentMusic.durationShow">/{{currentMusic.duration | formatDuration}}</span></span>
        </div>
        
        <audio  id="audioEle" ref="w_audio" :src="viewSource" style="width: 0px;" >
            <source  >
        </audio>
        <!-- <audio preload="auto" controls>
            <source :src="viewSource" >
        </audio> -->
    </div>
    
</template>

<script>
import bus from '../../common/bus';
export default {
    data() {
        return{
            viewSource:'',
            viewPlayValue:0,
            videoPlay:false,
            soundPath:'',
            currentMusic:{
                duration:0,
                currentTime:0,
                durationShow:true
            },
            
        }
    },
    props:{
        source:{
            type:[String]
        },
        playing: {
            type: [Boolean]
        },
    },
    mounted(){
        bus.$on('viewPlaying',msg=>{
            if(msg){
                this.videoPlay = true;
                this.$refs.w_audio && this.$refs.w_audio.pause();
            }
        });
    },
    methods: {
        handlePlaying(){
            if(!this.source){
                this.$message.error('请选择要播放的节点！');
                return false;
            }
            if(this.videoPlay){
                this.videoPlay = false;
                this.$refs.w_audio.play();
                
            }else{
                this.videoPlay = true;
                this.$refs.w_audio.pause();
            }
        },
         percentMusic(){

            let duration = this.$refs.w_audio.duration;
            let currentTime = this.$refs.w_audio.currentTime;

            this.getFilePlayDuration().then((res)=>{
                if(res.returnObject){
                    duration = res.returnObject;
                }

                if(parseFloat(duration) && duration !='Infinity'){
                    this.currentMusic.duration = duration;
                }else{
                    this.currentMusic.durationShow = false; 
                }

                this.$refs.w_audio.ontimeupdate = () => {
                    
                    this.currentMusic.currentTime = this.$refs.w_audio.currentTime;
                    let lduration = duration;
                    if(lduration<=2){
                        lduration = lduration/2;
                    }
                    var value = this.currentMusic.currentTime && duration ? this.currentMusic.currentTime / lduration*100 : 0;

                    this.viewPlayValue = value;

                };
                this.$refs.w_audio.onended = () => {
                    this.videoPlay = true;
                }
                
            })

        },
        barDown(val){
            this.$refs.w_audio.pause();
        },
        changeSlider(time){

            if(this.$refs.w_audio){
                this.viewPlayValue = time;
                this.currentMusic.currentTime = this.$refs.w_audio.currentTime = time*this.currentMusic.duration/100;
                this.$refs.w_audio.play();
            }
        },
        //得到文件播放时长
        getFilePlayDuration(){
            return $.get(this.$baseUrl+'file/getFilePlayDuration.json?filePath='+this.soundPath).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    return res;
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        }
    },
   
    watch:{
        source(src){
            
            let slef = this;
            // this.currentMusic={
            //     duration:0,
            //     currentTime:0,
            //     durationShow:true
            // }
            
            // this.viewSource = src;
            this.soundPath = src;
            this.viewSource = this.$baseUrl+'file/downloadFile.html?filePath='+src;
            this.videoPlay = true;

            setTimeout(()=>{
                // this.$refs.w_audio.play();
                this.percentMusic();
            },200)
        },
    },
    filters: {
        //时间格式化
        format(value) {
            let minute = Math.floor(value / 60);
            let second = Math.floor(value % 60);
            return `${addZero(minute)}:${addZero(second)}`
        },
        formatDuration(value) {

            let other = value % 3600;
            let minutes = Math.floor(other / 60);
            let seconds = Math.floor(other % 60);
            return addZero(minutes) + ':' + addZero(seconds)
        }
    }
}
function addZero(val){
    if(val){
        return val = val <10?`0${val}`:val;
    }else{
        return '00';
    }
    
}
</script>


<style scoped lang="less">
    .video-box{
        width: 410px;
        height:40px;
        margin: 0 auto;
        position: relative;
        padding:0 40px 0 40px;
        margin-bottom: 30px;
        .viewItemPlay{
            width: 20px;
            height: 38px;
            left: 0;
            top:8px;
            position: absolute;
        }
        .video-slider{
            width: 360px;
            float: left;
        }
        .video-time{
            position: absolute;
            right: 0;
            top: 8px;
        }
    }
    

</style>
