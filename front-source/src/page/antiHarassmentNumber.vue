<template>
  <div class="table">
    <div class="content-box-top">
      <el-input
        v-model="queryPageCondition.queryKey"
        clearable
        placeholder="输入号码／用户名称／任务名称"
        @change
        class="handle-input mr10"
      ></el-input>
      <el-button type="primary" icon="search" @click="search">搜索</el-button>
      <div class="content-box-top-right">
        <el-button type="primary" @click="handleHarass">防骚扰设置</el-button>
      </div>
    </div>
    <div style="position:relative; left:5px; top:50px; ">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>有效号码</span>
          <el-tooltip class="item" effect="light" popper-class="speech-tip" placement="right-start">
            <div slot="content">
              意图级别A和F代表没有必要
              <br />再打的情况，因此纳入当日
              <br />防骚扰号码列表，当日不再
              <br />拨打
            </div>
            <i class="el-icon-question"></i>
          </el-tooltip>
          <!-- <el-button type="primary" style="float: right; padding: 3px 0" >导出</el-button> -->
          <el-button type="primary" style="float: right;  0" @click="removeNumber">移出</el-button>
        </div>
        <div class="text item">
          <el-table
            ref="multipleTable"
            :data="tableData"
            tooltip-effect="dark"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="phone" label="号码" width="120"></el-table-column>
            <el-table-column prop="taskName" label="任务名称" width="120"></el-table-column>
            <el-table-column prop="customerName" label="用户姓名"></el-table-column>
            <el-table-column prop="callTime" label="外呼时间" width="120"></el-table-column>
            <el-table-column prop="connectedDuration" label="通话时长" width="120"></el-table-column>
            <el-table-column
              prop="connectedResultType"
              label="通话结果"
              :formatter="connectedResultFormatter"
            ></el-table-column>
            <el-table-column
              prop="intentionLevel"
              label="意向级别"
              width="120"
              :formatter="intentionLevelFormatter"
            ></el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template slot-scope="scope">
                <span
                  :class="scope.row.status==1?'danger':'default'"
                >{{scope.row.status == 1 ? '限制中': '已移出'}}</span>
              </template>
            </el-table-column>
            <el-table-column label="识别详情" width="180">
              <template slot-scope="scope">
                <el-button
                  :disabled="scope.row.connectedResultType!=1"
                  type="text"
                  @click="queryTaskResultRecognition(scope.$index, scope.row)"
                >查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryPageCondition.currentPage"
            :page-sizes="[10, 20, 50, 100, 200]"
            :page-size="queryPageCondition.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </div>
      </el-card>
    </div>
    <el-dialog title="识别详情" class="video-box" :visible.sync="viewVisible" width="600px">
      <div class="video-contant-box">
        <w-video :source="viewSource" :playing="viewPlaying" />
      </div>
      <el-table :data="viewTableData" stripe style="width: 100%">
        <el-table-column prop="nodeName" label="节点名称" width="180">
          <template slot-scope="scope">
            <a class="viewItemText">{{scope.row.nodeName}}</a>
            <!-- <span class="viewItemPlay"><i class="w_icon_play w_icon_pause"></i></span> -->
          </template>
        </el-table-column>
        <el-table-column prop="nodeContent" label="识别内容"></el-table-column>
      </el-table>
      <div>
        <el-tag size="medium" v-if="transferFlag == 1">
          <i class="el-icon-service"></i> 后续通话转人工客服接待
        </el-tag>
      </div>
    </el-dialog>
    <el-dialog title="防骚扰设置" :visible.sync="dialogFormVisible">
      <el-tabs value="first">
        <el-tab-pane label="呼叫上限" name="first">
          <el-form :model="callLimit" :label-position="labelPosition" label-width="120px">
            <el-form-item label="意图等级A">
              <el-input-number v-model="callLimit.callLimitLevelA"></el-input-number>&nbsp;次
            </el-form-item>
            <el-form-item label="意图等级B">
              <el-input-number v-model="callLimit.callLimitLevelB"></el-input-number>&nbsp;次
            </el-form-item>
            <el-form-item label="意图等级C">
              <el-input-number v-model="callLimit.callLimitLevelC"></el-input-number>&nbsp;次
            </el-form-item>
            <el-form-item label="意图等级D">
              <el-input-number v-model="callLimit.callLimitLevelD"></el-input-number>&nbsp;次
            </el-form-item>
            <el-form-item label="意图等级E">
              <el-input-number v-model="callLimit.callLimitLevelE"></el-input-number>&nbsp;次
            </el-form-item>
            <el-form-item label="意图等级F">
              <el-input-number v-model="callLimit.callLimitLevelF"></el-input-number>&nbsp;次
            </el-form-item>
            <el-form-item label="无意图等级">
              <el-input-number v-model="callLimit.callLimitLevelO"></el-input-number>&nbsp;次
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="释放周期" name="second">
          <el-form :model="releaseCycle" :label-position="labelPosition" label-width="120px">
            <el-form-item v-for="(item, name) in releaseCycle" :key="name" :label="item.title">
              <el-select v-model="releaseCycleForm[name]">
                <el-option
                  v-for="v in item.options"
                  :key="v.value"
                  :label="v.label"
                  :value="v.value"
                ></el-option>
              </el-select>
              <el-input-number
                v-if="releaseCycleForm[name] == 'custom'"
                v-model="releaseCycleCustom[name]"
                controls-position="right"
                :min="1"
                :max="1000"
              ></el-input-number>次
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import bus from '../common/bus';
import wVideo from './base/Video';
import { getUserInfo } from '../lib/userInfo';

