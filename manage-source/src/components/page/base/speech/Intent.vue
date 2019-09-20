<template>
    <div class="speech-tab-pane">

        <el-tabs v-model="intentActiveName" @tab-click="handleClick">
            <el-tab-pane label="通用意图" name="iTy"></el-tab-pane>
            <el-tab-pane label="行业意图" name="iHy"></el-tab-pane>
            <el-tab-pane label="用户意图" name="iYh"></el-tab-pane>
        </el-tabs>
        <component :is="intentActiveName"></component>
    </div>
</template>

<script>

    import iTy from './IntentTy';
    import iHy from './IntentHy';
    import iYh from './IntentYh';
    export default {
        name: 'intent',
        data() {
            return {
                intentActiveName:'iTy'
            }
        },
        components:{
            iTy,
            iHy,
            iYh
        },
        computed: {

        },
        created(){
            this.intentActiveName = this.$store.state.currIndex||'iTy'
        },
        watch: {
            
        },
        methods: {
            handleClick(tab){
                this.$store.dispatch('setTabIndex',tab.name)
            }
        },
        destroyed(){
           
        }
    }

</script>


<style  lang="less">

</style>
