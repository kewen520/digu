<template>
    <div class="empty-div" v-if="isEmpty">
        <div class="big-background-icon"></div>
        <h3>任务列表为空</h3>
        <p>请先去<a href="/index.html#/speech">我的话术</a>创建“智能外呼方案”类型的话术模版，才能使用创建任务哦</p>
    </div>
    <div v-else class="table table-main">
        <div class="content-box-top">
            <el-input v-model="select_word" clearable placeholder="筛选关键词" @change="searchChange" class="handle-input mr10" @keyup.native.13="search"></el-input>
            <el-button type="primary" icon="search" @click="search">搜索</el-button>
            <div class="content-box-top-right">
                <el-button type="primary" icon="iconfont icon-ico_new-task" @click="handleCreat">新建任务</el-button>
            </div>
            <div class="content-box-top-bottom">
                <el-date-picker
                        v-model="select_date"
                        class="select-date"
                        type="daterange"
                        align="left"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        prefix-icon="el-icon-time"
                        >
                </el-date-picker>
                <el-select v-model="select_speech_id" placeholder="话术名称"  class="select-speech">
                    <el-option v-for="item in creatOptions" :key="item.id" :label="item.speechcraftName" :value="item.id">
                    </el-option>
                </el-select>
                <el-button type="primary" class="select-filter-btn" @click="filter">筛选</el-button>
            </div>
        </div>

        <div class="w-cantainer task-table-cantainer" >
            <v-cer v-if="!isCer"></v-cer>
            <div class="box-card task-card">
                <div class="task-card-top-btn-box">
					<el-switch
					  style="margin-right:70px"
					  v-model="progressPattern"
					  active-text="N"
					  inactive-text="%"
					  active-value="number"
					  inactive-value="percent"
					  @change="switchProgressPattern">
					</el-switch>
                    <el-button type="primary" @click="createExportTaskItemExcelFile">导出报表</el-button>
                    <!-- <el-button type="primary" @click="search">导出录音</el-button> -->
                </div>
                <el-tabs v-model="activeName" @tab-click="handleTabClick">
                    <el-tab-pane label="未完成" name="first">
                    </el-tab-pane>
                    <el-tab-pane label="全部" name="second">
                    </el-tab-pane>
                    <el-tab-pane label="已完成" name="third">
                    </el-tab-pane>
                    <el-tab-pane label="已取消" name="fourth">

                    </el-tab-pane>
                </el-tabs>
                <el-table :data="taskTableData" stripe class="table"
                    :height="height"
                    :options="options"
                    :pagination="pagination"
                    ref="multipleTable"
                    @sort-change="sortChange"
                    @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column prop="taskName" label="任务名称" width="150" sortable fixed>
                    </el-table-column>
                    <el-table-column
                    prop="factStartTime"
                    label="任务开始时间"
                    sortable
                    width="180">
                    </el-table-column>
                    <el-table-column
                        width="180"
                        prop="factEndTime"
                        sortable
                        label="任务结束时间">
                    </el-table-column>
                    <el-table-column prop="speechcraftName" label="话术名称" width="200">
                    </el-table-column>
                    <!--<el-table-column prop="phoneNumber" label="号码数">-->
                    <!--</el-table-column>-->
                    <!--<el-table-column prop="connectedNumber" label="接通数" >-->
                    <!--</el-table-column>-->
                    <el-table-column prop="connectedRate" label="接通率" width="70">
                    </el-table-column>
                    <el-table-column prop="agentCount" label="坐席数" width="70">
                    </el-table-column>
                    <el-table-column
                        prop="taskStatus"
                        label="进度"
                        >
                        <template slot-scope="scope">
                            <span v-if="scope.row.taskStatus==4">审核中</span>
                            <div v-else>
                                <span v-bind:id="scope.row.id" class="progress-text">{{scope.row.calledPhoneNumber}}/{{scope.row.phoneNumber}}</span>
                                <el-progress :text-inside="true" :stroke-width="18" :status="scope.row.status || 'success'" :percentage="scope.row.scale||0"></el-progress>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" align="center" fixed="right">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleDesc(scope.$index, scope.row)">详情</el-button>
                            <span v-if="scope.row.taskStatus!=4">
                                <el-button type="text" v-show="scope.row.taskStatus==1" @click="handleStartTask(scope.$index, scope.row)">开始</el-button>
                                <el-button type="text" v-show="scope.row.taskStatus==2" @click="handleStopTask(scope.$index, scope.row)">取消</el-button>
								<el-button type="text" v-show="scope.row.taskStatus==2" @click="handlePauseTask(scope.$index, scope.row)">暂停</el-button>
								<el-button type="text" v-show="scope.row.taskStatus==8" @click="handleResumeTask(scope.$index, scope.row)">继续</el-button>
								<el-button type="text" v-show="scope.row.taskStatus==1" @click="showDeleteDialog(scope.row)">删除</el-button>
                                <!-- <el-button type="text" v-show="scope.row.taskStatus==3" @click="handleStartTask(scope.$index, scope.row)">重启</el-button> -->
                                <!-- <el-button type="text" v-else  @click="handleStopTask(scope.$index, scope.row)">中止</el-button> -->
                            </span>
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

        <!-- 新建任务弹出框 -->
        <el-dialog title="新建任务" class="creatDialog" :visible.sync="cretVisible" width="800px">
            <el-form ref="creatForm" :rules="rules" :model="creatForm" :label-position="labelPosition" label-width="80px" style="width:490px;margin:0 auto;" >
                <el-form-item
                    label="任务名称"
                    prop="taskName">
                    <el-input
                        placeholder="输入任务名称"
                        v-model="creatForm.taskName">
                    </el-input>
                </el-form-item>
                <el-form-item prop="speechcraftName" label="话术名称">
                    <el-select v-model="creatForm.speechcraftName" placeholder="选择我的话术库" style="width:380px;" @change="changeValue">
                        <el-option
                        v-for="item in creatOptions"
                        :key="item.id"
                        :label="item.speechcraftName"
                        :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
				<el-form-item v-if="hasTransfer" prop="turnManualPhone" label="转人工号码">
				    <el-select v-model="creatForm.turnManualPhone" placeholder="选择转人工号码" style="width:380px;">
				        <el-option
				        v-for="item in transferNumbers"
				        :key="item.systemValue"
				        :label="item.valueName"
				        :value="item.systemValue">
				        </el-option>
				    </el-select>
				</el-form-item>
                <el-form-item prop="callerPhone" label="外显号码">
					<el-select v-model="creatForm.callerPhone" placeholder="选择外显号码" style="width:380px;">
						<el-option
						v-for="item in phoneOptions"
						:key="item.systemValue"
						:label="item.systemValue"
						:value="item.systemValue">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="taskLevel" label="优先级">
					<el-select v-model="creatForm.taskLevel" value-key="valueName" placeholder="选择任务优先级" style="width:380px;">
						<el-option v-for="item in taskLevels" :key="item.systemTypeCode" :label="item.valueName" :value="item.systemValue">
						</el-option>
					</el-select>
				</el-form-item>

                <el-form-item label="外呼数据" prop="filePath" :error="errors.filePath">
                    <el-col :span="17">
                        <p>第一步：请下载excel模板填写信息</p>
                        <p>第二步：上传填写好的excel文件</p>
                        <p class="blue">{{creatForm.filePath}}</p>
                        <p class="red" v-html="creatForm.excelPathTip"></p>
                        <!-- <p class="red" >{{errors.filePath}}</p> -->
                    </el-col>
                    <el-col :span="4" class="data-btn-box" >
                        <el-button @click="downTaskItemExcelTemplate">下载模版</el-button>
                        <div id="task_upload_box">
                            <el-button class="file-btn" @click.native="handleFile">
                                <input v-show="creatForm.speechcraftId" ref="upload_input" type="file" id="file" @change="uploadAnnexFile" >
                                <!-- <el-input v-show="creatForm.speechcraftId" multiple="multiple" v-model="creatForm.filePath" type="file" id="file" @change="uploadAnnexFile"></el-input> -->
                                上传
                            </el-button>
                        </div>

                    </el-col>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cretVisible = false">取 消</el-button>
                <el-button type="primary" :disabled="cretDisable" @click="creatHandleTask('creatForm')">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 提示框 -->
        <el-dialog title="提示" :visible.sync="cerVisible" width="400px" center>
            <div class="del-dialog-cnt">您还未进行企业认证，不能创建外呼任务！</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cerVisible = false">取 消</el-button>
                <el-button type="primary" @click="gotoCer">立即认证</el-button>
            </span>
        </el-dialog>
		<!-- 删除任务提示框 -->
		<el-dialog title="任务删除确认" :visible.sync="delVisible" width="400px">
		    <div >您确定要删除此任务吗？</div>
		    <span slot="footer" class="dialog-footer">
		        <el-button @click="delVisible = false">取 消</el-button>
		        <el-button type="primary" @click="handleDeleteTask()">确 定</el-button>
		    </span>
		</el-dialog>
    </div>
