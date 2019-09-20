
var date=new Date();
var year=date.getFullYear();
var month=date.getMonth()+1>9?date.getMonth()+1:'0'+(date.getMonth()+1);
var day=date.getDate()>9?date.getDate():'0'+date.getDate();
var nowdatestr=year+"-"+month+"-"+day;

export default {
    sevenday(param){
        var oneweekdate=new Date(date-param*24*3600*1000);
        var year1=oneweekdate.getFullYear();
        var month1=oneweekdate.getMonth()+1>9?oneweekdate.getMonth()+1:'0'+(oneweekdate.getMonth()+1);
        var day1=oneweekdate.getDate()>9?oneweekdate.getDate():'0'+oneweekdate.getDate();

        return year1+"-"+month1+"-"+day1;
    },
    today(){
        return `${year}-${month}-${day}`;
    },
    onemonth(){
        return getPreMonthDay(nowdatestr,1);
    },
    format(date){
        var oneweekdate=new Date(date);
        var year1=oneweekdate.getFullYear();
        var month1=oneweekdate.getMonth()+1>9?oneweekdate.getMonth()+1:'0'+(oneweekdate.getMonth()+1);
        var day1=oneweekdate.getDate()>9?oneweekdate.getDate():'0'+oneweekdate.getDate();

        return year1+"-"+month1+"-"+day1;
    }
};
//获取当前日期前N个月的日期
function getPreMonthDay(date,monthNum){
    var dateArr = date.split('-');
    var year = dateArr[0]; //获取当前日期的年份
    var month = dateArr[1]; //获取当前日期的月份
    var day = dateArr[2]; //获取当前日期的日
    var days = new Date(year, month, 0);
    days = days.getDate(); //获取当前日期中月的天数
    var year2 = year;
    var month2 = parseInt(month) - monthNum;
    if (month2 <=0) {
        year2 = parseInt(year2) - parseInt(month2 / 12 == 0 ? 1 : parseInt(month2) / 12);
        month2 = 12 - (Math.abs(month2) % 12);
    }
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
        day2 = days2;
    }
    if (month2 < 10) {
        month2 = '0' + month2;
    }
    var t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
}