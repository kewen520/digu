<template>
    <el-row>
        <el-col :span="24">
            <div class="content-box-top" style="position:fixed">
                <el-input v-model="searchFrom.groupName" clearable placeholder="输入知识库名称" @change="searchChange" class="handle-input mr10" @keyup.native.13="search"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
            </div>
        </el-col>
        <el-col :span="24">
            <div  style="padding-top:50px;padding-bottom: 10px;color:#fdc83c;font-size: x-large">
                <!-- <span style="font-size: x-large" class="primary el-icon-arrow-left" circle></span> -->
                <!-- <span style="font-size:large" @click="goRepository">返回</span> -->
				<a style="font-size:large" href="#" @click="goRepository"><< 返回</a>
            </div>
        </el-col>
        <!--<el-col :span="24">-->
            <!--<router-link to="/repository/set/unclassified">《返回</router-link>-->
        <!--</el-col>-->
        <el-col>
            <div class="w-cantainer task-table-cantainer" >
                <div class="box-card task-card">
                    <el-tabs >
                        <el-tab-pane label="通用知识库列表" name="first">
                        </el-tab-pane>
                    </el-tabs>

                    <el-table :data="taskTableData" stripe class="table"
                              :height="height"
                              :options="options"
                              :pagination="pagination"
                              ref="multipleTable"
                              @sort-change="sortChange"
                              @filter-change="filterChange"
                              @selection-change="handleSelectionChange">
                        <!--<el-table-column  width="55" prop="editTimex" label=""></el-table-column>-->
                        <el-table-column prop="groupName" label="知识库名称" width="240" fixed>
                        </el-table-column>
                        <el-table-column  width="200"  prop="industryName" column-key="industryName" label="行业领域"
                                          :filters="industryList">
                        </el-table-column>
                        <el-table-column
                                width="200"
                                prop="editTime"
                                sortable
                                label="更新时间">
                        </el-table-column>
                        <el-table-column label="操作" width="200" align="center" fixed="right">
                            <template slot-scope="scope">
                                <el-button type="text"  @click="handleLook(scope.$index, scope.row)">查看</el-button>
                                <el-button type="text" @click="handleCopy(scope.row)">复制</el-button>
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
        <el-dialog
                title="复制到知识库"
                :visible.sync="dialogVisible"
                width="30%"
        >
            <el-form ref="form" :model="form" label-width="120px" >
                <el-form-item label="知识库名称" >
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="知识库分类">
                    <el-select v-model="form.konledgeTypeId" placeholder="请选择知识库">
                        <el-option v-for="item in knowledgeTypeList" :label="item.typeName" :value="item.id" :key="item.id"></el-option>
                        <div class="select_add_item">
                            <div class="select-menu-input-box" v-if="createKnoledgeForm.isShow">
                                <el-input v-model="createKnoledgeForm.typeName" placeholder="知识库名称"></el-input>
                            </div>
                            <div class="select-icon-box" v-if="createKnoledgeForm.isShow">
                                <i class="el-icon-check" @click="handleConfirmAddRole"></i>
                                <i class="el-icon-close" @click="createKnoledgeForm.isShow = false"></i>
                            </div>
                            <div>
                                <i class="el-icon-plus" @click="createKnoledgeForm.isShow = true">
                                    <span>新增知识库</span>
                                </i>
                            </div>
                        </div>
                    </el-select>
                </el-form-item>
                <el-form-item label="">
                    <el-checkbox @change="isCopySound" v-model="form.checked">同时复制音频</el-checkbox>
                </el-form-item>
                <el-form-item label="">
                    <el-select v-if="showSoundSelect" v-model="form.soundGroup"  placeholder="请选择音频文件夹">
                        <el-option v-for="item in soundTypeList" :label="item.configGroupName" :value="item.id" :key="item.id"></el-option>
                        <div class="select_add_item">
                            <div class="select-menu-input-box" v-if="createSoundForm.isShow">
                                <el-input v-model="createSoundForm.typeName" placeholder="文件夹名称"></el-input>
                            </div>
                            <div class="select-icon-box" v-if="createSoundForm.isShow">
                                <i class="el-icon-check" @click="handleConfirmAddSound"></i>
                                <i class="el-icon-close" @click="createSoundForm.isShow = false"></i>
                            </div>
                            <div>
                                <i class="el-icon-plus" @click="createSoundForm.isShow = true">
                                    <span>新增音频文件夹</span>
                                </i>
                            </div>
                        </div>
                    </el-select>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button :disabled="disConfirm" type="primary" @click="copyFromManager">确 定</el-button>
           </span>
        </el-dialog>
    </el-row>
</template>

