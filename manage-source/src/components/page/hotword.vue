<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>热词管理</el-breadcrumb-item>
                <el-breadcrumb-item>{{resourceTxt}}</el-breadcrumb-item>
                <el-breadcrumb-item v-if="activeName=='second'">{{soundTxt}}</el-breadcrumb-item>
            </el-breadcrumb>
            <keep-alive>
                <el-tabs v-model="activeName" @tab-click="handleTabClick">
                    <el-tab-pane label="行业词典" name="first"></el-tab-pane>
                    <el-tab-pane label="用户词典" name="second"></el-tab-pane>
                </el-tabs>
            </keep-alive>
        </div>
        <div class="admin-body">
            <!-- 行业词典 -->
            <hy-hotword v-if="activeName=='first'"/>
            <!--用户词典-->
            <yh-hotword v-else @soundTxt="showSoundTxt"/>
        </div>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import common from '../common/common';
    import hyHotword from './hotwordHy';
    import yhHotword from './hotwordYh';
    export default {
        name: 'hotword',
        components: {
            hyHotword,
            yhHotword,
        },
        data() {
            return {
                /*导航相关*/
                activeName: 'first',
                resourceTxt: '行业词典',
                soundTxt: '新建词典',
            }
        },
        created() {
            this.type = this.$route.query.type || 1;
            // 一级导航
            switch (this.type) {
                case '1':
                    this.activeName = 'first';
                    this.resourceTxt = '行业词典';
                    break;
                case '2':
                    this.activeName = 'second';
                    this.resourceTxt = '用户词典';
                    break;
            }
        },
        computed: {},
        methods: {
            /*导航相关*/
            /**
             * 一级导航tab点击
             * @param type
             */
            handleTabClick(tab) {
                let type;
                switch (tab.name) {
                    case 'first':
                        type = '1';
                        this.resourceTxt = '行业词典';
                        break;
                    case 'second':
                        type = '2';
                        this.resourceTxt = '用户词典';
                        break;
                }
                this.$router.push({query: {type: type}});
            },

            /**
             * 重设导航名称
             * @param msg
             */
            showSoundTxt(msg) {
                this.soundTxt = msg;
            },
        },
        watch: {
        }
    };


</script>

<style scoped lang="less">
    .admin-body{
        padding-top: 10px;
    }
    .industry{
        .el-radio--medium.is-bordered{
            margin-left: 0;
            margin-right: 10px;
            margin-bottom:10px;
        }
        .el-select{
            width: 350px;
        }
    }

    .first-row{
        .el-table{
            border-left: 1px solid #ebeef5;
        }
    }
    .sound-page{
        .el-card__body{
            padding: 0;
        }
        .sound-body{
            margin: 0 auto;
        }
        .sound-top{
            margin-bottom:20px;
        }
    }
    .handle-input {
        width:240px;
        display: inline-block;
    }
    .sound_top_btn_del{
        float:right;
    }
    .upload-btn-sound{
        position: relative;
        .el-input{
            position: absolute;
            left: 0;
            width: 100%;
            top: 0;
            height:100%;
            opacity: 0;
            filter: alpha(opacity=0);
        }
    }
    .crumbs{
        display: inline;
        float: left;
        margin-top: 0;
        .link{
            color: #4E8FF9;
        }
    }
    .sound-table {
        .icon-icon_play{
            float: left;
            cursor: pointer;
        }
    }
    #file,
    #importFile{
        position:absolute;
        width: 100%;
        height: 100%;
        left:0;
        top:0;
        opacity: 0;
    }
    .video-edit-box{
        .icon-icon_play{
        }
        .el-textarea {
            width:auto;
            margin-left:28px;
            border:none;
            vertical-align: middle;
            display: inherit;
            .el-textarea__inner{
                border:none;
            }
        }
        .video-edit-box-text{
            margin-left: 5px;
            padding-top: 5px;
        }
    }
    .menu-parent{
        height: 48px;
        line-height: 48px;
        padding: 0 0 0 30px;
        &.active{
            background-color: #F7F8FB;
            border-left: 4px solid #4E8FF9;
        }
    }
    .repository-menu-item{
        padding-left: 40px;
    }
</style>
