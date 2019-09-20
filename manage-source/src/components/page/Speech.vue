<template>
   <div class="container-admin">
       <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>话术管理</el-breadcrumb-item>
                <el-breadcrumb-item>{{speechStatusTxt}}</el-breadcrumb-item>
            </el-breadcrumb>
            <keep-alive>
                <el-tabs v-model="speechActiveName" @tab-click="tabHandleClick">
                    <el-tab-pane label="话术审核" name="first"></el-tab-pane>
                    <el-tab-pane label="话术库管理" name="second"></el-tab-pane>
                    <el-tab-pane label="意图库管理" name="third"></el-tab-pane>
                </el-tabs>
            </keep-alive>
        </div>
        <div class="admin-body">
            <!-- 话术审核 -->
            <s-review v-if="speechActiveName=='first'"/>
            <!-- 话术库管理 -->
            <div v-if="speechActiveName=='second'" class="speech-tab-pane">
                <el-tabs v-model="hsglActiveName" @tab-click="hsglHandleClick">
                        <el-tab-pane label="通用模版库" name="hsglFirst">
                            
                        </el-tab-pane>
                        <el-tab-pane label="用户话术库" name="hsglSecond">

                        </el-tab-pane>
                </el-tabs>
                <el-row>
                    <el-col>
                        <el-form :inline="true" ref="wFormInline" :model="wFormInline" class="w-form-inline">
                            <el-form-item label="关键词：">
                                <el-input v-model="wFormInline.queryKey" @change="searchChange" :placeholder="hsglActiveName=='hsglFirst'?'关键词':'用户名称'"></el-input>
                            </el-form-item>
                            <el-form-item label="操作人：" v-if="hsglActiveName=='hsglFirst'">
                                <el-select v-model="wFormInline.managerId" placeholder="请选择">
                                    <el-option
                                        v-for="item in creatorData"
                                        :key="item.createId"
                                        :label="item.creator"
                                        :value="item.createId">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="onHandleSearch">搜索</el-button>
                            </el-form-item>
                            <el-form-item v-if="hsglActiveName=='hsglFirst'">
                                <el-button @click="onHandleEeset">重置</el-button>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
                <el-row style="padding-bottom:20px;" v-if="hsglActiveName=='hsglFirst'">
                    <el-col>
                        <el-button type="primary" :disabled="del_disabled" @click="delVisible = true" >删除</el-button>
                        <!-- <el-button type="primary" >导入</el-button> -->
                        <el-button type="primary" @click="creatSpeech">新增</el-button>
                    </el-col>
                </el-row>

                <el-row class="first-row" v-if="hsglActiveName=='hsglFirst'">
                    <el-col :span="4" class="validIndustryList">
                        <span class="title">行业领域</span>
                        <ul class="validIndustryList-ul">
                            <li class="validIndustryList-li" 
                                :class="{'active': activeIndex==index}"
                                v-for="(item,index) in validIndustryListData" 
                                @click="handleSwitchItem(item,index)"
                                :key="item.id">
                                {{item.industryName}}
                            </li>
                        </ul>
                    </el-col>
                    <el-col :span="20">
                        <el-table
                            :data="tableData"
                            @sort-change="sortChange"
                            @selection-change="handleSelectionChange"
                            ref="multipleTable" 
                            stripe
                            style="width: 100%">
                            <el-table-column type="selection" width="55" align="center"></el-table-column>
                            <el-table-column
                            prop="speechcraftName"
                            label="话术模版名称"
                            width="">
                            </el-table-column>
                            <el-table-column
                            prop="speechcraftStatus"
                            :formatter="speechcraftStatus"
                            label="状态">
                            </el-table-column>
                            <el-table-column
                            prop="editTime"
                            sortable
                            width="180"
                            label="更新时间">
                            </el-table-column>
                            <el-table-column
                            prop="createUserName"
                            label="操作人">
                            </el-table-column>
                            <el-table-column
                            prop="calledTotalNumber"
                            width="100"
                            label="操作">
                                <template slot-scope="scope">
                                    <span v-if="hsglActiveName=='hsglFirst'">
                                        <el-button type="text" disabled v-if="scope.row.speechcraftStatus==5">编辑</el-button>
                                        <el-button type="text" v-else @click="handleEdit(scope.$index, scope.row,1)">编辑</el-button>
                                        <el-button type="text" @click="modifySpeechcraft(scope.$index, scope.row)">{{scope.row.speechcraftStatus==1?'上线':'下线'}}</el-button>
                                    </span>
                                    <span v-else>
                                        <el-button type="text" @click="handleEdit(scope.$index, scope.row)">查看</el-button>
                                    </span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-col>
                </el-row>
                <el-row v-else>
                    <el-table
                        @sort-change="sortChange"
                        :data="memberData"
                        style="width: 100%;border-left:1px solid #ebeef5;">
                        <el-table-column
                            prop="userName"
                            label="创建用户">
                        </el-table-column>
                        <el-table-column
                            sortable
                            prop="latestApplyTime"
                            width="180"
                            label="更新时间">
                        </el-table-column>
                        <el-table-column
                            width="100"
                            label="操作">
                            <template slot-scope="scope">
                                <el-button type="text" @click="handleView(scope.row,scope.$index)">查看</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>
                
                <div class="pagination" >
                    <el-pagination background @current-change="handleCurrentChange" 
                        layout="total, prev, pager, next,jumper"
                        :total="pagination.total"
                        :page-size="pagination.pageSize"
                        >
                    </el-pagination>
                </div>
            </div>
            <s-intent v-if="speechActiveName=='third'"/>
        </div>
        
       
       <!-- 删除提示框 -->
        <el-dialog class="addQuestion" title="话术删除确认" :visible.sync="delVisible" width="400px">
            <div >您确定要删除此{{(this.multipleSelection.length || 1)}}条话术吗？删除后将不能恢复？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeSpeechcraftList">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新建话术出框 -->
        <el-dialog title="新建话术模版" :visible.sync="creatSpeechVisible" width="600px">
            <el-form ref="creatSpeechform" :rules="creatSpeechRules" :model="creatSpeechform" label-width="100px">
                <el-form-item 
                    label="模版名称"
                    :error="errors.speechcraftName"
                    prop="speechcraftName">
                    <el-input
                        placeholder="请输入模版名称"
                        style="width:350px"
                        v-model="creatSpeechform.speechcraftName">
                    </el-input>
                </el-form-item>
                <el-form-item label="行业领域" prop="industry" class="industry">
                    <el-select v-model="creatSpeechform.industry" placeholder="请选择行业领域">
                        <el-option
                            v-for="item in selectOpt"
                            :key="item.id"
                            :label="item.industryName"
                            :value="item.id">
                        </el-option>
                    </el-select>

                    <!-- <el-radio-group v-model="creatSpeechform.industry" size="medium">
                        <el-radio v-for="item in industryList" :key="item.id" border :label="item.industryName"></el-radio>
                    </el-radio-group> -->
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="creatSpeechVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitFormCreat('creatSpeechform')">开始创建</el-button>
            </span>
        </el-dialog>
        <!-- 复制话术出框 -->
        <el-dialog title="复制话术" :visible.sync="copySpeechVisible" width="600px">
            <el-form ref="copySpeechform" :model="copySpeechform" label-width="100px">
                <el-form-item 
                    label="话术名称"
                    :error="errors.copySpeechcraftName"
                    prop="copySpeechcraftName">
                    <el-input
                        placeholder="请输入话术名称"
                        style="width:350px"
                        v-model="copySpeechform.speechcraftName">
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="copySpeechVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitFormCopy('copySpeechform')">确 定</el-button>
            </span>
        </el-dialog>
   </div>