<script>
    export default {
        data() {
            return {
                disConfirm:false,
                createKnoledgeForm:{
                    isShow:false,
                    typeName:"",
                },
                createSoundForm:{
                    isShow:false,
                    typeName:"",
                },
                form:{

                },
                showSoundSelect:false,
                select_word:"",
                height:500,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 20
                },
                filtersIndustry:[],
                taskTableData:[],
                options: {
                    stripe: true, // 是否为斑马纹 table
                    loading: true, // 是否添加表格loading加载动画
                    highlightCurrentRow: true, // 是否支持当前行高亮显示
                    mutiSelect: true // 是否支持列表项选中功能
                },
                cur_page:1,
                searchFrom : {
                    industryTypes:"",
                    groupName:"",

                },
                dialogVisible:false,
                industryList:[],
                knowledgeTypeList:[],
                soundTypeList:[],
            }
        },
        created() {
            this.queryKnowledgeGroupListOfPage()
            this.queryAllIndustryList();
            this.queryKnowledgeTypeList();
            this.querySoundConfigGroupList();

        },
        methods: {
            isCopySound:function (val) {
                this.showSoundSelect=val
//                this.form.soundGroup = ""
            },
            search:function () {
                this.cur_page = 1
                this.queryKnowledgeGroupListOfPage()
            },
            searchChange:function () {

            },
            sortChange:function (val) {
                console.log(val)
            },
            handleSelectionChange:function (val) {
                console.log(val)
            },
            filterChange:function (val) {
                this.cur_page = 1;
                var ids = []
                for(var i in val.industryName){
                    ids.push(val.industryName[i])
                }
                this.searchFrom.industryTypes = ids
                this.queryKnowledgeGroupListOfPage()
            },
            queryKnowledgeGroupListOfPage:function () {
                var params = {}
                params.currentPage = this.cur_page - 1;
                params.pageSize = this.pagination.pageSize;
                params.templateType = 1;
                if(this.searchFrom.groupName != ""){
                    params.groupName = this.searchFrom.groupName
                }
                if(this.searchFrom.industryTypes != "" && this.searchFrom.industryTypes!= []){
                    params.industryTypes = this.searchFrom.industryTypes
                }
                $.post(this.$baseUrl+'knowledge/queryManagerKnowledgeGroupListOfPage.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.taskTableData = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            handleCurrentChange:function (val) {
                this.cur_page = val
                this.queryKnowledgeGroupListOfPage();

            },
            queryAllIndustryList:function () {
                $.get(this.$baseUrl+'intention/queryAllIndustryList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(res.returnObject && res.returnObject.length){
                            console.log(res.returnObject);
                            for(var i in res.returnObject){
                                let item = {}
                                item.text=res.returnObject[i].industryName
                                item.value=res.returnObject[i].id
                                this.industryList.push(item)
                            }
                        }
                    }
                });
            },
            handleLook:function (index, row) {
                this.$router.push('/repository/viewknoledgegroup/'+row.id)
            },
            goRepository:function () {
                this.$router.push('/repository/set/unclassified')
            },
            handleCopy:function (row) {
                this.dialogVisible = true
                this.disConfirm = false;
                this.form.name = row.groupName
                this.form.groupId = row.id
            },
            queryKnowledgeTypeList(){
                this.knowledgeTypeList = []
                $.get(this.$baseUrl + 'knowledge/queryKnowledgeTypeList.json').then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.knowledgeTypeList = res.returnObject
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            querySoundConfigGroupList(){
                this.soundTypeList = []
                $.get(this.$baseUrl+'sound/querySoundConfigGroupList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let newData = res.returnObject;
                        for(var i in newData){
                            if(newData[i].soundConfigGroupType == 2 && newData[i].duplicateFlag == 1){
                                this.soundTypeList.push(newData[i])
                            }
                        }

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            handleConfirmAddRole:function () {
                if(this.createKnoledgeForm.typeName == ""){
                    this.$message.error("知识库不能为空数据")
                }else {
                    this.addKnowledgeType()
                }
                
            },
            addKnowledgeType:function () {
                let data={
                    typeName:this.createKnoledgeForm.typeName
                }
                $.post(this.$baseUrl+'knowledge/addKnowledgeType.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.queryKnowledgeTypeList()
                        this.createKnoledgeForm.isShow = false
                        this.createKnoledgeForm.typeName = ""
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            handleConfirmAddSound:function () {
                if(this.createSoundForm.typeName == ""){
                    this.$message.error("音频文件夹空")

                }else {
                    this.addSoundConfigGroup()
                }
            },
            addSoundConfigGroup:function () {
                let data={
                    configGroupName:this.createSoundForm.typeName,
                    soundConfigGroupType: 2,
                    duplicateFlag:1
                }
                $.post(this.$baseUrl+'sound/addSoundConfigGroup.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.querySoundConfigGroupList()
                        this.createSoundForm.isShow = false
                        this.createSoundForm.typeName = ""
                        this.$message.success('添加成功！');
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            copyFromManager:function () {
                console.log(this.form)
                this.disConfirm=true
                var params = {}
                if(this.form.checked && this.form.soundGroup!=""){
                    params.soundGroup = this.form.soundGroup;
                }

                params.groupId = this.form.groupId;
                params.groupName = this.form.name;
                params.konledgeTypeId = this.form.konledgeTypeId;
                $.post(this.$baseUrl+'knowledge/copyKnoledgeAndSound.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.dialogVisible = false
                        this.$message.success("复制成功")
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
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
    .select_add_item {
    .el-icon-plus{
        margin-left: 15px;
        color: #a48059;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
    span{
        margin-left: 10px;
    }
    }

    .select-menu-input-box {
        width: 110px;
        float: left;
        margin: -2px 10px 10px 12px;
    .el-input {
        width: 100%;
    }
    }

    .el-input__inner {
        width: 100%;
        padding: 0 5px;
    }

    .select-icon-box {
        padding-top: 5px;

    i {
        font-size: 12px;
        margin-left: 5px;
        font-weight: bold;
        cursor: pointer;
    }

    .el-icon-close {
        color: #F04A61;
    }

    .el-icon-check {
        color: #0FD9AC;
    }

    .icon-ico_move-sort {
        cursor: move;
    }
    }
    }
</style>