const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// 免费 AI API 配置
// 优先级：Google Gemini > DeepSeek > 本地兜底
const AI_CONFIG = {
  // Google Gemini API (免费额度)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-2.0-flash', // 免费模型
  },
  // DeepSeek API ($5 免费credits)
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  }
};

// 内置知识库作为主要数据源
const CONCEPT_KNOWLEDGE = {
  // 分数
  '分数': {
    type: 'fraction',
    visualization: 'pie',
    params: { numerator: 3, denominator: 4 },
    keywords: ['分数', '几分之几', '分子', '分母', '几分之一', '几分之几'],
    explanation: '分数表示整体的一部分，分子是取的份数，分母是总份数'
  },
  '分数运算': {
    type: 'fraction-operation',
    visualization: 'pie',
    params: { numerator: 1, denominator: 2 },
    keywords: ['分数加减', '分数乘除', '异分母分数'],
    explanation: '分数运算需要先通分再计算'
  },
  
  // 几何
  '勾股定理': {
    type: 'pythagorean',
    visualization: 'triangle',
    params: { a: 3, b: 4 },
    keywords: ['勾股定理', '毕达哥拉斯', 'a²+b²=c²', '直角三角形斜边'],
    explanation: '直角三角形两直角边的平方和等于斜边的平方'
  },
  '三角形面积': {
    type: 'triangle-area',
    visualization: 'triangle-area',
    params: { base: 6, height: 4 },
    keywords: ['三角形面积', '底乘高除以二', '三角面积', '三角形'],
    explanation: '三角形面积 = 底 × 高 ÷ 2'
  },
  '长方形面积': {
    type: 'rectangle-area',
    visualization: 'rectangle-area',
    params: { width: 6, height: 4 },
    keywords: ['长方形面积', '矩形面积', '长乘宽', '长方形'],
    explanation: '长方形面积 = 长 × 宽'
  },
  '梯形面积': {
    type: 'trapezoid-area',
    visualization: 'generic',
    params: { upperBase: 3, lowerBase: 5, height: 4 },
    keywords: ['梯形面积', '梯形', '上底加下底'],
    explanation: '梯形面积 = (上底 + 下底) × 高 ÷ 2'
  },
  '平行四边形面积': {
    type: 'parallelogram-area',
    visualization: 'rectangle-area',
    params: { width: 6, height: 4 },
    keywords: ['平行四边形面积', '平行四边形'],
    explanation: '平行四边形面积 = 底 × 高'
  },
  '圆形面积': {
    type: 'circle-area',
    visualization: 'circle',
    params: { radius: 3 },
    keywords: ['圆面积', '圆的面积', 'πr²', '圆形面积', '圆'],
    explanation: '圆面积 = π × r²'
  },
  '三角形内角和': {
    type: 'triangle-angle',
    visualization: 'triangle-angle',
    params: { angle1: 60, angle2: 70 },
    keywords: ['三角形内角和', '内角和', '180度', '三角内角'],
    explanation: '三角形三个内角的和恒等于180度'
  },
  '圆周率': {
    type: 'circle-constant',
    visualization: 'circle',
    params: { radius: 3 },
    keywords: ['圆周率', 'π', '派', 'pi'],
    explanation: '圆周率π约等于3.14159...'
  },
  '周长': {
    type: 'perimeter',
    visualization: 'generic',
    params: {},
    keywords: ['周长', '周长公式', '边长总和'],
    explanation: '周长是图形所有边长的总和'
  },
  
  // 代数
  '一次函数': {
    type: 'linear-function',
    visualization: 'function',
    params: { fnType: 'linear' },
    keywords: ['一次函数', '正比例', 'y=kx', '线性函数', '直线', '一次函数图像'],
    explanation: '一次函数的图像是一条直线，y=kx+b'
  },
  '正比例函数': {
    type: 'linear-function',
    visualization: 'function',
    params: { fnType: 'proportional' },
    keywords: ['正比例', 'y=x', '正比例函数'],
    explanation: '正比例函数是特殊的一次函数，y=kx'
  },
  '反比例函数': {
    type: 'inverse-function',
    visualization: 'function',
    params: { fnType: 'inverse' },
    keywords: ['反比例', 'y=1/x', '双曲线', '反比例函数'],
    explanation: '反比例函数的图像是双曲线'
  },
  '二次函数': {
    type: 'quadratic-function',
    visualization: 'function',
    params: { fnType: 'quadratic' },
    keywords: ['二次函数', '抛物线', 'y=ax²', '二次方程', '二次函数图像'],
    explanation: '二次函数的图像是抛物线'
  },
  '正弦函数': {
    type: 'trig-function',
    visualization: 'function',
    params: { fnType: 'sin' },
    keywords: ['正弦', 'sin', '正弦函数', '三角函数'],
    explanation: '正弦函数描述的是角度与直角三角形对边长度的关系'
  },
  '余弦函数': {
    type: 'trig-function',
    visualization: 'function',
    params: { fnType: 'cos' },
    keywords: ['余弦', 'cos', '余弦函数'],
    explanation: '余弦函数描述的是角度与直角三角形邻边长度的关系'
  },
  
  // 算术
  '百分比': {
    type: 'percentage',
    visualization: 'percentage',
    params: { value: 65 },
    keywords: ['百分比', '百分号', '%', '百分之一', '成'],
    explanation: '百分比表示每一百份中的份数'
  },
  '正负数': {
    type: 'positive-negative',
    visualization: 'number-line',
    params: { value: 5 },
    keywords: ['正负数', '正数', '负数', '相反数', '数轴', '零下'],
    explanation: '正数和负数在数轴上对称分布，0是分界点'
  },
  '乘法口诀': {
    type: 'multiplication',
    visualization: 'multiplication',
    params: { rows: 3, cols: 4 },
    keywords: ['乘法', '乘以', '乘法口诀', '几乘几', '乘法的意义'],
    explanation: '乘法本质是相同加数的快捷运算'
  },
  '除法': {
    type: 'division',
    visualization: 'generic',
    params: { dividend: 12, divisor: 4 },
    keywords: ['除法', '除以', '整除', '商', '除法运算'],
    explanation: '除法是乘法的逆运算'
  },
  '加减法': {
    type: 'addition-subtraction',
    visualization: 'number-line',
    params: { value: 5 },
    keywords: ['加法', '减法', '加减', '相加', '相减'],
    explanation: '加法是合并，减法是去掉'
  },
  
  // 统计
  '条形统计图': {
    type: 'bar-chart',
    visualization: 'bar-chart',
    params: {},
    keywords: ['条形统计图', '统计图', '柱状图', '条形图'],
    explanation: '条形统计图可以直观比较不同类别的大小'
  },
  '折线统计图': {
    type: 'line-chart',
    visualization: 'function',
    params: { fnType: 'linear' },
    keywords: ['折线统计图', '折线图', '趋势', '变化'],
    explanation: '折线统计图可以展示数据变化的趋势'
  },
  '扇形统计图': {
    type: 'pie-chart',
    visualization: 'pie',
    params: {},
    keywords: ['扇形统计图', '饼图', '圆形图', '百分比分布'],
    explanation: '扇形统计图展示各部分占总体的百分比'
  },
  
  // 方程
  '一元一次方程': {
    type: 'linear-equation',
    visualization: 'function',
    params: { fnType: 'linear' },
    keywords: ['一元一次方程', '方程', '解方程', 'ax+b=c', '方程求解'],
    explanation: '一元一次方程只有一个未知数，且未知数的次数是1'
  },
  '二元一次方程组': {
    type: 'system-equations',
    visualization: 'coordinate',
    params: {},
    keywords: ['二元一次方程组', '方程组', '联立方程'],
    explanation: '二元一次方程组需要找到同时满足两个方程的解'
  },
  
  // 其他
  '绝对值': {
    type: 'absolute-value',
    visualization: 'number-line',
    params: { value: -5 },
    keywords: ['绝对值', '正数绝对值', '负数绝对值', '|x|'],
    explanation: '绝对值表示数轴上点到原点的距离'
  },
  '数轴': {
    type: 'number-line-basic',
    visualization: 'number-line',
    params: { value: 0 },
    keywords: ['数轴', '原点', '正方向', '单位长度'],
    explanation: '数轴是一条有方向、原点和单位长度的直线'
  },
  '相反数': {
    type: 'opposite-number',
    visualization: 'number-line',
    params: { value: 5 },
    keywords: ['相反数', '相反', '正负'],
    explanation: '相反数是绝对值相同、符号相反的两个数'
  },
  '倒数': {
    type: 'reciprocal',
    visualization: 'generic',
    params: {},
    keywords: ['倒数', '1/x', '倒数的概念'],
    explanation: '倒数是乘积为1的两个数'
  },
  '幂': {
    type: 'power',
    visualization: 'function',
    params: { fnType: 'quadratic' },
    keywords: ['幂', '指数', '乘方', '2的3次方', 'a的n次方'],
    explanation: '幂是多个相同因数的乘积'
  },
  '平方根': {
    type: 'square-root',
    visualization: 'generic',
    params: {},
    keywords: ['平方根', '根号', '√', '开方'],
    explanation: '平方根是平方后得到原数的数'
  },
  '因数': {
    type: 'factor',
    visualization: 'grid',
    params: { rows: 2, cols: 3 },
    keywords: ['因数', '分解因数', '公因数', '最大公因数'],
    explanation: '因数是能够整除原数的数'
  },
  '倍数': {
    type: 'multiple',
    visualization: 'number-line',
    params: { value: 3 },
    keywords: ['倍数', '公倍数', '最小公倍数', '3的倍数'],
    explanation: '倍数是一个数乘以整数的积'
  },
  '质数': {
    type: 'prime-number',
    visualization: 'generic',
    params: {},
    keywords: ['质数', '素数', '合数', '质数的概念'],
    explanation: '质数是只有1和它本身两个因数的数'
  },
  '角度': {
    type: 'angle',
    visualization: 'triangle-angle',
    params: { angle1: 45, angle2: 45 },
    keywords: ['角度', '角的度数', '直角', '锐角', '钝角', '周角'],
    explanation: '角度用来衡量两条射线张开的大小'
  },
  '等腰三角形': {
    type: 'isosceles-triangle',
    visualization: 'triangle-angle',
    params: { angle1: 60, angle2: 60 },
    keywords: ['等腰三角形', '等腰', '两腰相等', '顶角', '底角'],
    explanation: '等腰三角形有两条边相等'
  },
  '等边三角形': {
    type: 'equilateral-triangle',
    visualization: 'triangle-angle',
    params: { angle1: 60, angle2: 60 },
    keywords: ['等边三角形', '等边', '三边相等', '正三角形'],
    explanation: '等边三角形三条边都相等，每个角都是60度'
  },
  '直角三角形': {
    type: 'right-triangle',
    visualization: 'pythagorean',
    params: { a: 3, b: 4 },
    keywords: ['直角三角形', '直角', '勾股定理', '90度'],
    explanation: '直角三角形有一个角是90度'
  }
};

