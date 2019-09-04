
const type = global.process.argv[2]||'on'

const fs = require('fs')

const fn = `./data/${formatTime('month')}.json`


function formatTime(key){
	let tm = new Date()
	let data = {
		year:tm.getFullYear(),
		month:tm.getMonth()+1+'',
		day:tm.getDate()+'',
		time:`${(''+tm.getHours()).padStart(2,'0')}:${(''+tm.getMinutes()).padStart(2,'0')}:${(''+tm.getSeconds()).padStart(2,'0')}`,
		stamp:tm.getTime()
	}
	return data[key]
}

function onWork(){

	fs.readFile(fn,(err,data)=>{

		let json = {}
		let day = formatTime('day')

		let _data = {
				on:formatTime('stamp')-5*60*1000,
				off:0,
				onTime:formatTime('time'),
				offTime:'',
				total:0
			}

		if(err){
			json = {
				[formatTime('day')]:_data
			}
		}else{
			json = data.toString()?JSON.parse(data.toString()):{}
			if(!json[formatTime('day')]){
				json[formatTime('day')] = _data
			}
		}

		fs.writeFile(fn,JSON.stringify(json),err=>{
			if(err){
				console.log('写入上班时间出错',err)
			}

			cacl(json,day)

			console.log('今天上班时间是：',_data.onTime)

			console.log('写入上班时间成功!')
		})
	})
}

function offWork(){

	fs.readFile(fn,(err,data)=>{

		const json = data.toString()?JSON.parse(data.toString()):{}
		
		let _day,day = formatTime('day')

		if(json[day-1+'']&&json[day-1+''].off===0){ // 前一天数据存在
			_day=day-1+'' // 通宵情况
		}else{
			_day=day
		}	

		json[_day].off = formatTime('stamp')+5*60*1000
		json[_day].offTime = formatTime('time')
		json[_day].total = json[_day].off - json[_day].on

		fs.writeFile(fn,JSON.stringify(json),err=>{
			if(err){
				console.log('下班时间记录错误',err)
			}
			console.log('今天下班时间是：',json[_day].offTime)
			cacl(json,_day)
			console.log('下班时间记录完成!')
		})
	})
}

function stampToTime(st){
	let _st = st-0
	return (_st/(1000*60*60)).toFixed(2)
}
/**
 * [cacl description]
 * @param  {[object]} json [data]
 * @param  {[string]} day  [日期 ]
 * @param  {[string]} type [上下类型]
 * @return {[type]}      
 */
function cacl(json,day){

	let allVal = Object.values(json)
	// 计算目前截至平均工时
	let count = 0,len = allVal.length,_nowAvg;

	for(let  it of allVal){
		count+=it.total
	}

	if(type === "on"){
		if(len == 1){
			console.log("---- 本月第一次上班 ----")
			return;

		}else{
			let _preTime = stampToTime((json[(day-1)+'']||{}).total)
			let avg = Math.floor(count/(len-1))
			_nowAvg = stampToTime(avg)
			console.log('上个工作日工时(h)：',_preTime)
		}
	}else if(type==="off"){
		let avg = (count/(len)).toFixed(2)
		_nowAvg = stampToTime(avg)
		console.log(`相当于每天 ${9+Math.floor(_nowAvg)}:${ (''+Math.floor((_nowAvg-Math.floor(_nowAvg))*60)).padStart(2,"0") } 下班`)
		console.log('目前每日平均工时(h)：',_nowAvg)
	}
}


if(type === 'on'){
	onWork()
}else{
	offWork()
}
