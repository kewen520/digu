<template>
	<div class="table">
		<div class="content-box-top">
			<el-input v-model="queryPageCondition.queryKey" clearable placeholder="输入号码／用户名称／任务名称" @change="" class="handle-input mr10"></el-input>
			<el-button type="primary" icon="search" @click="search">搜索</el-button>
			<div class="content-box-top-right">
				<el-button type="primary" @click="handleSetupLimit">呼叫上限设置</el-button>
			</div>
		</div>
		<div style="position:relative; left:5px; top:50px; ">
			<el-card class="box-card">
				<div slot="header" class="clearfix">
					<span>无效号码</span>
					<!-- <el-tooltip class="item" effect="light" popper-class="speech-tip" placement="right-start">
						<div slot="content">意图级别A和F代表没有必要</br>再打的情况，因此纳入当日</br>防骚扰号码列表，当日不再</br>拨打</div>
						<i class="el-icon-question"></i>
					</el-tooltip> -->
					<!-- <el-button type="primary" style="float: right; padding: 3px 0" >导出</el-button> -->
					<el-button type="primary" style="float: right;  0" @click="removeNumber()">移出</el-button>
				</div>
				<div class="text item">
					<el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
						<el-table-column type="selection" width="55"></el-table-column>
						<el-table-column prop="phone" label="号码" width="120"></el-table-column>
						<el-table-column prop="taskName" label="任务名称" width="120"></el-table-column>
						<el-table-column prop="customerName" label="用户姓名"></el-table-column>
						<el-table-column prop="callNumber" label="拨打次数" width="120"></el-table-column>
						<el-table-column prop="connectedResultType" label="通话结果" :formatter="connectedResultFormatter"></el-table-column>
						<el-table-column prop="status" label="状态" width="120">
							<template slot-scope="scope">
								<span :class="scope.row.status==1?'danger':'default'">
									{{scope.row.status == 1 ? '限制中': '已移出'}}
								</span>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<div class="pagination">
					<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryPageCondition.currentPage"
					 :page-sizes="[10, 20, 50, 100, 200]" :page-size="queryPageCondition.pageSize" layout="total, sizes, prev, pager, next, jumper"
					 :total="total">
					</el-pagination>
				</div>
			</el-card>
			<el-dialog title="呼叫上限设置" :visible.sync="dialogFormVisible">
				<el-form :model="form" :label-position="labelPosition" label-width="120px">
					<el-form-item label="呼叫间隔时间">
						<el-input-number v-model="form.repeatIntervalHour" controls-position="right" :min="0"></el-input-number> 时
						<el-input-number v-model="form.repeatIntervalMinute" controls-position="right" :min="0" :max="59"></el-input-number> 分
					</el-form-item>
					<el-form-item label="关机">
						<el-select v-model="closedSelect" >
							<el-option label="不限" value="unlimited"></el-option>
							<el-option label="自定义" value="custom"></el-option>
						</el-select>
						<el-input-number v-if="closedSelect == 'custom'" v-model="form.callLimitClosed" controls-position="right" :min="1" :max="1000"></el-input-number> 次
					</el-form-item>
					<el-form-item label="停机">
						<el-select v-model="downtimeSelect">
							<el-option label="不限" value="unlimited"></el-option>
							<el-option label="自定义" value="custom"></el-option>
						</el-select>
						<el-input-number v-if="downtimeSelect == 'custom'" v-model="form.callLimitDowntime" controls-position="right" :min="1" :max="1000"></el-input-number> 次
					</el-form-item>
					<el-form-item label="用户忙">
						<el-select v-model="refusedSelect">
							<el-option label="不限" value="unlimited"></el-option>
							<el-option label="自定义" value="custom"></el-option>
						</el-select>
						<el-input-number v-if="refusedSelect == 'custom'" v-model="form.callLimitRefused" controls-position="right" :min="1" :max="1000"></el-input-number> 次
					</el-form-item>
					<el-form-item label="无应答">
						<el-select v-model="noAnswerSelect">
							<el-option label="不限" value="unlimited"></el-option>
							<el-option label="自定义" value="custom"></el-option>
						</el-select>
						<el-input-number v-if="noAnswerSelect == 'custom'" v-model="form.callLimitNoAnswer" controls-position="right" :min="1" :max="1000"></el-input-number> 次
					</el-form-item>
					<el-form-item label="线路故障">
						<el-select v-model="callFailSelect">
							<el-option label="不限" value="unlimited"></el-option>
							<el-option label="自定义" value="custom"></el-option>
						</el-select>
						<el-input-number v-if="callFailSelect == 'custom'" v-model="form.callLimitCallFail" controls-position="right" :min="1" :max="1000"></el-input-number> 次
					</el-form-item>
					<el-form-item label="空号">
						<el-select v-model="emptySelect">
							<el-option label="不限" value="unlimited"></el-option>
							<el-option label="自定义" value="custom"></el-option>
						</el-select>
						<el-input-number v-if="emptySelect == 'custom'" v-model="form.callLimitEmpty" controls-position="right" :min="1" :max="1000"></el-input-number> 次
					</el-form-item>
					<el-form-item label="呼叫转移">
						<el-select v-model="forwordSelect">
							<el-option label="不限" value="unlimited"></el-option>
							<el-option label="自定义" value="custom"></el-option>
						</el-select>
						<el-input-number v-if="forwordSelect == 'custom'" v-model="form.callLimitForword" controls-position="right" :min="1" :max="1000"></el-input-number> 次
					</el-form-item>
				</el-form>
				<div>注：自定义上限值范围为1-1000次</div>
				<div slot="footer" class="dialog-footer">
					<el-button @click="dialogFormVisible = false">取 消</el-button>
					<el-button type="primary" @click="submit">确 定</el-button>
				</div>
			</el-dialog>
		</div>
	</div>