const releaseCycleOptions = [
  {
    label: '当日',
    value: 0,
  },
  {
    label: '自定义',
    value: 'custom',
  },
  {
    label: '不限',
    value: -1,
  },
];

const mapOptions = days => {
  switch (days) {
    case 0:
      return '当日';
    case -1:
      return '不限';
    default:
      return '自定义';
  }
};

export default {
  components: {
    wVideo,
  },
  data() {
    return {
      total: null,
      queryPageCondition: {
        queryKey: null,
        currentPage: 1,
        pageSize: 10,
      },
      tableData: [],
      multipleSelection: [],
      viewVisible: false,
      taskItemResultRecognition: [],
      transferFlag: null,
      viewPlaying: false,
      viewTableData: [],
      viewSource: '',
      showAlert: true,
      dialogFormVisible: false,
      labelPosition: 'right',
      callLimit: {
        callLimitLevelA: 1,
        callLimitLevelB: 1,
        callLimitLevelC: 1,
        callLimitLevelD: 1,
        callLimitLevelE: 1,
        callLimitLevelF: 1,
        callLimitLevelO: 1,
      },
      releaseCycleCustom: {
        releaseCycleLevelA: 0,
        releaseCycleLevelB: 0,
        releaseCycleLevelC: 0,
        releaseCycleLevelD: 0,
        releaseCycleLevelE: 0,
        releaseCycleLevelF: 0,
        releaseCycleLevelO: 0,
      },
      releaseCycleForm: {
        releaseCycleLevelA: 0,
        releaseCycleLevelB: 0,
        releaseCycleLevelC: 0,
        releaseCycleLevelD: 0,
        releaseCycleLevelE: 0,
        releaseCycleLevelF: 0,
        releaseCycleLevelO: 0,
      },
      releaseCycle: {
        releaseCycleLevelA: {
          title: '意图等级A',
          options: releaseCycleOptions,
        },
        releaseCycleLevelB: {
          title: '意图等级B',
          options: releaseCycleOptions,
        },
        releaseCycleLevelC: {
          title: '意图等级C',
          options: releaseCycleOptions,
        },
        releaseCycleLevelD: {
          title: '意图等级D',
          options: releaseCycleOptions,
        },
        releaseCycleLevelE: {
          title: '意图等级E',
          options: releaseCycleOptions,
        },
        releaseCycleLevelF: {
          title: '意图等级F',
          options: releaseCycleOptions,
        },
        releaseCycleLevelO: {
          title: '无意图等级',
          options: releaseCycleOptions,
        },
      },
    };
  },
  created() {
    this.queryAntiHarassmentNumberList();
  },
  computed: {},
  methods: {
    submit() {
      const userInfo = getUserInfo();
      const releaseCycleFormFormat = Object.keys(this.releaseCycleForm).reduce(
        (accumulator, current) => {
          if (this.releaseCycleForm[current] === 'custom') {
            accumulator[current] = this.releaseCycleCustom[current];
            return accumulator;
          }
          accumulator[current] = this.releaseCycleForm[current];
          return accumulator;
        },
        {},
      );
      const req = JSON.stringify({
        id: userInfo.id,
        ...this.callLimit,
        ...releaseCycleFormFormat,
      });
      $.post(this.$baseUrl + 'task/saveOrUpdateTaskConfig.json', req).then(res => {
        if (res.resultMessageEnum == '0000') {
          this.dialogFormVisible = false;
        } else {
          this.$message.error(res.errorInfoList[0].errorMessage);
        }
      });
    },
    handleHarass() {
      this.dialogFormVisible = true;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 获取防骚扰电话列表
    queryAntiHarassmentNumberList() {
      $.post(
        this.$baseUrl + 'task/queryAntiHarassmentNumberList.json',
        JSON.stringify(this.queryPageCondition),
      ).then(res => {
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
      this.queryAntiHarassmentNumberList();
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.queryPageCondition.currentPage = val;
      this.queryAntiHarassmentNumberList();
    },
    // 格式化接听结果
    connectedResultFormatter(row, column, cellValue, index) {
      if (cellValue == 1) {
        return '接听';
      } else {
        return '未接听';
      }
    },
    // 格式化意向级别
    intentionLevelFormatter(row, column, cellValue, index) {
      switch (cellValue) {
        case 1:
          return 'A';
        case 2:
          return 'B';
        case 3:
          return 'C';
        case 4:
          return 'D';
        case 5:
          return 'E';
        case 6:
          return 'F';
        default:
          return '';
      }
    },
    // 格式化状态

    /* statusFormatter(row, column, cellValue, index) {
				if (cellValue == 1) {
					return "限制中";
				} else {
					return "已移出";
				}
			}, */
    // 查看识别详情
    queryTaskResultRecognition(index, row) {
      this.taskItemResultRecognition = [];
      let data = {
        taskItemId: row.taskItemId,
      };
      $.get(this.$baseUrl + 'task/queryTaskResultRecognition.json', $.param(data)).then(res => {
        if (res.resultMessageEnum == '0000') {
          if (res.returnObject) {
            this.viewVisible = true;
            this.taskItemResultRecognition = res.returnObject;
            this.transferFlag = res.returnObject.transferFlag;
            // this.soundPath = res.returnObject.soundPath;
            setTimeout(() => {
              this.viewSource = res.returnObject.soundPath;
            }, 200);

            if (res.returnObject.recognitionContent) {
              this.viewTableData = JSON.parse(res.returnObject.recognitionContent);
            }
          }
        } else {
          this.$message.error(res.errorInfoList[0].errorMessage);
        }
      });
    },
    search() {
      this.queryAntiHarassmentNumberList();
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
        url: this.$baseUrl + 'task/removeAntiHarassmentNumbers.json',
        type: 'POST',
        cache: false,
        data: {
          numbers: numbers,
        },
        dataType: 'json',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .done(function(res) {
          if (res.resultMessageEnum == '0000') {
            self.$message.success('操作成功！');
            self.queryAntiHarassmentNumberList();
          } else {
            self.$message.error('操作失败！');
          }
        })
        .fail(function(res) {
          self.$message.error('操作失败！');
        });
    },
  },

  destroyed() {
    // bus.$emit('contentTop', false);
  },
};
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
  content: '';
}

.clearfix:after {
  clear: both;
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
    color: #919fa9;
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
  text-align: center;
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
.danger {
  color: #f56c6c;
}
.default {
  // color: #606266;
}
</style>