</template>

<script>
    import bus from '../../common/bus';
    import vCer from '../base/Certificate.vue';
    import common from '../../common/common';
    import axios from 'axios';
    import moment from 'moment';
    import {API_SUCCESS_CODE} from "../../common/enums";
//	import {numeral} from '../common/numeral.min.js';

    export default {
        name: 'basetable',
        data() {
            return {
				progressPattern:'number',
                activeName: 'second',
                tabIndex: 2,
                height:300,
                cerVisible:false,
                // firstTableData:[],
                // secondTableData:[],
                // thirdTableData:[],
                // fourthTableData:[],
                taskStatusList:[],
                isCer:true,
                labelPosition:"left",
                // url: './static/vuetable.json',
                taskTableData: [],
                cur_page: 1,
                multipleSelection: [],
                select_cate: '',
                select_word: '',
                select_date: [],
                select_speech_id: '',
                del_list: [],
                fileTipText:"",
                downTaskItemExcelTemplateHref:'',
                is_search: false,
                cretVisible: false,
                cretDisable: false,
                delVisible: false,
                creatForm: {
                    excelPathTip:'',
                    taskName:'',
                    speechcraftName:'',
                    callerPhone:'',
                    excelPath:'',
                    filePath:'',
					taskLevel:'',
					turnManualPhone: ''
                },
                creatOptions: [
                ],
                phoneOptions:[],
				taskLevels:[],
                idx: -1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 20
                },
                options: {
                    stripe: true, // 是否为斑马纹 table
                    loading: true, // 是否添加表格loading加载动画
                    highlightCurrentRow: true, // 是否支持当前行高亮显示
                    mutiSelect: true // 是否支持列表项选中功能
                },
                sortList:[{
                    propertyName:'factStartTime',
                    ascendingFlag:true
                }],
                errors:{
                    filePath:''
                },
                rules: {
                    speechcraftName: [
                        { required: true, message: '请选择话术模版！', trigger: 'change' }
                    ],
                    taskName:[
                        { required: true, message: '任务名称不能为空！', trigger: 'change' }
                    ],
                    callerPhone: [
                        { required: true, message: '请选择外显号码！', trigger: 'change' }
                    ],
                    // filePath:[
                    //     { required: true, message: '请上传外呼数据！', trigger: 'change' }
                    // ]
                },
                userInfo:{
                    authenticationFlag:''
                },
				taskId:null,
				hasTransfer:false,
				transferNumbers: [],
                isEmpty: false,
            }
        },
        // props:{
        //     status
        // },
        components:{
            vCer
        },
        async created() {
            if (!await this.checkSpeechcraftExists()) {
                this.isEmpty = true;
                return;
            }

            const clintHeight = document.documentElement.clientHeight;
            this.height = clintHeight - 300;
            bus.$emit('contentTop', true);
            await Promise.all([
				this.queryTaskList(),
			    this.queryMemberDetail(),
                this.querySpeechcraftList(),
            ]);
        },

        computed: {
        },

        methods: {
            async checkSpeechcraftExists() {
                const res = await axios.get(this.$baseUrl + 'speechcraft/checkSpeechcraftExists.json?speechcraftType=2');

                const { resultMessageEnum, returnObject } = res.data;
                if (resultMessageEnum === API_SUCCESS_CODE) {
                    return returnObject;
                } else {
                    return false;
                }
            },

            // tab切换
            async handleTabClick(val){
                if(this.tabIndex ==val.index*1+1){
                    return false;
                }
                this.tabIndex = val.index*1+1;
                this.cur_page = 1;
                let statusList = this.tabIndex==1?[1,2,4]:this.tabIndex ==2?'':this.tabIndex ==3?[5]:this.tabIndex==4?[3,6,7]:'';
                this.taskStatusList=statusList;
                await this.queryTaskList();
            },

            async handleCreat(){
                if(!this.userInfo.authenticationFlag == 1){
                    this.cerVisible = true;
                    return false;
                }
                this.cretVisible = true;
                await this.querySpeechcraftList();
                this.querySystemConfig();
				this.queryTaskLevels();
				this.queryTransferNumbers();
            },

            gotoCer(){
                this.$router.push('/account');
            },
            // 分页导航
            async handleCurrentChange(val) {
                this.cur_page = val;
                await this.queryTaskList();
            },

            async queryMemberDetail() {
                const { data } = await axios(this.$baseUrl + 'member/queryMemberDetail.json');
				if (data.resultMessageEnum === '0000'){
					this.userInfo = data.returnObject;
				} else {
					this.$message.error(data.errorInfoList[0].errorMessage);
				}
            },

            // 查询任务列表
            async queryTaskList(opt) {
                let data = {
					currentPage: this.cur_page-1,
					pageSize: this.pagination.pageSize,
                    ... opt,
				};

                if (this.taskStatusList){
                    data.taskStatusList=this.taskStatusList;
                }
                // 关键词
                if (this.select_word) {
                    data.taskName = this.select_word
                }

                // 日期
                if (this.select_date && this.select_date.length > 0) {
					const [startTime, endTime] = this.select_date;
					if (startTime) data.factStartTime = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
					if (endTime) data.factEndTime = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
                }

                // 话术名称
                if (this.select_speech_id) {
					data.speechcraftId = this.select_speech_id;
                }

                if (this.sortList && this.sortList[0].propertyName){
                    data.sortList = this.sortList;
                    // data.sortList =JSON.stringify(this.sortList);
                }

                const { data: resData } = await axios.post(this.$baseUrl + 'task/queryTaskList.json', data);
				if(resData.resultMessageEnum === '0000'){
					let list = resData.returnObject.recordList;
					if(list.length){
						list.forEach((item,index)=>{
							if(item.taskStatus == 1){
								item.scale = 0;
								item.status = ''
							}else{
								item.scale = item.calledPhoneNumber/item.phoneNumber*100||0;
								item.status = item.taskStatus == 3 ?'exception': item.taskStatus == 5?'success':''
							}
						})
					}else{
						list = [];
					}
					this.pagination.total = resData.returnObject.totalNumber;
					this.taskTableData = list;
				}else{
					this.$message.error(resData.errorInfoList[0].errorMessage);
				}
            },

            handleDesc(index,row){

                this.$router.push(`/task/${row.id}?sname=${common.encodeUnicode(row.taskName)}`);
            },
            // 开始任务
            handleStartTask(index,row){
                let data = {
                    taskId:row.id
                }
                const item = this.taskTableData[index];
                $.post(this.$baseUrl+`task/startTask.json?taskId=${row.id}`).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        item.taskStatus=2;
                        item.scale = item.calledPhoneNumber/item.phoneNumber*100;
                        item.status = ''
                        this.$message({
                            message: '开始任务成功',
                            type: 'success'
                        });
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 中止任务
            handleStopTask(index,row){
                let data = {
                    taskId:row.id
                }
                const item = this.taskTableData[index];
                $.post(this.$baseUrl+`task/stopTask.json?taskId=${row.id}`).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        item.taskStatus=3;
                        // item.scale = 0;
                        item.status = 'exception'
                        this.$message({
                            message: '取消任务成功',
                            type: 'success'
                        });
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
			// 暂停任务
			handlePauseTask(index, row){
				$.post(this.$baseUrl+`task/pauseTask.json?taskId=`+row.id).then(async res=>{
					if(res.resultMessageEnum === '0000'){
						await this.queryTaskList();
						this.$message({
							message: '任务暂停成功',
							type: 'success'
						});
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				});
			},

			// 继续任务
			handleResumeTask(index, row){
			    $.post(this.$baseUrl+`task/resumeTask.json?taskId=`+row.id).then(async res =>{
			        if(res.resultMessageEnum === '0000'){
			            await this.queryTaskList();
			            this.$message({
			                message: '任务恢复成功',
			                type: 'success'
			            });
			        } else {
			            this.$message.error(res.errorInfoList[0].errorMessage);
			        }
			    });

			},
			// 显示删除任务确认框
			showDeleteDialog(row){
				this.delVisible = true;
				this.taskId = row.id;
			},
			// 删除任务
			handleDeleteTask(){
				this.delVisible = false;
			    $.post(this.$baseUrl+`task/deleteTask.json?taskId=`+this.taskId).then(async res=>{
			        if(res.resultMessageEnum === '0000'){
			            await this.queryTaskList();
			            this.$message({
			                message: '任务删除成功',
			                type: 'success'
			            });
			        } else {
			            this.$message.error(res.errorInfoList[0].errorMessage);
			        }
			    });
			},

			switchShow(taskId,calledPhoneNumber,phoneNumber){
				var progress = $("#"+taskId).text();
				if(progress.indexOf("/") != -1){
					console.log(calledPhoneNumber/phoneNumber);
					var percent = numeral(calledPhoneNumber/phoneNumber).format('0,00%');
					console.log(percent);
					$("#"+taskId).text(percent);
				}else{
					$("#"+taskId).text(calledPhoneNumber+"/"+phoneNumber);
				}
			},

            // 2.1.6.检查上传文件
            checkAnnexFile(){
                this.creatForm.excelPathTip = '检测中...';
                let data = {
                    excelTemplateType:1,
                    filePath:this.creatForm.excelPath,
                    id:this.creatForm.speechcraftId
                }
                $.post(this.$baseUrl+'common/checkAnnexFile.json',JSON.stringify(data)).then((res)=>{


                    if(!res.returnObject.correctFlag){
                        let ex = res.returnObject.exceptionData;
                        let exceptionMessage=res.returnObject.exceptionMessage;
                        let str='';
                        if(exceptionMessage){
                            str = exceptionMessage
                        }else{
                            for(var a in ex){
                                str += `${ex[a]}<br>`
                            }
                        }
                        this.creatForm.excelPathTip = str;
                    }else{
                        this.creatForm.excelPathTip = '';
                    }
                    this.changeFileType();
                });

            },
            handleFile(){
                if(!this.creatForm.speechcraftId){
                    this.$message.error('请选择话术库！');
                }
            },
            changeFileType(){
                this.$nextTick(() => {
                    $('#file').val('')
                })
            },
            uploadAnnexFile(){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("sourceType", 102);
                oMyForm.append("file", $('#file')[0].files[0]);
                $.ajax({
                    url: this.$baseUrl+'common/uploadAnnexFile.json',
                    type: 'POST',
                    cache: false,
                    data:oMyForm,
                    dataType: "json",
                    headers : {'Content-Type':'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false
                }).done(function(res) {
                    if(res.resultMessageEnum=='0000'){
                        self.creatForm.filePath = self.$refs.upload_input.value;
                        self.creatForm.excelPath = res.returnObject;
                        self.checkAnnexFile();
                    }else{
                        self.$message.error('上传失败！');
                        self.creatForm.excelPathTip = '';
                    }
                    self.errors.filePath = '';
                }).fail(function(res) {
                    self.changeFileType();
                });
            },
            // 下载模版
            downTaskItemExcelTemplate(){
                if(!this.downTaskItemExcelTemplateHref){
                    this.$message.error('请选择话术模版！');
                    return false;
                }
                window.location.href= this.downTaskItemExcelTemplateHref;
            },
            // 2.7.1.查询话术列表
            async querySpeechcraftList(){
                let params = {
                    templateType:2,
                    speechcraftStatusList:['5'],
                    pageSize:100,
                    onlyPublishIndustry:true,
                };

                const { data } = await axios.post(this.$baseUrl+'speechcraft/querySpeechcraftList.json', params);
				if(data.resultMessageEnum === '0000'){
					this.creatOptions = data.returnObject.recordList;
				} else {
					this.$message.error(data.errorInfoList[0].errorMessage);
				}
            },
            changeValue(vId){
                let obj = {};
                obj = this.creatOptions.find((item)=>{
                    return item.id === vId;
                });
                this.creatForm.speechcraftId = obj.id;
                this.creatForm.speechcraftName = obj.speechcraftName;
                this.downTaskItemExcelTemplateHref = this.$baseUrl+`task/downTaskItemExcelTemplate.html?speechcraftId=${this.creatForm.speechcraftId}`;

				$.get(this.$baseUrl+'task/checkHasTransfer.json?speechcraftId='+this.creatForm.speechcraftId).then((res)=>{
				    if(res.resultMessageEnum === '0000'){
						if(res.returnObject){
							this.hasTransfer = true;
						}else{
							this.hasTransfer = false;
						}
				    }else{
				        this.$message.error(res.errorInfoList[0].errorMessage);
				    }
				});
            },
            // 2.1.9.查询配置信息列表  外显号码
            querySystemConfig(){
                $.get(this.$baseUrl+'common/querySystemConfig.json?configGroup=8').then((res)=>{
                    if(res.resultMessageEnum === '0000'){
                        this.phoneOptions = res.returnObject;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
			// 查询配置信息列表  任务优先级
			queryTaskLevels() {
				$.get(this.$baseUrl + 'common/querySystemConfig.json?configGroup=11').then((res) => {
					if (res.resultMessageEnum === '0000') {
						this.taskLevels = res.returnObject;
						// 设置默认值为 低
						this.creatForm.taskLevel = this.taskLevels[0].systemValue;
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				});
			},
			// 查询转人工号码
			queryTransferNumbers(){
				$.get(this.$baseUrl + 'common/querySystemConfig.json?configGroup=14').then((res) => {
					if (res.resultMessageEnum === '0000') {
						this.transferNumbers = res.returnObject;
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				});
			},
            async search() {
                if(!this.select_word) {
                    this.$message.error("请输入关键字！");
                    return false;
                }
                this.cur_page = 1;
                await this.queryTaskList();
            },

            async filter() {
				if (this.select_date <= 0 && !this.select_speech_id) {
					this.$message.error("请输入筛选条件！");
					return false;
				}
				this.cur_page = 1;
				await this.queryTaskList();
            },

            async searchChange(val){
                if(!val){
                   await this.queryTaskList();
                }
            },

            formatter(row, column) {
                // return row.startDate;
            },
            formatter2(row,column){
                // return row.jindu.num
            },
            handleEdit(index, row) {

                this.idx = index;
                const item = this.taskTableData[index];
                this.form = {
                    name: item.name,
                    startDate: item.date,
                    address: item.address
                }
                this.editVisible = true;
            },
            creatHandleTask(formName){
                if(!this.creatForm.excelPath){
                    this.errors.filePath = '请上传外呼数据！';
					return;
                }
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.cretDisable = true;
                        let data = {
                            taskName:this.creatForm.taskName,
                            speechcraftId:this.creatForm.speechcraftId,
                            speechcraftName:this.creatForm.speechcraftName,
                            callerPhone:this.creatForm.callerPhone,
                            excelPath:this.creatForm.excelPath,
							taskLevel:this.creatForm.taskLevel
                        };
                        $.post(this.$baseUrl+'task/addTask.json',JSON.stringify(data)).then(async res => {
                            if(res.resultMessageEnum === '0000'){
                                this.cretDisable = false;
                                this.cretVisible = false;
                                this.creatForm.speechcraftId = '';
                                this.$refs[formName].resetFields();
                                await this.queryTaskList();
                            }else{
                                this.$message.error(res.errorInfoList[0].errorMessage);
                            }
                        });
                    } else {
                        return false;
                    }
                });
            },
            delAll() {
                // const length = this.multipleSelection.length;
                // let str = '';
                // this.del_list = this.del_list.concat(this.multipleSelection);
                // for (let i = 0; i < length; i++) {
                //     str += this.multipleSelection[i].name + ' ';
                // }
                // this.$message.error('删除了' + str);
                // this.multipleSelection = [];
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 2.11.4.	创建任务明细Excel下载文件
            createExportTaskItemExcelFile(){
                let list = [];
                if (this.multipleSelection.length){
                    this.multipleSelection.forEach(el=>{
                        list.push(el.id);
                    });
				} else {
					this.$message.error('请选择要导出报表任务！');
					return false;
				}

                let data = {
                    taskIdList: list,
                };

                $.post(this.$baseUrl+'file/createExportTaskItemExcelFile.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum === '0000'){
                        this.multipleSelection = [];
                        window.location.href = this.$baseUrl + 'file/downloadFile.html?filePath='+res.returnObject.filePath;
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },

            async sortChange(column){
				const flag = column.order === 'ascending';
                this.sortList =[{
                    propertyName:column.prop,
                    ascendingFlag:flag
                }];
                await this.queryTaskList();
            },

			// 切换进度显示模式 数字／百分比
			switchProgressPattern(pattern){
				if(pattern === 'percent'){
					console.log($("span.progress-text:visible").length);
					$("span.progress-text").each(function(index, element){
						var process = $(this).text();
						var arr = process.split("/");
						var calledPhoneNumber = arr[0];
						var phoneNumber = arr[1];
					//	var percent = numeral(calledPhoneNumber/phoneNumber).format('0,00%');
						var percent = calledPhoneNumber/phoneNumber;
						$(this).text((percent*100).toFixed(2)+'%');
						$(this).attr("calledPhoneNumber", calledPhoneNumber);
						$(this).attr("phoneNumber", phoneNumber);
					});
				}else if(pattern == 'number'){
					$("span.progress-text").each(function(index, element){
						var calledPhoneNumber =  $(this).attr("calledPhoneNumber");
						var phoneNumber = $(this).attr("phoneNumber");
						$(this).attr("phoneNumber", phoneNumber);
						$(this).text(calledPhoneNumber+"/"+phoneNumber);
					});
				}
			}
            // 保存编辑
            // saveEdit() {
            //     this.$set(this.taskTableData, this.idx, this.form);
            //     this.editVisible = false;
            //     this.$message.success(`修改第 ${this.idx+1} 行成功`);
            // },
            // 确定删除
            // deleteRow(){
            //     this.taskTableData.splice(this.idx, 1);
            //     this.$message.success('删除成功');
            //     this.delVisible = false;
            // },
            // 过滤
            // filterHandler(value, row, column) {
            //     const property = column['property'];
            //     return row[property] === value;
            // },
            // 过滤
            // filterHandler2(value, row, column) {

            //     const property = column['property'];
            //     console.log(column,property,row[property] ,value)
            //     return row[property] == value;
            // }
        },
        destroyed(){
            bus.$emit('contentTop', false);
        }
    }

</script>

<style scoped lang="less">
    .empty-div {
        .big-background-icon {
            width: 100%;
            height: 186px;
            margin-top: 210px;
            background: url(../../../static/img/task_empty.png) center center no-repeat;
        }

        h3 {
            color: #A3B1BF;
            font-size: 24px;
            text-align: center;
            font-weight: normal;
            margin-top: 32px;
        }

        p {
            font-size: 16px;
            margin-top: 40px;
            text-align: center;
            color: #647184;
        }
    }

    .table-main {
        padding-top: 60px;
    }

    .task-table-cantainer{
        background: #fff;
        color: #303133;
        border-radius: 5px;
    }

    .content-box-top-bottom {
        margin-top: 15px;
        .select-date {
            vertical-align: -2px;
        }

        .select-speech {
            width: 240px;
            margin-left: 16px;
        }

        .select-filter-btn {
            margin-left: 16px
        }
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
    .content-box-top {
      height: 120px;
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
