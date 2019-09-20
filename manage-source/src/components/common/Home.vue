<template>
    <div class="wrapper">
        <!-- <v-head></v-head> -->
        <v-sidebar></v-sidebar>
        <div class="content-box" :class="{'content-collapse':collapse}">
            <v-top></v-top>
            <div class="content" :class="{'contentTop':contentTop}">
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
    // import vHead from './Header.vue';
    import vSidebar from './Sidebar.vue';
    import vTop from './Top.vue';
    // import vTags from './Tags.vue';
    import bus from './bus';
    export default {
        data(){
            return {
                tagsList: [],
                // isShowTab:false,
                contentTop:false,
                collapse: false,
                // dashboardIsActive:false,
                // controlPanelIsActive:false,
                // noviceIsActive:false
            }
        },
        components:{
            vTop, vSidebar
        },
        created(){
            bus.$on('contentTop', msg => {
                this.contentTop = msg;
            });

            // bus.$on('dashboardIsActive', msg => {
            //     this.dashboardIsActive = msg;
            // });
            // bus.$on('controlPanel', msg => {
            //     this.controlPanelIsActive = msg;
            // });
            // bus.$on('novice', msg => {
            //     this.noviceIsActive = msg;
            // });

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
<style scoped>

</style>