</template>

<script>
    import bus from '../common/bus';
    import sReview from './base/speech/SpeechReview'
    import sIntent from './base/speech/Intent'
    import common from '../common/common';
    export default {
        name: 'basetable',
        data() {
            return {
                speechActiveName:'first',
                hsglActiveName:'hsglFirst',
                speechStatusTxt:'话术审核',
                activeIndex:0,
                wFormInline:{
                    managerId:''
                },
                tableData:[],
                tableUserData:[],
                cur_page:1,
                delVisible:false,
                del_disabled:true,
                multipleSelection:[],
                creatSpeechVisible:false,
                creatSpeechOptions:[],
                sortList:[],
                creatSpeechform:{
                    speechcraftName:'',
                    // industryName:'',
                    industryType:'',
                    CopyOperationTypeEnum:'1',
                    industry:''
                },
                creatSpeechRules: {
                    speechcraftName:[
                        { required: true, message: '输入话术名称'},
                    ],
                    industry: [
                        { required: true, message: '请选择话术模版'}
                    ],
                    // industryName: [
                    //     { required: true, message: '请选择话术模版', trigger: 'change' }
                    // ],
                },
                defe:{
                    industryType: '999',
                    speechcraftId:999,
                    speechcraftName: '空白模版'
                },
                copySpeechRules:{
                    speechcraftName:[
                        { required: true, message: '输入话术名称'},
                    ],
                },
                errors:{
                    speechcraftName:'',
                    copySpeechcraftName:''
                },
                // 复制弹框
                copySpeechform:{
                    speechcraftName:'',
                    CopyOperationTypeEnum:'1'
                },
                //倒入话术
                importSpeechform:{
                    name:'',
                    fileName:''
                },
                copySpeechVisible:false,
                copySpeechform:{

                },
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:20
                },
                industryList:[],
                tableLeftData:[{
                    name:'1'
                }],
                validIndustryListData:[],
                industryTypeList:[],
                selectOpt:[],
                creatorData:[],
                memberData:[]
                // managerId:''
            }
        },
        created() {
            let activeName='first'
            this.type = this.$route.query.type ||1;
            switch(this.type){
                case '1':
                activeName='first';
                break;
                case '2':
                activeName='second';
                break;
                case '3':
                activeName='third';
                break;
            }
            this.speechActiveName = activeName;

            if(this.speechActiveName=='second'){
                
                if(this.hsglActiveName =='hsglFirst'){
                    this.queryValidIndustryList();
                    this.querySpeechcraftList();
                }else{
                    this.queryMemberList();
                }
            }

            this.queryManagerListByData();

        },
        components: {
            sReview,
            sIntent
        },
        computed: {
           
        },
        methods: {
            onHandleEeset(){
                this.wFormInline = {};
                this.$refs['wFormInline'].resetFields();
            },
            handleCurrentChange(val){
                this.cur_page = val;
                if(this.hsglActiveName =='hsglFirst'){
                    this.querySpeechcraftList();
                }else{
                    this.queryMemberList();
                }
            },
            searchChange(val){
                if(!val){
                    if(this.hsglActiveName =='hsglFirst'){
                        this.querySpeechcraftList();
                    }else{
                        this.queryMemberList();
                    }
                }
            },
            handleView(row,index){
                this.$router.push(`/speech/yhhs/${row.memberId}`);
            },
            tabHandleClick(type){
                let n,
                    statusText;

                switch(type.name){
                    case 'first':
                    n='1';
                    statusText='话术审核';
                    break;
                    case 'second':
                    n='2';
                    statusText='话术库管理';
                    break;
                    case 'third':
                    n='3';
                    statusText='意图库管理';
                    break;
                }

                this.$router.push({query:{type:n}})

                

                if(this.speechActiveName=='second'){
                    if(this.hsglActiveName =='hsglFirst'){
                        this.querySpeechcraftList();
                        this.queryValidIndustryList();
                    }else{
                        this.queryMemberList();
                    }
                    
                }

                this.speechStatusTxt = statusText;

            },
            handleSwitchItem(item,index){
                this.activeIndex = index;
                // this.industryId = item.id;
                this.industryTypeList=[];
                this.industryTypeList.push(item.id);
                if(item.id=='all'){
                    this.industryTypeList = [];
                }

                this.querySpeechcraftList();
            },
            hsglHandleClick(type){
                this.$refs.multipleTable.clearSelection();
                this.$refs.multipleTable.clearFilter();

                if(this.hsglActiveName =='hsglFirst'){
                    this.querySpeechcraftList();
                    this.queryValidIndustryList();
                }else{
                    this.queryMemberList();
                }
                
            },
            sortChange(column){
                let flag = true;
                if(column.prop){
                    if(column.order=='ascending'){
                        flag = true;
                    }else{
                        flag = false;
                    }
                    this.sortList =[{
                        propertyName:column.prop,
                        ascendingFlag:flag
                    }];
                    
                }else{
                    this.sortList= '';
                }
                this.querySpeechcraftList();
            },
            handleEdit(index, row,type) {
                let viewType=0;
                if(type && type==1){
                    viewType=1;
                }
                let url = `${baseUrl}flow/index.html?viewType=${viewType}&speechcraftId=${row.speechcraftId}&m=1&flowType=1`;
                // window.location.href=url;
                window.open(url);
            },
            onHandleSearch(){

                if(this.hsglActiveName =='hsglFirst'){
                    this.querySpeechcraftList();
                    // this.queryValidIndustryList();
                }else{
                    this.queryMemberList();
                }

                // this.querySpeechcraftList();
            },
            //得到所有行业列表（已上线）
            queryAllIndustryList(){
                $.get(this.$baseUrl+'services/intention/queryAllIndustryList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.selectOpt = res.returnObject;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 得到所有有效的行业列表
            // queryValidIndustryList(){
            //     $.get(this.$baseUrl+'services/intention/queryValidIndustryList.json').then((res)=>{
            //         if(res.resultMessageEnum=='0000'){
            //             this.validIndustryListData = res.returnObject;
            //             // this.industryList = res.returnObject;
            //         }
            //     });
            // },
            // 下线
            modifySpeechcraft(index,row){
                let data = {
                    id:row.speechcraftId,
                    speechcraftStatus:'1'
                };
                if(row.speechcraftStatus==1){
                    data.speechcraftStatus = '5'
                }
                $.post(this.$baseUrl+'services/speechcraft/modifySpeechcraft.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('操作成功');
                        this.querySpeechcraftList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            submitFormCopy(formName){
                let data=[];

                if(!this.multipleSelection.length){
                    this.$message.error('请选择话术！');
                    return false;
                }

                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.copySpeechcraft({
                            speechcraftId:this.multipleSelection[0].speechcraftId,
                            newSpeechcraftName:this.copySpeechform.speechcraftName,
                            newTemplateType:1,
                            copyOperationType:1
                        }).then(res=>{
                            if(res){
                                this.copySpeechVisible = false;
                                this.multipleSelection=[];
                                this.$refs[formName].resetFields();
                                this.querySpeechcraftList();
                            }
                        });
                    }
                })
            },
            handleSelectionChange(val){
                
                if(this.hsglActiveName=='hsglFirst'){
                    this.multipleSelection=[];
                    this.multipleSelection = val;
                    if(this.multipleSelection.length){
                        this.del_disabled = false;
                    }else{
                        this.del_disabled = true;
                    }
                }else{
                    val.forEach((row, index) => {
                        if (index === val.length - 1) return;
                        this.$refs.multipleTable.toggleRowSelection(row, false);
                    })
                    this.multipleSelection = val;
                }
            },
            speechcraftStatus(row, column){
                return common.formatterSpeechcraftStatus(row.speechcraftStatus);
            },
            // 删除话术
            removeSpeechcraftList(){
                let data = [];
                this.multipleSelection.forEach(item=>{
                    data.push(item.speechcraftId);
                })
                $.post(this.$baseUrl+'services/speechcraft/removeSpeechcraftList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.querySpeechcraftList();
                        this.$message.success('删除成功');
                        this.delVisible = false;
                        this.multipleSelection = [];
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 新建弹框
            creatSpeech(){
                this.creatSpeechVisible = true;
                this.queryAllIndustryList();
            },
            // 新建话术
            submitFormCreat(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.addSpeechcraft();
                    } else {
                        return false;
                    }
                });
            },
            // 新建话术
            addSpeechcraft(){

                let obj = this.selectOpt.find((item)=>{
                        return item.id === this.creatSpeechform.industry;
                    });
                var data = {
                    speechcraftName:this.creatSpeechform.speechcraftName,
                    industryType:obj.id,
                    industryName:obj.industryName
                };
                $.post(this.$baseUrl+'services/speechcraft/addSpeechcraft.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.creatSpeechVisible = false;
                        this.querySpeechcraftList();
                        this.$message.success('操作成功！');
                    }else if(res.resultMessageEnum=='060000'){
                        this.errors.speechcraftName = '模版名称已存在，请修改 !';
                    }
                    else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            // 得到所有有效的行业列表
            queryValidIndustryList(){
                $.get(this.$baseUrl+'services/intention/queryValidIndustryList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data = JSON.parse(JSON.stringify(res.returnObject));

                        data.unshift({
                            id:'all',
                            industryName:'全部'
                        })

                        this.validIndustryListData = data;

                    }
                });
            },
            //查询话术列表
            querySpeechcraftListOpt(){
                this.creatSpeechOptions=[];
                let data = {
                    templateType:1
                }
                $.post(this.$baseUrl+'services/speechcraft/querySpeechcraftList.json',JSON.stringify(data)).then((res)=>{

                    if(res.resultMessageEnum=='0000'){
                        let list = [];

                        if(res.returnObject.recordList && res.returnObject.recordList.length){

                            list = res.returnObject.recordList;

                            list.unshift(this.defe);
                            
                        }else{
                            list.push(this.defe)
                        }
                        this.creatSpeechOptions=list;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //查询会员列表
            queryMemberList(){
                let params = {
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                };

                if(this.wFormInline.queryKey){
                    params.queryKey=this.wFormInline.queryKey;
                }
                if(this.sortList.length){
                    params.sortList = this.sortList;
                }

                $.post(this.$baseUrl+'services/member/queryMemberList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.pagination.total = res.returnObject.totalNumber;
                        
                        this.memberData = res.returnObject.recordList;

                        this.memberData.filter((item)=>{
                            item.userName = item.enterpriseName || item.accountName;
                        })

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /*
             * 1 通用
             * 2 会员模版
             */ 
            querySpeechcraftList(type) {
                let ttype = 1;
                // if(this.hsglActiveName =='hsglFirst'){
                //     ttype =1;
                // }else if(this.hsglActiveName =='hsglSecond'){
                //     ttype =2;
                // }
                let data = {
                    templateType:ttype,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                }
                
                if(this.industryTypeList.length){
                    data.industryTypeList = this.industryTypeList;
                }
                if(this.wFormInline.queryKey){
                    data.queryKey=this.wFormInline.queryKey;
                }
                if(this.sortList.length){
                    data.sortList =this.sortList;
                }
                if(this.wFormInline.managerId){
                    data.managerId = this.wFormInline.managerId;
                }

                $.post(this.$baseUrl+'services/speechcraft/querySpeechcraftList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.pagination.total = res.returnObject.totalNumber;
                        this.tableData = res.returnObject.recordList;

                        // if(this.hsglActiveName =='hsglFirst'){
                        //     this.tableData = res.returnObject.recordList;
                        // }else{
                        //     this.tableUserData = res.returnObject.recordList;
                        // }
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //复制话术为新话术
            copySpeechcraft(opt){
                var dtd = $.Deferred();
                let data = $.extend({},{
                    newSpeechcraftName:this.creatSpeechform.speechcraftName,
                    copyOperationType:this.creatSpeechform.CopyOperationTypeEnum,
                },opt)
                $.post(this.$baseUrl+'services/speechcraft/copySpeechcraft.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        dtd.resolve(res);
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
                return dtd;
            },
            //根据数据类型得到管理员列表
            queryManagerListByData(){
                let data = {
                    dataType:1
                };
                $.get(this.$baseUrl+'services/manager/queryManagerListByData.json?dataType=1').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.creatorData = res.returnObject;
                        this.creatorData.unshift({
                            createId:'',
                            creator:'全部'
                        })
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            }
        },
        watch:{
            creatSpeechVisible(val){
                if(!val){
                    this.$refs['creatSpeechform'].resetFields();
                }
            }
        }
    }

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
    
</style>
