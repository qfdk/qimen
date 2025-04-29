const express = require('express');
const app = express();
const path = require('path');
const {Lunar, Solar} = require('lunar-javascript');

// 导入奇门遁甲计算模块
const qimen = require('./lib/qimen');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
// public files
app.use(express.static(path.join(__dirname, 'public')));
app.disable('view cache');

// 首页 - 实时排盘
app.get('/', (req, res) => {
    // 获取当前时间
    const date = new Date();
    
    // 计算奇门盘
    const options = {
        type: '四柱',
        method: '时家',
        purpose: '综合',
        location: '默认位置'
    };
    
    try {
        const qimenPan = qimen.calculate(date, options);
        
        // 初始化缺失的属性，确保模板不会报错
        if (!qimenPan.jiuGongAnalysis) {
            qimenPan.jiuGongAnalysis = {};
        }
        
        // 确保每个宫位都有基本属性
        for (let i = 1; i <= 9; i++) {
            if (!qimenPan.jiuGongAnalysis[i]) {
                qimenPan.jiuGongAnalysis[i] = {
                    direction: '',
                    gongName: '',
                    jiXiong: 'ping'
                }
            }
        }
        
        // 传递常量给视图
        res.locals.JIU_GONG = qimen.JIU_GONG;
        res.locals.JIU_XING = qimen.JIU_XING;
        res.locals.BA_MEN = qimen.BA_MEN;
        res.locals.BA_SHEN = qimen.BA_SHEN;
        
        // 渲染页面
        res.render('index', { qimen: qimenPan });
    } catch (error) {
        console.error('排盘错误:', error);
        // 返回错误页面
        res.status(500).send('排盘错误: ' + error.message);
    }
});

// 自定义排盘
app.get('/custom', (req, res) => {
    // 获取请求参数
    const type = req.query.type || '四柱';
    const method = req.query.method || '时家';
    const dateStr = req.query.date;
    const timeStr = req.query.time;
    const location = req.query.location || '默认位置';
    const purpose = req.query.purpose || '综合';
    
    // 解析日期时间
    let date;
    if (dateStr && timeStr) {
        date = new Date(`${dateStr}T${timeStr}`);
    } else {
        date = new Date();
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        return res.status(400).send('无效的日期时间');
    }
    
    try {
        // 计算奇门盘
        const options = {
            type,
            method,
            purpose,
            location
        };
        
        const qimenPan = qimen.calculate(date, options);
        
        // 初始化缺失的属性，确保模板不会报错
        if (!qimenPan.jiuGongAnalysis) {
            qimenPan.jiuGongAnalysis = {};
        }
        
        // 确保每个宫位都有基本属性
        for (let i = 1; i <= 9; i++) {
            if (!qimenPan.jiuGongAnalysis[i]) {
                qimenPan.jiuGongAnalysis[i] = {
                    direction: '',
                    gongName: '',
                    jiXiong: 'ping'
                }
            }
        }
        
        // 传递常量给视图
        res.locals.JIU_GONG = qimen.JIU_GONG;
        res.locals.JIU_XING = qimen.JIU_XING;
        res.locals.BA_MEN = qimen.BA_MEN;
        res.locals.BA_SHEN = qimen.BA_SHEN;
        
        // 渲染页面
        res.render('index', { qimen: qimenPan });
    } catch (error) {
        console.error('自定义排盘错误:', error);
        // 返回错误页面
        res.status(500).send('排盘错误: ' + error.message);
    }
});

// API接口 - 获取奇门排盘数据
app.get('/api/qimen', (req, res) => {
    // 获取请求参数
    const type = req.query.type || '四柱';
    const method = req.query.method || '时家';
    const dateStr = req.query.date;
    const timeStr = req.query.time;
    const location = req.query.location || '默认位置';
    const purpose = req.query.purpose || '综合';
    
    // 解析日期时间
    let date;
    if (dateStr && timeStr) {
        date = new Date(`${dateStr}T${timeStr}`);
    } else {
        date = new Date();
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        return res.status(400).json({ error: '无效的日期时间' });
    }
    
    try {
        // 计算奇门盘
        const options = {
            type,
            method,
            purpose,
            location
        };
        
        const qimenPan = qimen.calculate(date, options);
        
        // 初始化缺失的属性，确保模板不会报错
        if (!qimenPan.jiuGongAnalysis) {
            qimenPan.jiuGongAnalysis = {};
        }
        
        // 确保每个宫位都有基本属性
        for (let i = 1; i <= 9; i++) {
            if (!qimenPan.jiuGongAnalysis[i]) {
                qimenPan.jiuGongAnalysis[i] = {
                    direction: '',
                    gongName: '',
                    jiXiong: 'ping'
                }
            }
        }
        
        // 返回JSON数据
        res.json(qimenPan);
    } catch (error) {
        console.error('API排盘错误:', error);
        res.status(500).json({ error: '排盘错误', message: error.message });
    }
});

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`奇门遁甲排盘系统正在运行，请访问 http://localhost:${port}`);
});
