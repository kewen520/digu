<template>
    <div class="help-box">
        <p class="h1">变量参数内容规范</p>
        <p class="tit">什么是变量参数？</p>
        <p>变量参数表示实际外呼时，用户希望自定义变化的内容，固定格式如：[userName]、[date]等，中间内容应代表变量属性；用户在我的话术库-编辑-任意节点话术编辑器，可填写固定文本和[变量参数]。云知声也提供常用话术句式，使用话术内容库，不做任何修改，可以极大提高审核效率及成功率。例如：</p>
        <ul class="list">
            <li>[userName][sex]，您好这里是[bankName]；</li>
            <li>[userName][sex]，您好。您尾号[cardName]信用卡[month]人民币应还款额[money]，请于10月22日前还款。</li>
        </ul>
        <p>话术库发布后，用户可下载对应变量Excel模版。填写相应外呼数据的具体内容。</p>
        <p class="h1">推荐变量参数模版</p>
        <p>允许自定义[变量参数]，以下为推荐模版，使用推荐变量参数有相应播报优化：</p>
        <table cellspacing="0" cellpadding="0" border="0" class="el-table__header table" style="width:100%;">
            <thead class="">
                <tr class="">
                    <th colspan="1" rowspan="1" width="300">
                        变量参数<span class="red">（第二个单词首字母需大写）</span>
                    </th>
                    <th colspan="1" rowspan="1" width="200">
                        播报效果
                    </th>
                    <th colspan="1" rowspan="1">
                        备注
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>[userName]</td>
                    <td>单(shan4)田芳先生</td>
                    <td>完整姓名，可正确播报姓名中的多音字姓氏</td>
                </tr>
                <tr>
                    <td>[bankName]</td>
                    <td>民生银行</td>
                    <td>银行名称</td>
                </tr>
                <tr>
                    <td>[phoneNumber]</td>
                    <td>幺幺零</td>
                    <td>电话号码，使数字串按照电话号码的方式发音(“1”读作“幺”) </td>
                </tr>
                <tr>
                    <td>[money]</td>
                    <td>一百一十元</td>
                    <td>具体金额，使数字串按照具体数值的方式发音</td>
                </tr>
                <tr>
                    <td> [date]</td>
                    <td>二十五天 2018年9月29日</td>
                    <td>天数、日期</td>
                </tr>
                <tr>
                    <td>[year]</td>
                    <td>二零一八年</td>
                    <td>年份</td>
                </tr>
                <tr>
                    <td>[month]</td>
                    <td>十二月</td>
                    <td>月份</td>
                </tr>
                <tr>
                    <td>[cardNumber]</td>
                    <td>4412</td>
                    <td>银行卡号，使数字串按照电话号码的方式发音(“1”读作“幺”)</td>
                </tr>
                <tr>
                    <td>[lastDate]</td>
                    <td>今晚8点</td>
                    <td>最后还款日期</td>
                </tr>
                <tr>
                    <td>[miniAmount]</td>
                    <td>5000元</td>
                    <td>最低还款金额：五千元，使数字串按照具体数值的方式发音</td>
                </tr>
                <tr>
                    <td>[bankPhone]</td>
                    <td>400 66 95568</td>
                    <td>银行电话</td>
                </tr>
            </tbody>
        </table>
        <p class="tit">格式说明：</p>
        <p>[]内变量命名规则：支持自定义，支持中英文和符号，且一个模板允许出现相同的变量名称，例如：您好，[userName]，这边是想针对[userName] 您之前购买的产品做一个回访。</p>
        <p class="h1">如有问题，请联系各地区商务顾问：</p>
        <div class="foot">
            朱先生(上海) 180-1600-8757<br>
            邮   箱 zhuhongze@unisound.com<br>
            陶先生(上海）159-2158-8008<br>
            邮   箱 taojiaxiong@unisound.com<br>
            曾先生(深圳）135-7082-2035<br>
            邮   箱 zengyuteng@unisound.com<br>
            黄女士(厦门) 189-0592-1230<br>
            邮   箱 huangwei_vivian@unisound.com<br>
            孙先生(北京) 135-2080-9275<br>
            邮   箱 sunzhao@unisound.com
        </div>
        <!-- <el-table :data="tableData" style="width: 100%">
            <el-table-column
                prop="a1"
                label="变量参数<span>（第二个单词首字母需）</span>"
                width="180">
            </el-table-column>
            <el-table-column
                prop="a2"
                label="播报效果"
                width="180">
            </el-table-column>
            <el-table-column
                prop="a3"
                label="备注"
                width="180">
            </el-table-column>
        </el-table> -->
    </div>
</template>

<script>

    export default {
        name: 'basetable',
        data() {
            return {
                tableData:[{
                    a1:'[userName]',
                    a2:'单(shan4)田芳先生',
                    a3:'完整姓名，可正确播报姓名中的多音字姓氏'
                }]
            }
        },

        created() {
            
        },
        computed: {
        },
        methods: {
            open(){
                var doc=new ActiveXObject("Word.Application"); 
                doc.visible=true; 
                doc.Documents.Open('../../../static/帮助界面-变量参数内容规范-1130.docx'); 
            }
        },
        destroyed(){
            
        }
    }

</script>

<style scoped lang="less">
    .help-box{
        background-color: #fff;
        padding:0px 80px 40px;
        line-height: 1.8;
        .h1{
            font-size: 24px;
            font-weight: bold;
            margin-bottom:20px;
            padding-top:40px;
        }
        .tit{
            font-size: 14px;
            font-weight: bold;
            padding-bottom: 10px;
        }
        .list{
            padding:10px 0 10px 18px;

        }
        .table{
            margin: 20px 0;
            border: 1px solid #ebeef5;
            th{
                text-align: left;
                padding: 10px 10px 10px;
                border-right:1px solid #ebeef5;
                border-bottom: 1px solid #ebeef5;
            }
            td{
                padding:8px 10px;
                border-right:1px solid #ebeef5;
                border-bottom: 1px solid #ebeef5;
            }
        }
        .red{
            color:#F56C6C;
        }
        .foot{
            line-height: 2.4;
        }
    }
</style>
