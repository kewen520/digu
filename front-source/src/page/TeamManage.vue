<template>
    <div class="table">
        <div class="content-box-top">
            <el-input v-model="queryKey" clearable placeholder="用户名/手机号" @change="handleSearchChange" class="handle-input mr10" @keyup.native.13="handleSearch"></el-input>
            <el-button type="primary" icon="search" @click="handleSearch">搜索</el-button>
            <div class="content-box-top-right">
                <el-button type="primary" icon="iconfont icon-ico_new-task" @click="handleCreate">添加账号</el-button>
            </div>
        </div>

        <el-card class="box-card task-card">
            <div slot="header">
                <span>管理列表</span>
            </div>
            <div>
                <el-table :data="accountTableData" stripe class="table"
                          :height="height"
                          :options="options"
                          :pagination="pagination"
                          ref="multipleTable"
                          @filter-change="handleFilterChange">
                    <!--<el-table-column prop="id" label="账号ID" width="300">
                    </el-table-column>-->
                    <el-table-column prop="userName" label="用户名" width="200">
                    </el-table-column>
                    <el-table-column prop="phone" label="手机号" width="200">
                    </el-table-column>
                    <el-table-column
                            prop="role"
                            label="角色"
                            width="200"
                            column-key="filterRoleList"
                            :formatter="handleCheckRole"
                            :filters="filterRoleData"
                    >
                    </el-table-column>
                    <el-table-column prop="groupName" label="组名">
                    </el-table-column>
                    <el-table-column label="操作" width="120">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleRemove(scope.$index, scope.row)">移除</el-button>
                            <el-button type="text" @click="handleModify(scope.$index, scope.row)">修改</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination">
                    <el-pagination background
                                   @size-change="handleSizeChange"
                                   @current-change="handleCurrentChange"
                                   layout="total, sizes, prev, pager, next, jumper"
                                   :total="pagination.total"
                                   :page-size="pagination.pageSize"
                                   :page-sizes="[10, 50, 100, 200]"
                    >
                    </el-pagination>
                </div>
            </div>
        </el-card>

        <!-- 添加账号弹出框 -->
        <el-dialog title="添加账号" class="creatDialog" :visible.sync="createVisible" width="600px">
            <el-form ref="createForm" :inline="true" :rules="rules" :model="createForm" label-width="80px">
                <el-form-item prop="role" label="角色">
                    <el-select clearable v-model="createForm.role" value-key="id" placeholder="选择角色" @change="handleRoleChange" style="width:184px;" >
                        <el-option
                                v-for="item in roleList"
                                :key="item.id"
                                :label="item.roleName"
                                :value="item">
                        </el-option>
                        <div class="select_add_item">
                            <div class="select-menu-input-box" v-if="createRoleForm.isShow">
                                <el-input v-model="createRoleForm.roleName" placeholder="输入角色名称"></el-input>
                            </div>
                            <div class="select-icon-box" v-if="createRoleForm.isShow">
                                <i class="el-icon-check" @click="handleConfirmAddRole"></i>
                                <i class="el-icon-close" @click="createRoleForm.isShow = false"></i>
                            </div>
                            <div>
                                <i class="el-icon-plus" @click="createRoleForm.isShow = true">
                                    <span>新增角色</span>
                                </i>
                            </div>
                        </div>
                    </el-select>
                </el-form-item>
                <el-form-item prop="groupId" v-if="createForm.role.roleValue === 3" >
                    <el-select clearable v-model="createForm.groupId" placeholder="选择组长" style="width:184px;">
                        <el-option
                                v-for="item in leaderList"
                                :key="item.id"
                                :label="item.leaderName + '(' + item.groupName + ')'"
                                :value="item.groupId">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="groupName" label="组名" v-if="createForm.role.roleValue === 2">
                    <el-input placeholder="输入组名" v-model="createForm.groupName"></el-input>
                    <!-- <div v-if="errors.errorGroupMsg" class="phone_check_error el-form-item__error">组名已存在！</div> -->
                </el-form-item>
                <el-form-item prop="phone" label="手机号">
                    <el-input placeholder="输入登录手机号" v-model="createForm.phone"></el-input>
                    <!-- <div v-if="errors.errorPhoneMsg" class="phone_check_error el-form-item__error">手机号已注册！</div> -->
                </el-form-item>
                <el-form-item prop="password" label="初始密码">
                    <el-input placeholder="输入账号初始密码" v-model="createForm.password"></el-input>
                </el-form-item>
                <el-form-item prop="userName" label="用户名">
                    <el-input placeholder="输入真实姓名" v-model="createForm.userName"></el-input>
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input placeholder="输入邮箱地址" v-model="createForm.email"></el-input>
                </el-form-item>
                <el-form-item label="功能范围">
                    <span>{{functionScope}}</span>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="createVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleCreateAccount('createForm')">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改账号弹出框 -->
        <el-dialog title="修改账号信息" class="creatDialog" :visible.sync="modifyVisible" width="600px">
            <el-form ref="createForm" :inline="true" :rules="modifyRules" :model="modifyForm" label-width="80px">
                <el-form-item label="角色">
                    <el-select clearable v-model="modifyForm.roleName" placeholder="选择角色" :disabled="true">
                    </el-select>
                </el-form-item>
                <el-form-item prop="groupName" label="组名" v-if="modifyForm.roleValue === 2">
                    <el-input placeholder="输入组名" v-model="modifyForm.groupName"></el-input>
                </el-form-item>
                <el-form-item label="手机号">
                    <el-input placeholder="输入登录手机号" v-model="modifyForm.phone" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item prop="password" label="初始密码">
                    <el-input placeholder="输入账号初始密码" v-model="modifyForm.password"></el-input>
                </el-form-item>
                <el-form-item prop="userName" label="用户名">
                    <el-input placeholder="输入真实姓名" v-model="modifyForm.userName"></el-input>
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input placeholder="输入邮箱地址" v-model="modifyForm.email"></el-input>
                </el-form-item>
                <el-form-item label="功能范围">
                    <span>{{functionScope}}</span>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="modifyVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmModify">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 删除账号弹出框 -->
        <el-dialog title="删除账号" :visible.sync="removeVisible" width="400px">
            <div>{{removeText}}</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="removeVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmRemove">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import common from '../common/common';
    import crypto from 'crypto';
    export default {
        name: 'basetable',
        data() {
			var validatePhone = (rule, value, callback) => {
				if (value == null || value === '') {
				  callback(new Error('手机号不能为空'));
				} else if (!(/^1[3456789]\d{9}$/.test(value))) {
				  callback(new Error('手机号格式不正确'));
				} else {
					$.get(this.$baseUrl + 'member/checkPhoneIsExist.json?phone='+value).then((res) => {
						if (res.resultMessageEnum == '0000') {
							if(res.returnObject){
								callback(new Error('手机号已注册！'));
							}else{
								callback();
							}
						}else {
							this.$message.error(res.errorInfoList[0].errorMessage);
						}
					});
				}
			};
			var validateGroup = (rule, value, callback) => {
			  	if (value == null || value === '') {
			  	  callback(new Error('组名不能为空'));
			  	}else {
			  		$.get(this.$baseUrl + 'member/checkGroupIsExist.json?groupName='+value).then((res) => {
			  			if (res.resultMessageEnum == '0000') {
			  				if(res.returnObject){
			  					callback(new Error('该组已经存在！'));
			  				}else{
			  					callback();
			  				}
			  			}else {
			  				this.$message.error(res.errorInfoList[0].errorMessage);
			  			}
			  		});
			  	}
			};
            return {
                // 搜索相关
                queryKey:'',
                // 过滤相关
                filterRoleList:[], // 过滤已选角色
                filterRoleData:[], // 过滤待选角色
                roleList:[],
                // 分页相关
                cur_page:1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10
                },
                // 表格相关
                accountTableData: [],
                height:300,
                options: {
                    stripe: true, // 是否为斑马纹 table
                    loading: true, // 是否添加表格loading加载动画
                    highlightCurrentRow: true, // 是否支持当前行高亮显示
                    mutiSelect: true // 是否支持列表项选中功能
                },
                rules: {
                    role: [
                        { required: true, message: '角色不能为空！', trigger: 'change' }
                    ],
                    groupId: [
                        { required: true, message: '组长不能为空！', trigger: 'change' }
                    ],
                    groupName: [
                        { required: true, validator: validateGroup, trigger: 'change' }
                    ],
                   /* phone:[
                        { required: true, message: '手机号不能为空！', trigger: 'blur' }, */
                        /*{validator:function(rule,value,callback){
                                if(/^1[345678]\d{9}$/.test(value) == false){
                                    callback(new Error("请输入11位手机号！"));
                                }else{
                                    callback();
                                }
                            }, trigger: 'change'}*/
                //    ],
					phone:[
						 { required: true, validator: validatePhone, trigger: 'blur'}
					],
                    password: [
                        { required: true, message: '密码不能为空！', trigger: 'blur' },
                        /*{validator:function(rule,value,callback){
                                if(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/.test(value) == false){
                                    callback(new Error("请输入8-20位字母数字结合密码！"));
                                }else{
                                    callback();
                                }
                            }, trigger: 'change'}*/
                    ],
                    userName:[
                        { required: true, message: '真实姓名不能为空！', trigger: 'change' }
                    ]
                },

                // 添加账号相关
                createVisible: false,
                leaderList:[],
                functionScope:'',
                createForm: {
                    role:'',
                    groupId:'',
                    groupName:'',
                    phone:'',
                    password:'',
                    userName:'',
                    email:'',
                },
                createRoleForm:{
                    isShow:false,
                    roleName:'',
                },
                errors:{
                    errorPhoneMsg:false,
                    errorGroupMsg:false,
                },
                // 移除账号相关
                removeVisible:false,
                accountId:'',
                removeText:'',
                // 修改账号相关
                modifyVisible:false,
                modifyForm: {
                    accountId:'',
                    roleValue:'',
                    roleName:'',
                    groupId:'',
                    groupName:'',
                    phone:'',
                    password:'',
                    userName:'',
                    email:'',
                },
                modifyRules: {
                    groupName: [
                        { required: true, validator: validateGroup, trigger: 'change' }
                    ],
                    phone:[
						{ required: true, validator: validatePhone, trigger: 'blur' }
                    //    { required: true, message: '手机号不能为空！', trigger: 'blur' },
                        /*{validator:function(rule,value,callback){
                         if(/^1[345678]\d{9}$/.test(value) == false){
                         callback(new Error("请输入11位手机号！"));
                         }else{
                         callback();
                         }
                         }, trigger: 'change'}*/
                    ],
                    password: [
                        { required: true, message: '密码不能为空！', trigger: 'blur' },
                        /*{validator:function(rule,value,callback){
                         if(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/.test(value) == false){
                         callback(new Error("请输入8-20位字母数字结合密码！"));
                         }else{
                         callback();
                         }
                         }, trigger: 'change'}*/
                    ],
                    userName:[
                        { required: true, message: '真实姓名不能为空！', trigger: 'change' }
                    ]
                },
            }
        },
        created() {
            var clintHeight = document.documentElement.clientHeight;
            this.height = clintHeight - 260;
            bus.$emit('contentTop', true);
            this.queryAccountList();
            this.queryRoleList();
        },
        computed: {
        },
        /**
         *
         */
        methods: {
            /**
             * 处理搜索
             * @returns {boolean}
             */
            handleSearch() {
                if(!this.queryKey){
                    this.$message.error("请输入关键字！");
                    return false;
                }
                this.cur_page=1;
                this.queryAccountList();
            },
            /**
             * 处理搜索内容变化
             * @param val
             */
            handleSearchChange(val){
                if(!val){
                    this.queryAccountList();
                }
            },
            /**
             * 显示添加对话框
             * @returns {boolean}
             */
            handleCreate(){
                this.createVisible = true;
                this.queryRoleList();
            },
            /**
             * 创建账户
             * @param formName
             */
            handleCreateAccount(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        var md5 = crypto.createHash("md5");
                        md5.update(this.createForm.password);
                        let md5PassWord = md5.digest('hex');
                        let data = {
                            roleId: this.createForm.role.id,
                            groupId: this.createForm.groupId,
                            groupName: this.createForm.groupName,
                            phone: this.createForm.phone,
                            password: md5PassWord,
                            userName: this.createForm.userName,
                            email: this.createForm.email
                        };
                        $.post(this.$baseUrl + 'member/addAccount.json', JSON.stringify(data)).then((res) => {
                            if (res.resultMessageEnum == '0000') {
                                this.errors.errorPhoneMsg = false;
                                this.errors.errorGroupMsg = false;
                                this.createVisible = false;
                                this.$refs[formName].resetFields();
                                this.queryAccountList();
                                this.$message.success('添加成功！');
                            } else if(res.errorInfoList[0].errorMessageEnum=='000112'){
                                this.errors.errorPhoneMsg=true;
                            } else if(res.errorInfoList[0].errorMessageEnum=='080001'){
                                this.errors.errorGroupMsg=true;
                            } else {
                                this.$message.error(res.errorInfoList[0].errorMessage);
                            }
                        });
                    } else {
                        return false;
                    }
                });
            },

            /**
             * 确认添加角色
             */
            handleConfirmAddRole(){
                let data = {
                        roleName:this.createRoleForm.roleName,
                };
                $.post(this.$baseUrl + 'member/addRole.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.createRoleForm.isShow = false;
                        this.queryRoleList();
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },

            /**
             * 处理角色类型
             * @param row
             * @param column
             * @returns {*|string}
             */
            handleCheckRole(row, column){
                return common.taskCheckRole(row.role);
            },
            /**
             *处理移除
             * @param index
             * @param row
             */
            handleRemove(index,row){
                this.removeVisible = true;
                this.removeText ='您确定要删除该子账号吗？';
                this.accountId = row.id;
                let data = {accountId:row.id};
                $.post(this.$baseUrl + 'member/queryTaskCheckItemNumber.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        let data = res.returnObject;
                        if (data > 0) {
                            this.removeText = '该账号下有正在进行中的质检任务，确定要删除该子账号吗？';
                        }
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },

            /**
             * 移除账号
             */
            handleConfirmRemove(){
                let data = {accountId:this.accountId};
                $.post(this.$baseUrl + 'member/removeAccount.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.$message.success('移除成功！');
                        this.removeVisible = false;
                        this.queryAccountList();
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             *处理修改
             * @param index
             * @param row
             */
            handleModify(index,row){
                $.get(this.$baseUrl + 'member/querytAccountById.json?id=' + row.id).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        let data = res.returnObject;
                        this.modifyForm.accountId = data.id;
                        this.modifyForm.roleValue = data.role;
                        this.modifyForm.roleName = data.roleName;
                        this.modifyForm.groupId = data.groupId;
                        this.modifyForm.groupName = data.groupName;
                        this.modifyForm.phone = data.phone;
                        this.modifyForm.userName = data.userName;
                        this.modifyForm.email = data.email;
                        if (data.role === 2) {
                            this.functionScope = '创建任务 仅任务质检';
                        } else if (data.role === 3) {
                            this.functionScope = '仅任务质检';
                        };
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
                this.modifyVisible = true;
            },
            /**
             * 确认修改账号
             */
            handleConfirmModify(){
                var md5 = crypto.createHash("md5");
                md5.update(this.modifyForm.password);
                let md5PassWord = md5.digest('hex');

                let data = {
                    accountId:this.modifyForm.accountId,
                    groupId:this.modifyForm.groupId,
                    groupName:this.modifyForm.groupName,
                    userName:this.modifyForm.userName,
                    email:this.modifyForm.email,
                    password:md5PassWord,

                };
                $.post(this.$baseUrl + 'member/modifyAccount.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.$message.success('修改成功！');
                        this.modifyVisible = false;
                        this.queryAccountList();
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },

            /**
             * 处理角色选择
             * @param val
             */
            handleRoleChange(val){
                if (val) {
                    if (val.roleValue === 2) {
                        this.functionScope = '创建任务 仅任务质检';
                    } else if (val.roleValue === 3) {
                        this.functionScope = '仅任务质检';
                        this.queryLeaderList();
                    };
                };

            },

            /**
             * 查询账号列表
             * @param opt
             */
            queryAccountList(opt) {
                let data = $.extend({}, {
                    currentPage: this.cur_page - 1,
                    pageSize: this.pagination.pageSize
                }, opt);
                if (this.queryKey) {
                    data.queryKey = this.queryKey;
                }
                if (this.filterRoleList.length) {
                    data.roleList = this.filterRoleList;
                }
                $.post(this.$baseUrl + 'member/queryAccountList.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        let data = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                        this.accountTableData = data;
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 查询角色列表
             */
            queryRoleList() {
                $.get(this.$baseUrl + 'member/queryRoleList.json').then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.roleList = [];
                        if (res.returnObject) {
                            res.returnObject.forEach((value,index) => {
                                if (value.roleValue !== 1) {
                                    this.roleList.push(value);
                                    this.filterRoleData.push({text:value.roleName,value:value.roleValue});
                                };
                            })
                        }
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 查询组长列表
             */
            queryLeaderList() {
                $.get(this.$baseUrl + 'member/queryLeaderList.json').then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        if (res.returnObject) {
                            this.leaderList = res.returnObject;
                        }
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 分页导航
             * @param val
             */
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryAccountList();
            },
            /**
             * 每页显示条数改变
             * @param val
             */
            handleSizeChange(val) {
                this.pagination.pageSize = val;
                this.queryAccountList();
            },
            /**
             * 处理过滤变化
             * @param filters
             */
            handleFilterChange(filters){
                let name = Object.keys(filters)[0];
                if(name == 'filterRoleList'){
                    this.filterRoleList = filters.filterRoleList;
                }
                this.queryAccountList();
            },

        },
        destroyed(){
            bus.$emit('contentTop', false);
        }
    }

</script>

<style scoped lang="less">
    .task-table-cantainer {
        background: #fff;
        color: #303133;
        border-radius: 5px;
    }

    .handle-input {
        width: 240px;
        display: inline-block;
    }

    .creatDialog {
        .el-input {
            width: 380px;
        }

        .file-btn {
            .el-input {
                width: 88px;
            }
        }

        .el-icon-question {
            font-size: 16px;
            color: #919FA9;
        }

        .data-btn-box {

            .el-button {
                width: 88px;
                margin-left: 0;
                margin-bottom: 10px;
            }
        }
    }

    .tip-content {
        width: 164px;
        padding: 5px;
        line-height: 18px;
    }

    .handle-box {
        margin-bottom: 20px;
    }

    .el-table .cell {
        position: relative;
    }


    .handle-select {
        width: 120px;
    }

    .del-dialog-cnt {
        font-size: 16px;
        text-align: center
    }

    .table {
        width: 100%;
        font-size: 14px;
    }

    #file {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        opacity: 0;
    }

    .red {
        color: #ff0000;
    }

    .blue {
        color: #fea200;
    }

    .el-button + .el-button {
        margin-left: 0;
    }

    .phone_check_error {
        display: contents;
    }
</style>
