<template>
    <el-row>
        <el-col :span="24">
            <div class="content-box-top"">
                <el-input v-model="groupName" clearable placeholder="输入知识库名称" @change="searchChange" class="handle-input mr10" @keyup.native.13="search"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
            </div>
        </el-col>
        <el-col :span="24">
            <div style="padding-top:50px;padding-bottom: 10px;color:#fdc83c;font-size: x-large">
                <span style="font-size: x-large" class="primary el-icon-arrow-left" circle></span>
                <span style="font-size:large" @click="goKnoledge">返回通用知识库列表</span>
            </div>
        </el-col>
        <el-col>
            <div class="w-cantainer task-table-cantainer" >
                <div class="box-card task-card">
                    <el-tabs >
                        <el-tab-pane label="" name="first">
                        </el-tab-pane>
                    </el-tabs>

                    <el-table
                            stripe
                            :data="knowledgeData"
                            @sort-change="sortChange"
                            @selection-change="handleSelectionChange"
                            :row-class-name="tableRowClassName"
                            :height="tableHeight">
                        <!--<el-table-column-->
                                <!--type="selection"-->
                                <!--class="isEdit"-->
                                <!--width="55">-->
                        <!--</el-table-column>-->
                        <el-table-column
                                prop="questionContent"
                                label="主问题">
                        </el-table-column>
                        <el-table-column
                                prop="answerContent"
                                label="回答">
                        </el-table-column>
                        <el-table-column
                                width="140"
                                sortable
                                prop="editTime"
                                label="更新时间">
                        </el-table-column>
                        <el-table-column
                                width="100"
                                prop="editor"
                                label="操作人">
                        </el-table-column>
                        <el-table-column
                                width="60"
                                label="音频">
                            <template slot-scope="scope">
                                <span class="w_icon_play w_icon_pause" v-show="scope.row.soundPath" @click="handleVideo(scope.row)"></span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="140" align="center">
                            <template slot-scope="scope">
                                <!-- <div v-show="!scope.row.isEdit || scope.row.isEdit=='0'">  -->
                                <el-button type="text" @click="handleLook(scope.row.id)">查看</el-button>
                                <!--<el-button  type="text" @click="handleDelete(scope.$index, scope.row)">删除</el-button>-->
                                <!-- </div> -->
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination">
                        <el-pagination background @current-change="handleCurrentChange"
                                       layout="total, prev, pager, next,jumper"
                                       :total="pagination.total"
                                       :page-size="pagination.pageSize"
                        >
                        </el-pagination>
                    </div>

                </div>
            </div>
        </el-col>
        <el-dialog title="音频" :visible.sync="videoVisible" width="600px">
            <w-video :source="viewSource" :playing="viewPlaying"/>
        </el-dialog>
    </el-row>

</template>

<script>
    import bus from '../common/bus';
    import wVideo from './base/Video';
    import wSound from './Sound';
    export default {
        data() {
            return {
                viewPlaying:false,
                groupName:"",
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10
                },
                cur_page:1,
                knowledgeData:[],
                tableHeight:500,
                multipleSelection:[],
                groupId:"",
                videoVisible:false,
                viewSource:''
            }
        },
        created() {
            this.groupId = this.$route.params.id
            this.queryKnowledgeItemList()
        },
        components: {
            wVideo,
            wSound
        },
        methods: {
            goKnoledge:function () {
                this.$router.push("/generalknowledge")
            },
            tableRowClassName({row,rowIndex}){
                if(row.isEdit && row.isEdit*1>0){
                    return 'row-not-edit';
                }
            },
            searchChange:function () {

            },
            search:function () {
                this.cur_page = 1;
                this.queryKnowledgeItemList()
            },
            sortChange:function () {

            },
            handleSelectionChange:function (val) {
                console.log("handleSelectionChange",val)
                this.multipleSelection = val;
            },
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryKnowledgeItemList();
            },
            queryKnowledgeItemList(){
                let params={
                    groupId:this.groupId,
                    searchType:2,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize,
                    needMemberId:false
                }
                if (this.groupName){
                    params.queryKey=this.groupName;
                }
                if(this.sortList){
                    params.sortList =this.sortList;
                }

                $.post(this.$baseUrl+'knowledge/queryKnowledgeItemList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){

                        let data = res.returnObject && res.returnObject.recordList;
                        if(data){
                            let newData = [];
                            let newAnswerContent=[];
                            data.forEach((item,index)=>{
                                let answerContent = '';

                                try{
                                    answerContent = JSON.parse(item.answerContent);
                                }catch(e){
                                    answerContent = item.answerContent;
                                }
                                if(Object.prototype.toString.call(answerContent)=='[object Array]' && answerContent.length){
                                    answerContent.forEach((list,num)=>{
                                        let newList = {
                                            questionContent:num==0?item.questionContent:'',
                                            answerContent:list.text,
                                            editTime:num==0?item.editTime:'',
                                            editor: num==0?item.editor:'',
                                            editorId: item.editorId,
                                            id: item.id,
                                            soundPath:list.soundPath,
                                            soundDuration:list.soundDuration,
                                            soundSize:list.soundSize,
                                            isEdit:num
                                        }
                                        newAnswerContent.push(newList);
                                    })
                                }else{
                                    newAnswerContent.push(item);
                                }
                            });

                            this.knowledgeData = newAnswerContent;
                        }

                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            handleVideoAnswer(){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =this.creatFAQVForm.answerContent[this.currentIndex].soundPath;
                })
            },
            handleVideo(item){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =item.soundPath;
                })
            },
            handleLook:function (val) {
                this.$router.push('/repository/viewknoledgeitem/'+val)
            }


        },
        destroyed(){

        }
    }
</script>


<style scoped lang="less">
    .task-table-cantainer{
        background: #fff;
        color: #303133;
        border-radius: 5px;
    }
    .handle-input {
        width:240px;
        display: inline-block;
    }
    .creatDialog{
    .el-input{
        width: 380px;
    }
    .file-btn{
    .el-input{
        width:88px;
    }
    }
    .el-icon-question{
        font-size: 16px;
        color: #919FA9;
    }
    .data-btn-box{

    .el-button{
        width: 88px;
        margin-left: 0;
        margin-bottom: 10px;
    }
    }
    }
    .tip-content{
        width:164px;
        padding:5px;
        line-height: 18px;
    }
    .handle-box {
        margin-bottom: 20px;
    }
    .el-table .cell{
        position: relative;
    }


    .handle-select {
        width: 120px;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .table{
        width: 100%;
        font-size: 14px;
    }
    #file{
        position:absolute;
        width: 100%;
        height: 100%;
        left:0;
        top:0;
        opacity: 0;
    }
    .red{
        color: #ff0000;
    }
    .blue{
        color: #fea200;
    }
    .el-button+.el-button{
        margin-left: 0;
    }
</style>