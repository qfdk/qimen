var WanNianLi = (function() {
	//天干序数：1（甲），2（乙），……
	var __TianGan = ['', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
		//地支序数：1（寅），2（卯），……
		__NianZhi = ['', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'],
		//月的地支序数：寅月为正月，……
		__YueZhi = ['', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'],
		__WuXing = {
			'甲': '木',
			'乙': '木',
			'丙': '火',
			'丁': '火',
			'戊': '土',
			'己': '土',
			'庚': '金',
			'辛': '金',
			'壬': '水',
			'癸': '水',
			'寅': '木',
			'卯': '木',
			'辰': '土',
			'巳': '火',
			'午': '火',
			'未': '土',
			'申': '金',
			'酉': '金',
			'戌': '土',
			'亥': '水',
			'子': '水',
			'丑': '土'
		},
		__JiaZi = [undefined,
			'甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉', '甲戌', '乙亥',
			'丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未', '甲申', '乙酉', '丙戌', '丁亥',
			'戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳', '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥',
			'庚子', '辛丑', '壬寅', '癸卯', '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥',
			'壬子', '癸丑', '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
		],
		//时干支
		__ShiGanZhi = {
			'-1': '子',
			'0': '丑',
			'1': '寅',
			'2': '卯',
			'3': '辰',
			'4': '巳',
			'5': '午',
			'6': '未',
			'7': '申',
			'8': '酉',
			'9': '戌',
			'10': '亥',
			'11': '子'
		};
	/**
	 * 计算两个日期之间的天数
	 * @param {Object} date1
	 * @param {Object} date2
	 */
	function daysBetweenDate(date1, date2) {
		return parseInt((date2.getTime() - date1.getTime()) / 1000 / 60 / 60 / 24);
	}

	/**
	 * 判断是否闰年
	 * @param {Object} year
	 */
	function isRunnian(year) {
		year = Number(year);
		if (year % 100 === 0) {
			return year % 400 === 0;
		} else {
			return year % 4 === 0;
		}
	}
	/**
	 * 获取月份基数
	 * | 月份	| 1 | 2  | 3  | 4  | 5 | 6  | 7 | 8  | 9 | 10 | 11 | 12 |
	 * | 月基数	| 0 | 31 | -1 | 30 | 0 | 31 | 1 | 32 | 3 | 33 | 4  | 34 |
	 * @param {Object} month
	 */
	function getMonthBase(month) {
		month = Number(month);
		var base = [undefined, 0, 31, -1, 30, 0, 31, 1, 32, 3, 33, 4, 34];
		return base[month];
	}
	/**
	 * 获取指定年份所属的世纪
	 * @param {Object} year
	 */
	function getCenturyByYear(year) {
		year = Number(year);
		if (year % 100 === 0) {
			return year / 100;
		}
		return parseInt(year / 100) + 1;
	}
	/**
	 * 根据世纪，计算该世纪常数。公式：X = 44*(C-17) + (C-17)/4 + 3。C：世纪，X：世纪常数
	 * @param {Object} century
	 */
	function getCenturyConst(century) {
		century = Number(century);
		return (44 * (century - 17) + parseInt((century - 17) / 4) + 3) % 60;
	}
	/**
	 * 根据高氏日柱公式，获取指定日期的天干地支。
	 * 公式：r = s/4*6 + 5*(s/4*3+u)+m+d+x。
	 * r：日柱的母数，r除以60取余，即时日柱的干支序列数。
	 * s：公元年数后两位减1，s/4取整数部分。
	 * u：s除以4的余数
	 * m：月基数
	 * d：日期数
	 * x：世纪常数
	 * @param {Object} year
	 * @param {Object} month
	 * @param {Object} date
	 */
	function getRiGan(year, month, date) {
		year = Number(year);
		var s = year % 100 - 1,
			u = s % 4,
			m = getMonthBase(month),
			d = date,
			x = getCenturyConst(getCenturyByYear(year));
		// console.log('s:%s,u:%s,m:%s,d:%s,x:%s', s, u, m, d, x);
		var r = parseInt(s / 4) * 6 + 5 * (parseInt(s / 4) * 3 + u) + m + d + x;
		if (isRunnian(year) && month > 2) {
			r += 1;
		}
		r %= 60;
		r === 0 && (r = 60);
		return r;
	}
	/**
	 * 获取年干。公式：年干=年份个位数-3。适用于任何西元年，个位数小于3时，借10
	 * @param {Object} year
	 */
	function getNianGanIndex(year) {
		//年干=年份个位数-3，个位数小于2，借10
		var index = Number(year.toString().slice(-1, year.length));
		index <= 3 && (index += 10);
		index -= 3;
		return index;
	}
	/**
	 * 获取年支。公式：年支=(年份+7)/12取余数。整除余0即12，为丑。
	 * @param {Object} year
	 */
	function getNianZhiIndex(year) {
		return (Number(year) + 7) % 12 || 12;
	}
	/**
	 * 获取月干。公式：月干=年干*2+月支
	 * @param {Object} nianGanIndex
	 * @param {Object} lMonth
	 */
	function getYueGanIndex(nianGanIndex, lMonth) {
		var index = Number(nianGanIndex) * 2 + Number(lMonth);
		index %= 10;
		index === 0 && (index = 10);
		return index;
	}
	/**
	 * 获取月支。公式：月支=农历月份
	 * @param {Object} lMonth
	 */
	function getYueZhiIndex(lMonth) {
		return Number(lMonth);
	}
	/**
	 * 获取时支。公式：时支=小时/2 - 1（小时为偶数时），时支=(小时+1)/2 - 1（小时为奇数时）
	 * @param {Object} hour
	 */
	function getShiZhiIndex(hour) {
		hour = Number(hour);
		if (hour % 2 === 0) {
			return hour / 2 - 1;
		} else {
			return (hour + 1) / 2 - 1;
		}
	}
	/**
	 * 获取时干。公式：时干=日干*2 + 时支
	 * @param {Object} riGanIndex
	 * @param {Object} shiZhiIndex
	 */
	function getShiGanIndex(riGanIndex, shiZhiIndex) {
		var index = (riGanIndex * 2 + shiZhiIndex) % 10;
		index === 0 && (index = 10);
		return index;
	}

	function getWuxingResult(wuxing) {
		var temp = {'金': 0, '木': 0, '水': 0, '火': 0, '土': 0};
		[].forEach.call(Object.keys(wuxing), function(value, index) {
			[].forEach.call(wuxing[value], function(v, i) {
				temp[v]++;
			});
		});
		return temp;
	}
	return {
		getResult: function(date) {
			var __bazi = {
				year: '',
				month: '',
				date: '',
				hour: ''
			};
			var __wuxing = {
				year: '',
				month: '',
				date: '',
				hour: ''
			};
			var nianGanIndex = nianZhiIndex = yueGanIndex = yueZhiIndex = riGanIndex = shiZhiIndex = shiGanIndex = -1;
			var y1 = y2 = m1 = m2 = '';
			var serial = riGan = '';

			nianGanIndex = getNianGanIndex(date.cYear);
			y1 = __TianGan[nianGanIndex];
			__bazi.year = y1;
			__wuxing.year = __WuXing[y1];

			//年支=(年份+7)除以12的余数。
			nianZhiIndex = getNianZhiIndex(date.cYear);
			y2 = __NianZhi[nianZhiIndex];
			__bazi.year += y2;
			__wuxing.year += __WuXing[y2];

			//月干=年干*2 + 月支，和超过10，直接取个位数
			yueGanIndex = getYueGanIndex(nianGanIndex, date.lMonth);
			y1 = __TianGan[yueGanIndex];
			__bazi.month = y1;
			__wuxing.month = __WuXing[y1];

			//月支=农历月份
			yueZhiIndex = getYueZhiIndex(date.lMonth);
			y2 = __YueZhi[yueZhiIndex];
			__bazi.month += y2;
			__wuxing.month += __WuXing[y2];

			//日干及日支。采用高氏日柱公式，得到日期在甲子表中的序号
			serial = getRiGan(date.cYear, date.cMonth, date.cDay);
			riGan = __JiaZi[serial];
			riGanIndex = __TianGan.indexOf(riGan.slice(0, 1));
			__bazi.date = riGan;
			__wuxing.date = __WuXing[riGan.slice(0, 1)] + __WuXing[riGan.slice(1, 2)];

			//时支
			shiZhiIndex = getShiZhiIndex(date.hour);
			__bazi.hour = __ShiGanZhi[shiZhiIndex];
			__wuxing.hour = __WuXing[__bazi.hour];
			//时干
			shiGanIndex = getShiGanIndex(riGanIndex, shiZhiIndex);
			__bazi.hour = __TianGan[shiGanIndex] + __bazi.hour;
			__wuxing.hour = __WuXing[__TianGan[shiGanIndex]] + __wuxing.hour;

			return {
				bazi: __bazi,
				wuxing: __wuxing,
				wuxingResult: getWuxingResult(__wuxing)
			};
		}
	};
})();

// var a = {
// 	cYear: 2016, //公历年份
// 	cMonth: 7, //公历月份
// 	lMonth: 6, //农历月份
// 	cDay: 15, //公历日期
// 	lDay: 12, //农历日期
// 	hour: 22,
// 	minute: 16
// };

// var result = WanNianLi.getResult(a);
// console.log(result);
module.exports = WanNianLi;