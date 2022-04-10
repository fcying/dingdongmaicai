var testFlag = 0
var timeout = 10
var runFlag = 0
setScreenMetrics(1080,2400)

device.keepScreenDim()
device.setMusicVolume(device.getMusicVolume())

function test() {
	end()
}

function end() {
	device.cancelKeepingAwake()
	toast('抢菜结束')
	var oldVolume = device.getMusicVolume()
	var volume = 50
	var ringtone = android.media.RingtoneManager.TYPE_NOTIFICATION 
	var mp = new android.media.MediaPlayer(); 
	device.setMusicVolume(volume) 
	mp.setDataSource(context, android.media.RingtoneManager.getDefaultUri(ringtone)); 
	mp.prepare(); 
	mp.start();
	device.vibrate(3000);
	device.setMusicVolume(oldVolume)
	exit()
}

function pay() {
	var pay = textStartsWith('立即支付').findOne(timeout)
	if (pay) {
		pay.click()
		end()
	}
}

function checkTime(item) {
	return item.clickable() == true
}

function selectTime(x, y) {
	if (y != -1) {
		click(x,y)
		sleep(10)
		pay()
	} else {
		var select_array = textEndsWith(x).find()
		if (!select_array.empty()) {
			var select = select_array.filter(checkTime)
			if (select.length > 0) {
				select[0].parent().click()
				sleep(10)
				pay()
			}		
		}
	}
}

function shopping_cart() {
	var btn = null
	while(1) {
		click("购物车")
		sleep(50)
		click("去结算")
		sleep(50)

		//关闭用食在卡抵扣
		if (id('sw_pay_left').exists()) {
			btn = id('sw_pay_left').findOne(timeout)
			if (btn) {
				if (btn.checked() == true) {
					btn.click()
					sleep(50)
				}
			}
		}

		btn = textStartsWith('立即支付').findOne(timeout)
		if (btn)
		{
			btn.click()
			sleep(50)
			btn = textStartsWith('重新加载').findOne(timeout)
			if (btn) {
				btn.click()
				continue
			} 
			sleep(50)
			if (textStartsWith('选择送达时间').findOne(timeout)) {
				if (0) {
					selectTime(550,1200)
					selectTime(550,1330)
					selectTime(550,1460)
					selectTime(550,1600)
				} else {
					selectTime(':30', -1)
					sleep(50)
				}
				back()
			} else {
				sleep(100)
				if (!textStartsWith('立即支付').exists())
				{
					end()
				}
			}
		}
	}
}

function main() {	
	if (testFlag) {
		test()
	} else {
		launchApp('叮咚买菜')
		sleep(1000)
		shopping_cart()
	}
}

if (!$floaty.checkPermission()) {
    // 没有悬浮窗权限，提示用户并跳转请求
    toast("本脚本需要悬浮窗权限来显示悬浮窗，请在随后的界面中允许并重新运行本脚本。");
    $floaty.requestPermission();
    exit();
}
auto.waitFor();

var w = floaty.rawWindow(
		<horizontal id='control'>
			<button text="运行" id='run'/>
			<button text="停止" id='stop'/>
		</horizontal>
)

w.setTouchable(true)
w.exitOnClose()
wx = 100
wy = 100
w.setPosition(wx,wy)
moveFlag = 0
deltax = 0
deltay = 0

w.run.setOnTouchListener(function(view, event) {
	switch (event.getAction()) {
		case event.ACTION_DOWN:
			x = event.getRawX();
			y = event.getRawY();
			break;
		case event.ACTION_UP:
			wx += deltax;
			wy += deltay;
			if (moveFlag == 0) {
				if (runFlag == 0) {
					toast('开始抢菜')
					runFlag = 1
					threads.start(main)
				}
			}
			moveFlag = 0
			deltax = 0
			deltay = 0
			break
		case event.ACTION_MOVE:
			deltax = event.getRawX() - x
			deltay = event.getRawY() - y
			if (deltax > 20 || deltay > 20)
			{
				moveFlag = 1
				w.setPosition(wx+deltax,wy+deltay)
			}
			break
		default:
			console.log("unknown event", event.getAction())
			break
	}
	return true;
})

w.stop.setOnTouchListener(function(view, event) {
	switch (event.getAction()) {
		case event.ACTION_DOWN:
			device.cancelKeepingAwake()
			w.close()
			break
	}
	return true;
})

setInterval(()=>{}, 1000)