// 本地概念分析 - 核心算法
function analyzeConceptLocal(query) {
  const q = query.trim().toLowerCase();
  
  // 1. 精确匹配
  for (const [key, config] of Object.entries(CONCEPT_KNOWLEDGE)) {
    if (q === key.toLowerCase()) {
      return {
        matched: true,
        concept: key,
        type: config.type,
        visualization: config.visualization,
        params: { ...config.params },
        explanation: config.explanation,
        source: 'exact'
      };
    }
  }
  
  // 2. 包含匹配
  for (const [key, config] of Object.entries(CONCEPT_KNOWLEDGE)) {
    for (const keyword of config.keywords) {
      if (q.includes(keyword.toLowerCase()) || keyword.includes(q)) {
        return {
          matched: true,
          concept: key,
          type: config.type,
          visualization: config.visualization,
          params: { ...config.params },
          explanation: config.explanation,
          source: 'keyword'
        };
      }
    }
  }
  
  // 3. 正则匹配 - 提取数学表达式
  const patterns = [
    { pattern: /(\d+)\s*[÷×]\s*(\d+)/, type: 'multiplication', viz: 'multiplication' },
    { pattern: /(\d+)\s*\/\s*(\d+)/, type: 'fraction', viz: 'pie' },
    { pattern: /(\d+)\s*\^\s*(\d+)/, type: 'power', viz: 'generic' },
    { pattern: /sqrt\s*\(?(\d+)\)?/, type: 'square-root', viz: 'generic' },
    { pattern: /(\d+)度/, type: 'angle', viz: 'triangle-angle' },
    { pattern: /(sin|cos|tan|正弦|余弦|正切)/i, type: 'trig', viz: 'function' },
    { pattern: /y\s*=\s*([\dx\+\-\*\/\^]+)/i, type: 'function', viz: 'function' },
    { pattern: /(函数|方程|公式)/, type: 'function', viz: 'function' },
    { pattern: /(面积|周长|边长|长宽高|底高)/, type: 'geometry', viz: 'rectangle-area' },
    { pattern: /(统计|图表|数据|折线|条形|扇形)/, type: 'statistics', viz: 'bar-chart' },
    { pattern: /(比例|百分比|百分)/, type: 'percentage', viz: 'percentage' },
    { pattern: /(正数|负数|数轴|相反|绝对值)/, type: 'number', viz: 'number-line' },
    { pattern: /(三角|角|几何|图形|多边形)/, type: 'geometry', viz: 'triangle-angle' },
    { pattern: /(圆|圆周|直径|半径)/, type: 'circle', viz: 'circle' },
    { pattern: /(加|减|乘|除|运算)/, type: 'arithmetic', viz: 'number-line' },
  ];
  
  for (const { pattern, type, viz } of patterns) {
    if (pattern.test(q)) {
      return {
        matched: true,
        concept: query,
        type,
        visualization: viz,
        params: {},
        explanation: `这是关于 ${type} 的数学概念`,
        source: 'pattern'
      };
    }
  }
  
  // 4. 默认返回通用可视化
  return {
    matched: false,
    concept: query,
    type: 'generic',
    visualization: 'function',
    params: {},
    explanation: '这是一个数学概念，让我们用可视化来理解它',
    source: 'default'
  };
}

