<template>
  <div>
    <div class="w-container log-form">
      <el-card class="box-card">
        <el-tabs value="second">
          <el-tab-pane label="外呼设置" name="first">
            <div class="recharge-from-box">
              <el-form
                ref="taskConfigForm"
                :model="taskConfigForm"
                :rules="rules"
                label-width="180px"
              >
                <el-form-item label="外呼周期：" prop="checkWeeks">
                  <el-checkbox
                    :indeterminate="isIndeterminate"
                    v-model="checkAll"
                    @change="handleCheckAllChange"
                  >全选</el-checkbox>
                  <div style="margin: 15px 0;"></div>
                  <el-checkbox-group
                    v-model="checkedWeeks"
                    :min="1"
                    @change="handleCheckedWeeksChange"
                  >
                    <el-checkbox v-for="week in weekOptions" :label="week" :key="week">{{week}}</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <el-form-item label="每日午间防骚扰时段：">
                  <el-time-select
                    placeholder="起始时间"
                    v-model="startTimeDay"
                    :picker-options="{
								  start: '10:00',
								  step: '01:00',
								  end: '16:00'
								}"
                  ></el-time-select>-
                  <el-time-select
                    placeholder="结束时间"
                    v-model="endTimeDay"
                    :picker-options="{
								  start: '10:00',
								  step: '01:00',
								  end: '16:00',
								  minTime: startTimeDay
								}"
                  ></el-time-select>
                  <el-tooltip
                    class="item"
                    effect="light"
                    popper-class="speech-tip"
                    placement="right-start"
                  >
                    <div slot="content">
                      您可以根据需要配置【午间防骚扰时
                      <br />间】，【夜间防骚扰】默认设置为限
                      <br />定防骚扰时段21:00-8:00，您可以自
                      <br />行调整
                    </div>
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="每日夜间防骚扰时段：">
                  <el-time-select
                    placeholder="起始时间"
                    v-model="startTimeNight"
                    :picker-options="{
								  start: '16:00',
								  step: '01:00',
								  end: '21:00'
								}"
                  ></el-time-select>-
                  <el-time-select
                    placeholder="结束时间"
                    v-model="endTimeNight"
                    :picker-options="{
								  start: '08:00',
								  step: '01:00',
								  end: '10:00',
								//  minTime: startTimeNight
								}"
                  ></el-time-select>
                </el-form-item>
                <el-form-item label="当日重呼次数：">
                  <el-input-number
                    v-model="taskConfigForm.repeatTimes"
                    controls-position="right"
                    :min="0"
                  ></el-input-number>
                </el-form-item>
                <!-- <el-form-item label="重呼间隔时间：" >
						    <el-input-number v-model="taskConfigForm.repeatIntervalHour" controls-position="right" :min="0"></el-input-number> 时
							<el-input-number v-model="taskConfigForm.repeatIntervalMinute" controls-position="right" :min="0" :max="59"></el-input-number> 分
                </el-form-item>-->
                <el-form-item label="未完成外呼任务：">
                  <el-select v-model="v" value-key="value">
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item"
                    ></el-option>
                  </el-select>
                  <el-tooltip
                    class="item"
                    effect="light"
                    popper-class="speech-tip"
                    placement="right-start"
                  >
                    <div slot="content">
                      当日未完成的外呼任务
                      <br />可以在次日的非骚扰时
                      <br />段继续拨打
                    </div>
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="submitForm('taskConfigForm')">保存</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
          <el-tab-pane label="重呼策略" name="second">
            <div class="auto-recall">
              <span>自动重呼&nbsp;</span>
              <el-radio-group v-model="autoRecallSwitch">
                <el-radio :label="0">关闭</el-radio>
                <el-radio :label="1">开启</el-radio>
              </el-radio-group>
              <div class="enable-auto-recall" v-if="autoRecallSwitch">
                <div class="recall-interval">
                  <span style="margin-right: 10px">重呼间隔</span>
                  <el-input-number v-model="repeatIntervalHour" controls-position="right"></el-input-number>&nbsp;时&nbsp;
                  <el-input-number v-model="repeatIntervalMinute" controls-position="right"></el-input-number>&nbsp;分
                  <el-tooltip
                    class="item"
                    effect="light"
                    popper-class="speech-tip"
                    placement="right-start"
                  >
                    <div slot="content">
                      重呼间隔指首个任务拨打完成后，间隔
                      <br />多久自动创建下一个
                    </div>
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-card class="box-card" v-for="(card, idx) in cards" :key="idx">
                  <div slot="header" class="clearfix">
                    <span>重呼策略{{idx + 1}}</span>
                  </div>
                  <div class="card-row">
                    <div class="card-sub-title">触发条件</div>
                    <div class="card-row-content">
                      <el-select
                        v-model="card.triggerConditions"
                        multiple
                        filterable
                        allow-create
                        default-first-option
                        size="medium"
                        @visible-change="getTriggerConditions"
                      >
                        <el-option-group
                          v-for="group in triggerConditionsList"
                          :key="group.label"
                          :label="group.label"
                        >
                          <el-option
                            v-for="(item, index) in group.options"
                            :key="item.value + index"
                            :label="item.label"
                            :value="item.value"
                          ></el-option>
                        </el-option-group>
                      </el-select>
                    </div>
                  </div>
                  <SplitLine />
                  <div class="card-body">
                    <el-tabs tab-position="left" @tab-click="handleTabs(idx, $event)">
                      <el-tab-pane label="有效号码">
                        <ElCheckBoxGroup v-model="card.phoneSelect.valid">
                          <ElCheckBox
                            v-for="(partOfstatus, name) in validAllPhoneStatus"
                            :key="partOfstatus"
                            :label="partOfstatus"
                            :border="name === card.forceItem.valid"
                            :class="name === card.forceItem.valid ? 'is-force': ''"
                          >
                            <a
                              class="checkbox-label"
                              href="javascript: void(0)"
                              @click="switchPhoneStatus(idx, name, 'valid')"
                            >{{partOfstatus}}</a>
                          </ElCheckBox>
                        </ElCheckBoxGroup>
                      </el-tab-pane>
                      <el-tab-pane label="无效号码">
                        <ElCheckBoxGroup v-model="card.phoneSelect.invalid">
                          <ElCheckBox
                            v-for="(partOfstatus, name) in invalidAllPhoneStatus"
                            :key="partOfstatus"
                            :label="partOfstatus"
                            :border="name === card.forceItem.invalid"
                            :class="name === card.forceItem.invalid ? 'is-force': ''"
                          >
                            <a
                              class="checkbox-label"
                              href="javascript: void(0)"
                              @click="switchPhoneStatus(idx, name, 'invalid')"
                            >{{partOfstatus}}</a>
                          </ElCheckBox>
                        </ElCheckBoxGroup>
                      </el-tab-pane>
                    </el-tabs>
                    <div class="new-recall">
                      <el-button icon="el-icon-circle-plus" @click="newRecall(idx)"></el-button>&nbsp;&nbsp;
                      <span style="color: #4E8FF9">新增重呼</span>
                      <div
                        class="recall-item"
                        v-for="(item, index) in card.newRecallCount[card.validOrInvalidPhone][card.phoneStatusFlag]"
                        :key="index"
                      >
                        <div class="recall-item-title item-part">重呼第{{index + 1}}次</div>
                        <div class="recall-item-select item-part">
                          <el-select
                            v-model="item.type"
                            placeholder="选择重呼话术"
                            @visible-change="getTriggerConditions"
                          >
                            <el-option-group
                              v-for="group in triggerConditionsList"
                              :key="group.label"
                              :label="group.label"
                            >
                              <el-option
                                v-for="(item, index) in group.options"
                                :key="item.value + index"
                                :label="item.label"
                                :value="item.value"
                              ></el-option>
                            </el-option-group>
                          </el-select>
                        </div>
                        <el-button icon="el-icon-error" @click="deleleAutoRecallItem(index)"></el-button>
                      </div>
                    </div>
                  </div>
                </el-card>
                <span @click="addStrategy">
                  <i class="iconfont icon-ico_add"></i>
                  <a class="add">新增策略</a>
                </span>
              </div>
              <el-button type="primary" class="auto-recall-save" @click="autoRecallSave">保存</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
        <!-- <div slot="header" class="clearfix">
                    <span>外呼设置</span>
        </div>-->
      </el-card>
    </div>
  </div>