</template>
<script>
	import bus from '../common/bus';
	export default {
		components: {},
		data() {
			return {
				total: null,
				queryPageCondition: {
					queryKey: null,
					currentPage: 1,
					pageSize: 10
				},
				tableData: [],
				multipleSelection: [],
				dialogFormVisible: false,
				form: {
					id:'',
					repeatIntervalHour: 0,
					repeatIntervalMinute: 0,
					callLimitClosed: 1,
					callLimitDowntime: 1,
					callLimitRefused: 1,
					callLimitNoAnswer: 1,
					callLimitCallFail: 1,
					callLimitEmpty: 1,
					callLimitForword: 1
				},
				formLabelWidth: '120px',
				labelPosition: 'right',
				closedSelect: 'unlimited',
				downtimeSelect: 'unlimited',
				refusedSelect: 'unlimited',
				noAnswerSelect: 'unlimited',
				callFailSelect: 'unlimited',
				emptySelect: 'unlimited',
				forwordSelect: 'unlimited'
			}
		},
		created() {
			this.queryInvalidNumberList();
		},
		computed: {

		},
		methods: {
			handleSelectionChange(val) {
				this.multipleSelection = val;
			},
			// 获取无效列表
			queryInvalidNumberList() {
				$.post(this.$baseUrl + 'task/queryInvalidNumberList.json', JSON.stringify(this.queryPageCondition)).then((
					res) => {
					if (res.resultMessageEnum == '0000') {
						let pageInfo = res.returnObject;
						this.total = pageInfo.totalNumber;
						this.queryPageCondition.currentPage = pageInfo.currentPage;
						this.queryPageCondition.pageSize = pageInfo.pageSize;
						this.tableData = pageInfo.recordList;
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				});
			},
			handleSizeChange(val) {
				console.log(`每页 ${val} 条`);
				this.queryPageCondition.pageSize = val;
				this.queryInvalidNumberList();
			},
			handleCurrentChange(val) {
				console.log(`当前页: ${val}`);
				this.queryPageCondition.currentPage = val;
				this.queryInvalidNumberList();
			},
			// 格式化接听结果
			connectedResultFormatter(row, column, cellValue, index) {
				if (cellValue == 1) {
					return '接听';
				} else {
					return '未接听';
				}
			},
			// 执行搜索
			search() {
				this.queryInvalidNumberList();
			},
			removeNumber() {
				if (this.multipleSelection.length == 0) {
					//	alert("请选择要移出的号码！");
					this.$message.error('请选择要移出的号码！');
					return;
				}
				let self = this;
				let numbers = [];
				for (var i = 0; i < this.multipleSelection.length; i++) {
					numbers.push(this.multipleSelection[i].id);
				}
				// console.log(numbers);
				$.ajax({
					url: this.$baseUrl + 'task/removeInvalidNumbers.json',
					type: 'POST',
					cache: false,
					data: {
						"numbers": numbers
					},
					dataType: "json",
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
				}).done(function(res) {
					if (res.resultMessageEnum == '0000') {
						self.$message.success('操作成功！');
						self.queryInvalidNumberList();
					} else {
						self.$message.error('操作失败！');
					}
				}).fail(function(res) {
					self.$message.error('操作失败！');
				});
			},
			// 呼叫上限设置
			handleSetupLimit() {
				$.get(this.$baseUrl+'task/queryTaskConfig.json').then((res)=>{
				    if(res.resultMessageEnum=='0000'){
				        if(res.returnObject){
							let taskConfig = res.returnObject;
							// this.form.id = taskConfig.id;
							// this.form.repeatIntervalHour = taskConfig.taskConfig;
							// this.form.repeatIntervalMinute = taskConfig.repeatIntervalMinute;
							this.form = taskConfig;
							if(taskConfig.callLimitClosed){
								this.closedSelect = 'custom';
								this.form.callLimitClosed = taskConfig.callLimitClosed;
							}
							if(taskConfig.callLimitDowntime){
								this.downtimeSelect = 'custom';
								this.form.callLimitDowntime = taskConfig.callLimitDowntime;
							}
							if(taskConfig.callLimitRefused){
								this.refusedSelect = 'custom';
								this.form.callLimitRefused = taskConfig.callLimitRefused;
							}
							if(taskConfig.callLimitNoAnswer){
								this.noAnswerSelect = 'custom';
								this.form.callLimitNoAnswer = taskConfig.callLimitNoAnswer;
							}
							if(taskConfig.callLimitCallFail){
								this.callFailSelect = 'custom';
								this.form.callLimitCallFail = taskConfig.callLimitCallFail;
							}
							if(taskConfig.callLimitEmpty){
								this.emptySelect = 'custom';
								this.form.callLimitEmpty = taskConfig.callLimitEmpty;
							}
							if(taskConfig.callLimitForword){
								this.forwordSelect = 'custom';
								this.form.callLimitForword = taskConfig.callLimitForword;
							}
				        }else{
							
				        }  
				        
				    }else{
				        resolve(res.errorInfoList[0].errorMessage);
				        // this.$message.error(res.errorInfoList[0].errorMessage);
				    }
				});
				this.dialogFormVisible = true;
			},
			// 提交保存
			submit(){
				if(this.closedSelect == 'unlimited'){
					this.form.callLimitClosed = null;
				}
				if(this.downtimeSelect == 'unlimited'){
					this.form.callLimitDowntime = null;
				}
				if(this.refusedSelect == 'unlimited'){
					this.form.callLimitRefused = null;
				}
				if(this.noAnswerSelect == 'unlimited'){
					this.form.callLimitNoAnswer = null;
				}
				if(this.callFailSelect == 'unlimited'){
					this.form.callLimitCallFail = null;
				}
				if(this.emptySelect == 'unlimited'){
					this.form.callLimitEmpty = null;
				}
				if(this.forwordSelect == 'unlimited'){
					this.form.callLimitForword = null;
				}
				var json = JSON.stringify(this.form);
				console.log(json);
				$.post(this.$baseUrl+'task/saveOrUpdateTaskConfig.json', json).then((res)=>{
				    if(res.resultMessageEnum=='0000'){
				        this.form.id = res.returnObject;
						this.dialogFormVisible = false;
				        this.$message.success('保存成功');
				    }else{
				        this.$message.error(res.errorInfoList[0].errorMessage);
				    }
				});
			}
		},

		destroyed() {
			// bus.$emit('contentTop', false);
		}
	}
</script>
<style scoped lang="less">
	.text {
		font-size: 14px;
	}

	.item {
		margin-bottom: 18px;
	}

	.clearfix:before,
	.clearfix:after {
		display: table;
		content: "";
	}

	.clearfix:after {
		clear: both
	}

	.box-card {
		width: 100%;
	}

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

	.el-button+.el-button {
		margin-left: 0;
	}
	.danger{
	    color: #f56c6c;
	}
	.default{
	    // color: #606266;
	}
</style>