// 调用 Google Gemini API
async function callGeminiAPI(query) {
  const config = AI_CONFIG.gemini;
  if (!config.apiKey) {
    return null;
  }
  
  try {
    const prompt = `分析这个数学概念，返回JSON格式的分析结果：
    
数学概念：${query}

请返回以下格式的JSON（只返回JSON，不要其他内容）：
{
  "visualization": "推荐的可视化类型(pie/triangle/function/number-line/bar-chart/percentage/grid等)",
  "title": "适合的中文标题",
  "params": {"参数名": 参数值},
  "explanation": "一句话解释这个概念",
  "tips": "使用建议",
  "gradeLevel": 适合年级(1-9)
}`;

    const response = await axios.post(
      `${config.baseURL}/${config.model}:generateContent?key=${config.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );
    
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error('Gemini API Error:', error.message);
  }
  
  return null;
}

// 调用 DeepSeek API
async function callDeepSeekAPI(query) {
  const config = AI_CONFIG.deepseek;
  if (!config.apiKey) {
    return null;
  }
  
  try {
    const response = await axios.post(
      `${config.baseURL}/chat/completions`,
      {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: '你是一个数学教育助手，分析数学概念并返回JSON格式的分析结果。'
          },
          {
            role: 'user',
            content: `分析这个数学概念，返回JSON格式的分析结果：
            
数学概念：${query}

请返回以下格式的JSON（只返回JSON，不要其他内容）：
{
  "visualization": "推荐的可视化类型(pie/triangle/function/number-line/bar-chart/percentage/grid等)",
  "title": "适合的中文标题",
  "params": {"参数名": 参数值},
  "explanation": "一句话解释这个概念",
  "tips": "使用建议",
  "gradeLevel": 适合年级(1-9)
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        timeout: 15000
      }
    );
    
    const text = response.data?.choices?.[0]?.message?.content;
    if (text) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error('DeepSeek API Error:', error.message);
  }
  
  return null;
}