</template>

<script>
import SplitLine from '../../common/Line';
import ElCheckBox from '../../components/Checkbox';
import ElCheckBoxGroup from '../../components/CheckboxGroup';
import { debug } from 'util';

const weekOptions = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const weekMap1 = new Map();
const weekMap2 = new Map();
for (var i = 0; i < weekOptions.length; i++) {
  weekMap1.set(i + 1, weekOptions[i]);
  weekMap2.set(weekOptions[i], i + 1);
}

const mapValidPhoneStatus = {
  '1': 'A',
  '2': 'B',
  '3': 'C',
  '4': 'D',
  '5': 'E',
  '6': 'F',
  '7': '无',
};

const mapInvalidPhoneStatus = {
  '2': '关机',
  '12': '停机',
  '5': '拒接',
  '4': '无应答',
  '13': '线路故障',
  '6': '空号',
  '7': '呼叫转移',
  '8': '呼叫失败',
};

const mapValidPhoneValueMapping = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  o: 7,
};

const mapInvalidPhoneValueMapping = {
  关机: 2,
  停机: 12,
  拒接: 5,
  无应答: 4,
  线路故障: 13,
  空号: 6,
  呼叫转移: 7,
  呼叫失败: 8,
};

export default {
  components: { SplitLine, ElCheckBoxGroup, ElCheckBox },
  data() {
    var validateWeeks = (rule, value, callback) => {
      if (this.checkedWeeks.length == 0) {
        callback(new Error('请至少选择一个外呼周期！'));
      } else {
        callback();
      }
    };
    return {
      startTimeDay: '12:00',
      endTimeDay: '13:00',
      startTimeNight: '21:00',
      endTimeNight: '08:00',

      checkAll: true,
      checkedWeeks: weekOptions,
      isIndeterminate: false,

      options: [
        {
          value: '0',
          label: '终止任务',
        },
        {
          value: '1',
          label: '继续外呼',
        },
      ],
      v: {
        value: '1',
        label: '继续外呼',
      },
      weekOptions: weekOptions,
      taskConfigForm: {
        id: '',
        weeks: '',
        preventDisturbTimeDay: '',
        preventDisturbTimeNight: '',
        repeatTimes: '',
        continueStrategy: '',
      },
      rules: {
        checkWeeks: [{ validator: validateWeeks }],
      },
      triggerConditionsList: [],
      invalidAllPhoneStatus: JSON.parse(JSON.stringify(mapInvalidPhoneStatus)),
      validAllPhoneStatus: JSON.parse(JSON.stringify(mapValidPhoneStatus)),
      reCallTypeResult: '',
      autoRecallSwitch: 1,
      repeatIntervalHour: 0,
      repeatIntervalMinute: 0,
      cards: [
        {
          strategyName: '重呼策略',
          validOrInvalidPhone: 'validPhone',
          phoneStatusFlag: '1',
          triggerConditions: [],
          phoneSelect: {
            valid: [],
            invalid: [],
          },
          forceItem: {
            valid: '1',
            invalid: '2',
          },
          newRecallCount: {
            validPhone: Object.keys(mapValidPhoneStatus).reduce((previous, currnet) => {
              previous[currnet] = [];
              return previous;
            }, {}),
            invalidPhone: Object.keys(mapInvalidPhoneStatus).reduce((previous, currnet) => {
              previous[currnet] = [];
              return previous;
            }, {}),
          },
        },
      ],
    };
  },

  async created() {
    await this.getTriggerConditions();
    $.get(this.$baseUrl + 'task/queryTaskConfig.json').then(res => {
      if (res.resultMessageEnum == '0000') {
        if (res.returnObject) {
          const data = res.returnObject;
          this.taskConfigForm.id = res.returnObject.id;

          this.autoRecallSwitch = data.autoRecallSwitch;
          this.repeatIntervalHour = data.repeatIntervalHour;
          this.repeatIntervalMinute = data.repeatIntervalMinute;

          this.cards = [];
          const cardsArr = [];
          data.recallStrategies.forEach(strategy => {
            const obj = {
              strategyName: strategy.strategyName,
              triggerConditions: strategy.triggerConditions,
              // todo 变量替换
              phoneSelect: {
                valid: strategy.recallItems
                  .map(v => v.connectedResult)
                  .filter(v => Object.keys(mapValidPhoneStatus).includes(v.connectedResult)),
                invalid: strategy.recallItems
                  .map(v => v.connectedResult)
                  .filter(v => Object.keys(mapInvalidPhoneStatus).includes(v.connectedResult)),
              },
              newRecallCount: {
                validPhone: strategy.reduce((acc, curr) => {
                  if (Object.keys(mapValidPhoneStatus).includes(curr.connectedResult)) {
                    acc[connectedResult] = curr.speechcraftIds;
                  }
                  return acc;
                }, {}),
                validPhone: strategy.reduce((acc, curr) => {
                  if (Object.keys(mapInvalidPhoneStatus).includes(curr.connectedResult)) {
                    acc[connectedResult] = curr.speechcraftIds;
                  }
                  return acc;
                }, {}),

                // {
                //   [v.connectedResult]: [speechcraftIds]
                // }
              },
            };
          });

          if (res.returnObject.weeks) {
            let checkedWeeks = [];
            let weeksArr = res.returnObject.weeks.split(',');
            for (var i = 0; i < weeksArr.length; i++) {
              checkedWeeks.push(weekMap1.get(parseInt(weeksArr[i])));
            }
            this.checkedWeeks = checkedWeeks;
            this.handleCheckedWeeksChange(checkedWeeks);
          } else {
            this.checkedWeeks = [];
          }
          if (res.returnObject.preventDisturbTimeDay) {
            let timeArr = res.returnObject.preventDisturbTimeDay.split('-');
            this.startTimeDay = timeArr[0];
            this.endTimeDay = timeArr[1];
          } else {
            this.startTimeDay = null;
            this.endTimeDay = null;
          }
          if (res.returnObject.preventDisturbTimeNight) {
            let timeArr = res.returnObject.preventDisturbTimeNight.split('-');
            this.startTimeNight = timeArr[0];
            this.endTimeNight = timeArr[1];
          } else {
            this.startTimeNight = null;
            this.endTimeNight = null;
          }
          this.taskConfigForm.repeatTimes = res.returnObject.repeatTimes;
          //	this.taskConfigForm.repeatIntervalHour = res.returnObject.repeatIntervalHour;
          //	this.taskConfigForm.repeatIntervalMinute = res.returnObject.repeatIntervalMinute;
          if (res.returnObject.continueStrategy == 0) {
            this.v = { value: '0', label: '终止任务' };
          } else if (res.returnObject.continueStrategy == 1) {
            this.v = { value: '1', label: '继续外呼' };
          }
        } else {
          console.log(res.returnObject);
        }
      } else {
        resolve(res.errorInfoList[0].errorMessage);
        // this.$message.error(res.errorInfoList[0].errorMessage);
      }
    });
  },
  methods: {
    /**
     * 添加策略
     */
    addStrategy(e) {
      e.preventDefault();
      this.cards.push({
        strategyName: '重呼策略',
        validOrInvalidPhone: 'validPhone',
        phoneStatusFlag: '1',
        triggerConditions: [],
        phoneSelect: {
          valid: [],
          invalid: [],
        },
        forceItem: {
          valid: '1',
          invalid: '2',
        },
        newRecallCount: {
          validPhone: Object.keys(mapValidPhoneStatus).reduce((previous, currnet) => {
            previous[currnet] = [];
            return previous;
          }, {}),
          invalidPhone: Object.keys(mapInvalidPhoneStatus).reduce((previous, currnet) => {
            previous[currnet] = [];
            return previous;
          }, {}),
        },
      });
    },
    deleleAutoRecallItem(index) {
      this.newRecallCount[this.validOrInvalidPhone][this.phoneStatusFlag].splice(index, 1);
    },
    autoRecallSave() {
      let req = {
        id: this.taskConfigForm.id,
        recallStrategies: [],
        repeatIntervalHour: this.repeatIntervalHour,
        repeatIntervalMinute: this.repeatIntervalMinute,
        autoRecallSwitch: this.autoRecallSwitch,
      };
      const mapValidPhoneStatusKeys = Object.keys(mapValidPhoneStatus);
      const mapValidPhoneStatusValues = Object.values(mapValidPhoneStatus);

      const constmapInvalidPhoneStatusKeys = Object.keys(mapInvalidPhoneStatus);
      const mapInvalidPhoneStatusValues = Object.values(mapInvalidPhoneStatus);

      req.recallStrategies = this.cards.map((item, index) => {
        return {
          strategyName: item.strategyName + (index + 1),
          triggerConditions: item.triggerConditions.join(','),
          recallItems: [
            ...item.phoneSelect.valid.map(phoneStatus => {
              const numberStatus =
                mapValidPhoneStatusKeys[mapValidPhoneStatusValues.indexOf(phoneStatus)];
              console.log(numberStatus);
              console.log(item.newRecallCount.validPhone);
              return {
                connectedResult: numberStatus,
                speechcraftIds: item.newRecallCount.validPhone[numberStatus]
                  .map(v => v.type)
                  .join(','),
              };
            }),
            ...item.phoneSelect.invalid.map(phoneStatus => {
              const numberStatus =
                mapInvalidPhoneStatusKeys[mapInvalidPhoneStatusValues.indexOf(phoneStatus)];
              return {
                intentionLevel: numberStatus,
                speechcraftIds: item.newRecallCount.invalidPhone[numberStatus]
                  .map(v => v.type)
                  .join(','),
              };
            }),
          ],
        };
      });
      // req.recallStrategies.push({
      //   strategyName: this.strategyName,
      //   triggerConditions: this.triggerConditions.join(','),
      //   recallItems: selectResult,
      // });
      $.post(this.$baseUrl + 'task/saveOrUpdateTaskConfig.json', JSON.stringify(req), res => {
        if (res.resultMessageEnum == '0000') {
          this.$message.info('success!');
        } else {
          this.$message.error(res.errorInfoList[0].errorMessage);
        }
      });
    },
    handleTabs(idx, tab) {
      if (tab.index === '0') {
        this.cards[idx].validOrInvalidPhone = 'validPhone';
        this.cards[idx].phoneStatusFlag = '1';
      } else if (tab.index === '1') {
        this.cards[idx].validOrInvalidPhone = 'invalidPhone';
        this.cards[idx].phoneStatusFlag = '2';
      }
    },
    switchPhoneStatus(idx, status, isValid) {
      this.cards[idx].phoneStatusFlag = status;
      if (isValid === 'valid') {
        this.cards[idx].forceItem.valid = status;
      } else {
        this.cards[idx].forceItem.invalid = status;
      }
    },
    getTriggerConditions() {
      if (this.triggerConditionsList.length === 0) {
        return new Promise((resolve, reject) => {
          $.post(
            this.$baseUrl + 'speechcraft/querySpeechcraftList.json',
            JSON.stringify({
              templateType: 2,
              pageSize: 100,
              currentPage: 0,
            }),
            res => {
              if (res.resultMessageEnum == '0000') {
                let recordIndex = new Map();
                this.triggerConditionsList = res.returnObject.recordList.reduce(
                  (previous, current) => {
                    if (recordIndex.get(current.industryName) !== undefined) {
                      previous[recordIndex.get(current.industryName)].options.push({
                        value: current.id,
                        label: current.speechcraftName,
                      });
                    } else {
                      previous.push({
                        label: current.industryName,
                        options: [
                          {
                            value: current.id,
                            label: current.speechcraftName,
                          },
                        ],
                      });
                      recordIndex.set(current.industryName, previous.length - 1);
                    }
                    return previous;
                  },
                  [],
                );
                resolve();
              } else {
                this.$message.error(res.errorInfoList[0].errorMessage);
                reject();
              }
            },
          );
        });
      }
    },
    newRecall(idx) {
      const card = this.cards[idx];
      this.cards[idx].newRecallCount[card.validOrInvalidPhone][card.phoneStatusFlag].push({
        type: '',
      });
    },
    showSuccessMessage() {
      this.$message({
        message: '操作成功！',
        type: 'success',
      });
    },

    handleCheckAllChange(val) {
      this.checkedWeeks = val ? weekOptions : [];
      this.isIndeterminate = false;
    },
    handleCheckedWeeksChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.weekOptions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.weekOptions.length;
    },
    handleChange(value) {
      console.log(value);
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let weeks = [];
          for (var i = 0; i < this.checkedWeeks.length; i++) {
            weeks.push(weekMap2.get(this.checkedWeeks[i]));
          }
          this.taskConfigForm.weeks = weeks.join(',');
          this.taskConfigForm.preventDisturbTimeDay = this.startTimeDay + '-' + this.endTimeDay;
          this.taskConfigForm.preventDisturbTimeNight =
            this.startTimeNight + '-' + this.endTimeNight;
          this.taskConfigForm.continueStrategy = this.v.value;
          var json = JSON.stringify(this.taskConfigForm);
          console.log(json);
          $.post(this.$baseUrl + 'task/saveOrUpdateTaskConfig.json', json).then(res => {
            if (res.resultMessageEnum == '0000') {
              this.taskConfigForm.id = res.returnObject;
              this.$message.success('保存成功');
            } else {
              this.$message.error(res.errorInfoList[0].errorMessage);
            }
          });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
  },
};
</script>
<style scoped lang="less">
.pay-btn {
  float: right;
  margin: 40px 40px 0 0;
}
.recharge-from-box {
  position: relative;
  min-height: 600px;
  .time {
    margin-right: 20px;
  }
}
.service－box {
  position: absolute;
  right: 40px;
  top: 10px;
}
.blue {
  color: #4e8ff9;
}
.weixin-pay-box {
  text-align: center;
}
.weixinQrcode {
  width: 200px;
  height: 200px;
}
.paystatus {
  color: #4e8ff9;
  font-size: 20px;
}
.auto-recall {
  padding: 30px;
  .enable-auto-recall {
    margin-left: 60px;
  }
}
.recall-interval {
  margin-top: 30px;
}
.box-card {
  margin-top: 30px;
  .card-row {
    display: flex;
    align-items: center;
    .card-sub-title {
      margin-right: 30px;
    }
    .card-row-content {
      flex-grow: 1;
    }
  }
}
.auto-recall-save {
  margin: 30px 0 0 60px;
}
</style>

