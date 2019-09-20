<template>
    <div class="wrapper">
        <v-sidebar></v-sidebar>
        <div class="content-box" :class="{'content-collapse':collapse}">
            <v-top></v-top>
            <div class="content" :class="{'contentTop':contentTop,'sound-content':isSound}">
                <transition name="slide-fade" mode="out-in">
                    <keep-alive :include="tagsList">
                        <router-view ></router-view>
                    </keep-alive>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
    import vSidebar from './Sidebar.vue';
    import vTop from './Top.vue';
    import bus from './bus';
    export default {
        data(){
            return {
                tagsList: [],
                contentTop:false,
                collapse: false,
                isSound:false
            }
        },
        components:{
            vTop, vSidebar
        },
        created(){
            bus.$on('contentTop', msg => {
                this.contentTop = msg;
            });

            bus.$on('collapse', msg => {
                this.collapse = msg;
            })
            // 只有在标签页列表里的页面才使用keep-alive，即关闭标签之后就不保存到内存中了。
            bus.$on('tags', msg => {
                let arr = [];
                for(let i = 0, len = msg.length; i < len; i ++){
                    msg[i].name && arr.push(msg[i].name);
                }
                this.tagsList = arr;
            })
        }
    }
</script>
<style lang="less" scoped>

</style>