// 主分析函数
async function analyzeConcept(query) {
  // 1. 先本地分析
  const localResult = analyzeConceptLocal(query);
  
  // 2. 尝试AI增强 (按优先级)
  let aiResult = null;
  
  if (AI_CONFIG.gemini.apiKey) {
    aiResult = await callGeminiAPI(query);
  }
  
  if (!aiResult && AI_CONFIG.deepseek.apiKey) {
    aiResult = await callDeepSeekAPI(query);
  }
  
  // 3. 合并结果
  return {
    concept: query,
    local: localResult,
    ai: aiResult,
    visualization: aiResult?.visualization || localResult.visualization,
    title: aiResult?.title || localResult.concept,
    params: {
      ...localResult.params,
      ...(aiResult?.params || {})
    },
    explanation: aiResult?.explanation || localResult.explanation,
    tips: aiResult?.tips || '拖动滑块探索参数变化',
    gradeLevel: aiResult?.gradeLevel || 5
  };
}

// API 路由
app.post('/api/analyze', async (req, res) => {
  const { concept } = req.body;
  
  if (!concept) {
    return res.status(400).json({ error: '概念不能为空' });
  }
  
  console.log('📊 Analyzing:', concept);
  
  try {
    const result = await analyzeConcept(concept);
    console.log('✅ Result:', result.visualization);
    res.json(result);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: '分析失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ai: {
      gemini: !!AI_CONFIG.gemini.apiKey,
      deepseek: !!AI_CONFIG.deepseek.apiKey
    }
  });
});

// 所有其他请求返回 React 应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Math Magic Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📌 免费 AI API 配置：');
  if (AI_CONFIG.gemini.apiKey) {
    console.log('   ✅ Google Gemini: 已配置');
  } else {
    console.log('   ⚪ Google Gemini: 未配置（本地知识库兜底）');
  }
  if (AI_CONFIG.deepseek.apiKey) {
    console.log('   ✅ DeepSeek: 已配置');
  } else {
    console.log('   ⚪ DeepSeek: 未配置');
  }
  console.log('');
  if (!AI_CONFIG.gemini.apiKey && !AI_CONFIG.deepseek.apiKey) {
    console.log('💡 设置环境变量启用 AI 增强：');
    console.log('   export GEMINI_API_KEY=你的密钥');
    console.log('   或');
    console.log('   export DEEPSEEK_API_KEY=你的密钥');
  }
});