<style lang="less">
.auto-recall {
  .box-card {
    .el-card__header {
      background: #f3f4f6;
    }
    .el-card__body {
      padding-left: 30px;
      .el-select {
        display: block;
      }
    }
    .card-body {
      display: flex;
      .el-tab-pane {
        display: inline-block;
        max-width: 120px;
        border-right: 2px solid #e4e7ed;
        .el-checkbox {
          margin-top: 10px;
        }
      }
      .new-recall {
        margin-left: 30px;
        flex-grow: 1;
        .recall-item {
          margin-left: 57px;
          display: flex;
          align-items: center;
          margin-top: 20px;
          justify-content: space-between;
          .recall-item-select {
            flex-grow: 1;
          }
          .item-part {
            padding-right: 10px;
          }
        }
      }
      .el-checkbox {
        border: 1px solid #e3e3e3;
        box-sizing: border-box;
        line-height: normal;
        padding: 5px 15px 5px 10px;
        border-radius: 3px;
        height: 32px;
        width: 100px;
        .checkbox-label {
          cursor: pointer;
        }
      }
      .el-checkbox.is-bordered {
        border: 1px solid #409eff;
        background: #dde1e6;
      }
      .el-checkbox-wrapper {
        border: 1px solid #e3e3e3;
        box-sizing: border-box;
        line-height: normal;
        padding: 5px 15px 5px 10px;
        border-radius: 3px;
        height: 32px;
        width: 100px;
        margin-top: 5px;
      }
      .is-force {
        border: 1px solid #409eff;
        background: #dde1e6;
      }
    }
  }
  .icon-ico_add {
    font-size: 16px;
    color: #4e8ff9;
    cursor: pointer;
  }
  .add {
    color: #4e8ff9;
    cursor: pointer;
  }
}
</style>