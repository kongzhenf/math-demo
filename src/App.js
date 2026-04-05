import {
  Mafs,
  Coordinates,
  Circle,
  Ellipse,
  Line,
  Point,
  Polygon,
  Polyline,
  Text,
  Plot,
  Vector,
  useMovablePoint,
} from "mafs";
import { useState, useEffect, useCallback } from "react";
import * as math from "mathjs";
import "./App.css";

// API 基础URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ========================================
// 可视化组件库
// ========================================

// 分数可视化
function FractionVisual({ numerator = 3, denominator = 4, onChange }) {
  const [num, setNum] = useState(numerator);
  const [den, setDen] = useState(denominator);
  const percent = Math.round((num / den) * 100);
  
  useEffect(() => {
    onChange?.({ numerator: num, denominator: den });
  }, [num, den]);
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>🍕 分数演示</h3>
      </div>
      
      <div className="fraction-display">
        <div className="pizza-container">
          <Mafs viewBox={{ x: [-1.2, 1.2], y: [-1.2, 1.2] }}>
            <Coordinates />
            {Array.from({ length: den }).map((_, i) => {
              const angle = (360 / den) * i;
              const isFilled = i < num;
              const x2 = Math.cos((angle * Math.PI) / 180) * 1;
              const y2 = Math.sin((angle * Math.PI) / 180) * 1;
              return (
                <Line
                  key={i}
                  point1={[0, 0]}
                  point2={[x2, y2]}
                  color={isFilled ? "#ff6b6b" : "rgba(255,255,255,0.2)"}
                />
              );
            })}
            <Circle
              cx={0}
              cy={0}
              r={1}
              fill={den <= 8 ? "rgba(255,214,140,0.8)" : "rgba(255,214,140,0.3)"}
              stroke="none"
            />
          </Mafs>
          <p className="pizza-label">把披萨分成 {den} 块，吃了 {num} 块</p>
        </div>
        
        <div className="fraction-equation">
          <div className="big-fraction">
            <span className="numerator">{num}</span>
            <div className="fraction-line"></div>
            <span className="denominator">{den}</span>
          </div>
          <div className="percent-badge">= {percent}%</div>
        </div>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>🍕 分母（总块数）: {den}</label>
          <input
            type="range"
            min="2"
            max="12"
            value={den}
            onChange={(e) => {
              const newDen = parseInt(e.target.value);
              setDen(newDen);
              if (num > newDen) setNum(newDen);
            }}
          />
        </div>
        <div className="control-group">
          <label>🎯 分子（吃的块数）: {num}</label>
          <input
            type="range"
            min="1"
            max={den}
            value={num}
            onChange={(e) => setNum(parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

// 勾股定理可视化
function PythagoreanVisual({ a = 3, b = 4, onChange }) {
  const [sideA, setSideA] = useState(a);
  const [sideB, setSideB] = useState(b);
  const c = Math.sqrt(sideA * sideA + sideB * sideB);
  const scale = 1.5;
  
  useEffect(() => {
    onChange?.({ a: sideA, b: sideB });
  }, [sideA, sideB]);
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>📐 勾股定理演示</h3>
      </div>
      
      <div className="pythagorean-display">
        <Mafs viewBox={{ x: [-0.5, 5], y: [-0.5, 5] }}>
          <Coordinates />
          <Polygon
            points={[[0, 0], [sideA * scale, 0], [0, sideB * scale]]}
            fill="rgba(102, 126, 234, 0.3)"
            stroke="#667eea"
            weight={2}
          />
          <Text x={sideA * scale / 2} y={-0.3}>a = {sideA}</Text>
          <Text x={-0.4} y={sideB * scale / 2}>b = {sideB}</Text>
          <Text x={sideA * scale / 2 + 0.3} y={sideB * scale / 2 - 0.3}>c = {c.toFixed(2)}</Text>
        </Mafs>
        
        <div className="pythagorean-squares">
          <div className="square-a" style={{ width: sideA * 40, height: sideA * 40 }}>
            <span>a² = {sideA * sideA}</span>
          </div>
          <div className="square-b" style={{ width: sideB * 40, height: sideB * 40 }}>
            <span>b² = {sideB * sideB}</span>
          </div>
          <div className="square-c" style={{ width: c * 30, height: c * 30 }}>
            <span>c² = {c.toFixed(0)}</span>
          </div>
        </div>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>🔵 边长 a: {sideA}</label>
          <input type="range" min="1" max="10" value={sideA} onChange={(e) => setSideA(parseInt(e.target.value))} />
        </div>
        <div className="control-group">
          <label>🟢 边长 b: {sideB}</label>
          <input type="range" min="2" max="10" value={sideB} onChange={(e) => setSideB(parseInt(e.target.value))} />
        </div>
      </div>
      
      <div className="formula-box">
        <strong>{sideA}² + {sideB}² = c²</strong>
        <br />
        <span>{sideA * sideA} + {sideB * sideB} = {c.toFixed(2)}² = {(c * c).toFixed(0)}</span>
      </div>
    </div>
  );
}

// 百分比可视化
function PercentageVisual({ value = 65, onChange }) {
  const [percent, setPercent] = useState(value);
  
  useEffect(() => {
    onChange?.({ value: percent });
  }, [percent]);
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>📊 百分比演示</h3>
      </div>
      
      <div className="percentage-display">
        <Mafs viewBox={{ x: [-1.5, 1.5], y: [-1.5, 1.5] }}>
          <Coordinates />
          <Circle cx={0} cy={0} r={1} fill="rgba(200, 200, 200, 0.3)" stroke="none" />
          <Polyline
            points={[
              [0, 0],
              ...Array.from({ length: Math.floor(percent / 360 * 100) + 1 }, (_, i) => {
                const angle = ((i / (Math.floor(percent / 360 * 100) + 1)) * percent / 100 * Math.PI * 2) - Math.PI / 2;
                return [Math.cos(angle), Math.sin(angle)];
              })
            ]}
            strokeWidth={0.15}
            stroke="#667eea"
            fill="rgba(102, 126, 234, 0.5)"
          />
          <Text x={0} y={0.1}>{percent}%</Text>
        </Mafs>
        
        <div className="percent-blocks">
          <div className="blocks-grid">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className={`block ${i < percent ? "filled" : ""}`} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="controls">
        <div className="control-group full-width">
          <label>📈 百分比: {percent}%</label>
          <input type="range" min="0" max="100" value={percent} onChange={(e) => setPercent(parseInt(e.target.value))} />
        </div>
      </div>
      
      <div className="formula-box">
        <strong>分数：</strong> {percent}/100 <br />
        <strong>小数：</strong> {percent / 100} <br />
        <strong>百分比：</strong> {percent}%
      </div>
    </div>
  );
}

// 正负数可视化
function PositiveNegativeVisual({ value = 5, onChange }) {
  const [num, setNum] = useState(value);
  
  useEffect(() => {
    onChange?.({ value: num });
  }, [num]);
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>➕➖ 正数和负数</h3>
      </div>
      
      <div className="numberline-display">
        <Mafs viewBox={{ x: [-6, 6], y: [-1, 1] }} preserveAspectRatio={false}>
          <Line point1={[-5, 0]} point2={[5, 0]} />
          {Array.from({ length: 11 }).map((_, i) => {
            const x = i - 5;
            return <Line key={i} point1={[x, -0.1]} point2={[x, 0.1]} />;
          })}
          <Point x={0} y={0} color="#667eea" />
          <Text x={0} y={-0.3}>0</Text>
          {num >= 0 ? (
            <>
              <Point x={num * 0.5} y={0} color="#81c784" />
              <Text x={num * 0.5} y={0.3}>+{num}</Text>
            </>
          ) : (
            <>
              <Point x={num * 0.5} y={0} color="#f5576c" />
              <Text x={num * 0.5} y={0.3}>{num}</Text>
            </>
          )}
        </Mafs>
      </div>
      
      <div className="controls">
        <div className="control-group full-width">
          <label>🎚️ 选择数值: {num > 0 ? `+${num}` : num}</label>
          <input type="range" min="-10" max="10" value={num} onChange={(e) => setNum(parseInt(e.target.value))} />
        </div>
      </div>
      
      <div className="number-examples">
        <div className="example"><span>🌡️ 温度：{num > 0 ? `零上${num}` : num} 度</span></div>
        <div className="example"><span>💰 账户：{num >= 0 ? `+${num}` : num} 元</span></div>
        <div className="example"><span>📍 海拔：海平面 {num >= 0 ? `+${num}` : num} 米</span></div>
      </div>
    </div>
  );
}

// 函数绘图组件
function FunctionVisual({ params = {}, onChange }) {
  const [fnType, setFnType] = useState(params.fnType || 'linear');
  
  const functions = {
    linear: { fn: (x) => 2 * x, label: "y = 2x", color: "#667eea" },
    proportional: { fn: (x) => x, label: "y = x", color: "#81c784" },
    inverse: { fn: (x) => 1 / x, label: "y = 1/x", color: "#f5576c" },
    quadratic: { fn: (x) => x * x / 4, label: "y = x²/4", color: "#ffb74d" },
    parabola: { fn: (x) => -x * x / 4 + 3, label: "y = -x²/4 + 3", color: "#4fc3f7" },
    sin: { fn: (x) => Math.sin(x * 2), label: "y = sin(x)", color: "#f5576c" },
    cos: { fn: (x) => Math.cos(x * 2), label: "y = cos(x)", color: "#81c784" },
  };
  
  const currentFn = functions[fnType] || functions.linear;
  
  useEffect(() => {
    onChange?.({ fnType });
  }, [fnType]);
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>📈 函数图像 - {currentFn.label}</h3>
      </div>
      
      <Mafs viewBox={{ x: [-5, 5], y: [-5, 5] }}>
        <Coordinates />
        <Plot.Function y={currentFn.fn} color={currentFn.color} />
      </Mafs>
      
      <div className="controls">
        <div className="control-group full-width">
          <label>📊 函数类型</label>
          <select value={fnType} onChange={(e) => setFnType(e.target.value)}>
            <option value="linear">一次函数 y=2x</option>
            <option value="proportional">正比例 y=x</option>
            <option value="inverse">反比例 y=1/x</option>
            <option value="quadratic">二次函数 y=x²/4</option>
            <option value="parabola">抛物线 y=-x²/4+3</option>
            <option value="sin">正弦 y=sin(x)</option>
            <option value="cos">余弦 y=cos(x)</option>
          </select>
        </div>
      </div>
      
      <div className="formula-box">
        <strong>函数公式：</strong> {currentFn.label}
      </div>
    </div>
  );
}

// 表达式绘图组件 - 用户输入任意数学表达式实时绘图
function ExpressionPlotter({ onChange }) {
  const [expression, setExpression] = useState("x^2");
  const [yExpression, setYExpression] = useState("sin(x)");
  const [xRange, setXRange] = useState({ min: -10, max: 10 });
  const [parsedFn, setParsedFn] = useState(null);
  const [error, setError] = useState(null);
  
  // 解析表达式
  const parseExpression = useCallback((expr) => {
    try {
      // 将 ^ 替换为 **
      const normalizedExpr = expr.replace(/\^/g, '**');
      // 使用 math.js 编译函数
      const fn = math.compile(normalizedExpr);
      // 创建可执行的函数
      const executable = (x) => {
        try {
          return fn.evaluate({ x: x });
        } catch (e) {
          return NaN;
        }
      };
      setError(null);
      return executable;
    } catch (e) {
      setError("表达式解析错误: " + e.message);
      return null;
    }
  }, []);
  
  useEffect(() => {
    const fn = parseExpression(yExpression);
    setParsedFn(() => fn);
    onChange?.({ expression: yExpression });
  }, [yExpression, parseExpression]);
  
  // 预设表达式
  const presetExpressions = [
    { label: "二次函数", expr: "x^2", color: "#667eea" },
    { label: "一次函数", expr: "2*x + 1", color: "#81c784" },
    { label: "反比例", expr: "1/x", color: "#f5576c" },
    { label: "三次函数", expr: "x^3", color: "#ffb74d" },
    { label: "正弦波", expr: "sin(x)", color: "#4fc3f7" },
    { label: "余弦波", expr: "cos(x)", color: "#f06292" },
    { label: "正切", expr: "tan(x)", color: "#ba68c8" },
    { label: "指数函数", expr: "2^x", color: "#26a69a" },
    { label: "平方根", expr: "sqrt(x)", color: "#8d6e63" },
    { label: "绝对值", expr: "abs(x)", color: "#78909c" },
    { label: "阶梯函数", expr: "floor(x)", color: "#a1887f" },
    { label: "上取整", expr: "ceil(x)", color: "#90a4ae" },
  ];
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>📈 表达式绘图器</h3>
        <p className="subtitle">输入任意数学表达式，实时生成交互式图表</p>
      </div>
      
      <div className="expression-input-section">
        <div className="input-group">
          <label>📝 输入数学表达式（用 x 作为变量）：</label>
          <input
            type="text"
            value={yExpression}
            onChange={(e) => setYExpression(e.target.value)}
            placeholder="例如: sin(x), x^2 + 2*x - 1, 1/x"
            className="expression-input"
          />
        </div>
        
        {error && <div className="error-msg">{error}</div>}
        
        <div className="preset-expressions">
          <span className="preset-label">快速选择：</span>
          <div className="preset-btns">
            {presetExpressions.map((preset, i) => (
              <button
                key={i}
                className="preset-btn"
                onClick={() => setYExpression(preset.expr)}
                style={{ borderColor: yExpression === preset.expr ? preset.color : undefined }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <Mafs viewBox={{ x: [xRange.min, xRange.max], y: [-5, 5] }}>
        <Coordinates />
        {parsedFn && (
          <Plot.Function
            y={parsedFn}
            color={presetExpressions.find(p => p.expr === yExpression)?.color || "#667eea"}
          />
        )}
      </Mafs>
      
      <div className="controls">
        <div className="control-group">
          <label>📏 X 轴范围</label>
          <div className="range-inputs">
            <input
              type="number"
              value={xRange.min}
              onChange={(e) => setXRange(prev => ({ ...prev, min: parseFloat(e.target.value) || -10 }))}
              className="range-input"
            />
            <span>到</span>
            <input
              type="number"
              value={xRange.max}
              onChange={(e) => setXRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 10 }))}
              className="range-input"
            />
          </div>
        </div>
      </div>
      
      <div className="formula-box">
        <strong>当前表达式：</strong> y = {yExpression}
        <br />
        <span className="help-text">支持的运算符: + - * / ^ sqrt() sin() cos() tan() abs() floor() ceil() log() exp()</span>
      </div>
    </div>
  );
}

// 乘法可视化
function MultiplicationVisual({ rows = 3, cols = 4, onChange }) {
  const [r, setR] = useState(rows);
  const [c, setC] = useState(cols);
  
  useEffect(() => {
    onChange?.({ rows: r, cols: c });
  }, [r, c]);
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>✖️ 乘法演示</h3>
      </div>
      
      <div className="multiplication-display">
        <div className="mul-grid">
          {Array.from({ length: r }).map((_, row) => (
            <div key={row} className="mul-row">
              {Array.from({ length: c }).map((_, col) => (
                <div key={col} className="mul-cell filled" />
              ))}
            </div>
          ))}
        </div>
        
        <div className="mul-equation">
          <span className="mul-num">{c}</span>
          <span className="mul-op">×</span>
          <span className="mul-num">{r}</span>
          <span className="mul-eq">=</span>
          <span className="mul-result">{c * r}</span>
        </div>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>📐 行数: {r}</label>
          <input type="range" min="1" max="9" value={r} onChange={(e) => setR(parseInt(e.target.value))} />
        </div>
        <div className="control-group">
          <label>📐 列数: {c}</label>
          <input type="range" min="1" max="9" value={c} onChange={(e) => setC(parseInt(e.target.value))} />
        </div>
      </div>
      
      <div className="formula-box">
        <strong>含义：</strong> {r} 行，每行 {c} 个<br />
        <strong>结果：</strong> 总共 {r * c} 个
      </div>
    </div>
  );
}

// 三角形面积可视化
function TriangleAreaVisual({ base = 6, height = 4, onChange }) {
  const [b, setB] = useState(base);
  const [h, setH] = useState(height);
  const area = (b * h) / 2;
  const scale = 1;
  
  useEffect(() => {
    onChange?.({ base: b, height: h });
  }, [b, h]);
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>📐 三角形面积</h3>
        <p className="subtitle">面积 = 底 × 高 ÷ 2</p>
      </div>
      
      <div className="area-display">
        <Mafs viewBox={{ x: [-1, 8], y: [-1, 6] }}>
          <Coordinates />
          <Polygon
            points={[[0, 0], [b * scale, 0], [0, h * scale]]}
            fill="rgba(129, 199, 132, 0.4)"
            stroke="#81c784"
            weight={2}
          />
          <Text x={b * scale / 2} y={-0.4}>底 = {b}</Text>
          <Text x={-0.6} y={h * scale / 2}>高 = {h}</Text>
        </Mafs>
        
        <div className="area-formula">
          <span className="formula-text">
            面积 = {b} × {h} ÷ 2 = <strong>{area}</strong>
          </span>
        </div>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>📏 底边: {b}</label>
          <input type="range" min="2" max="10" value={b} onChange={(e) => setB(parseInt(e.target.value))} />
        </div>
        <div className="control-group">
          <label>📏 高度: {h}</label>
          <input type="range" min="1" max="8" value={h} onChange={(e) => setH(parseInt(e.target.value))} />
        </div>
      </div>
    </div>
  );
}

// 长方形面积
function RectangleAreaVisual({ width = 6, height = 4, onChange }) {
  const [w, setW] = useState(width);
  const [h, setH] = useState(height);
  const area = w * h;
  
  useEffect(() => {
    onChange?.({ width: w, height: h });
  }, [w, h]);
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>📐 长方形面积</h3>
        <p className="subtitle">面积 = 长 × 宽</p>
      </div>
      
      <div className="area-display">
        <Mafs viewBox={{ x: [-1, 8], y: [-1, 6] }}>
          <Coordinates />
          <Polygon
            points={[[0, 0], [w, 0], [w, h], [0, h]]}
            fill="rgba(102, 126, 234, 0.4)"
            stroke="#667eea"
            weight={2}
          />
          <Text x={w / 2} y={-0.4}>长 = {w}</Text>
          <Text x={-0.6} y={h / 2}>宽 = {h}</Text>
        </Mafs>
        
        <div className="area-formula">
          <span className="formula-text">
            面积 = {w} × {h} = <strong>{area}</strong>
          </span>
        </div>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>📏 长度: {w}</label>
          <input type="range" min="2" max="10" value={w} onChange={(e) => setW(parseInt(e.target.value))} />
        </div>
        <div className="control-group">
          <label>📏 宽度: {h}</label>
          <input type="range" min="1" max="8" value={h} onChange={(e) => setH(parseInt(e.target.value))} />
        </div>
      </div>
    </div>
  );
}

// 三角形内角和
function TriangleAngleVisual({ angle1 = 60, angle2 = 70, onChange }) {
  const [a1, setA1] = useState(angle1);
  const [a2, setA2] = useState(angle2);
  const a3 = 180 - a1 - a2;
  
  const getTrianglePoints = () => {
    if (a3 <= 0) return [[0, 0], [2, 0], [1, 1]];
    const x3 = 2;
    const y3 = Math.sqrt(4 - x3 * x3);
    return [[0, 0], [x3, 0], [x3 / 2, y3 * Math.sin((180 - a3) * Math.PI / 180)]];
  };
  
  const points = getTrianglePoints();
  
  useEffect(() => {
    onChange?.({ angle1: a1, angle2: a2 });
  }, [a1, a2]);
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>📐 三角形内角和 = 180°</h3>
      </div>
      
      <div className="angle-display">
        <Mafs viewBox={{ x: [-1, 4], y: [-1, 3] }}>
          <Coordinates />
          <Polygon points={points} fill="rgba(102, 126, 234, 0.3)" stroke="#667eea" weight={2} />
          <Text x={points[1][0] / 2} y={-0.3}>{a1}°</Text>
          <Text x={points[2][0] / 2 + 0.3} y={points[2][1] / 2}>{a2}°</Text>
          <Text x={points[2][0] + 0.2} y={points[2][1] - 0.3}>{a3 > 0 ? a3 : '?'}°</Text>
        </Mafs>
        
        <div className="angle-values">
          <div className="angle-item" style={{ background: 'rgba(79, 195, 247, 0.3)' }}><span className="angle-num">{a1}°</span></div>
          <div className="angle-item" style={{ background: 'rgba(129, 199, 132, 0.3)' }}><span className="angle-num">{a2}°</span></div>
          <div className="angle-item" style={{ background: 'rgba(245, 87, 108, 0.3)' }}><span className="angle-num">{a3 > 0 ? a3 : '?'}°</span></div>
        </div>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>🔵 角1: {a1}°</label>
          <input type="range" min="10" max="120" value={a1} onChange={(e) => {
            const v = parseInt(e.target.value);
            setA1(v);
            if (180 - v - a2 <= 0) setA2(180 - v - 10);
          }} />
        </div>
        <div className="control-group">
          <label>🟢 角2: {a2}°</label>
          <input type="range" min="10" max="120" value={a2} onChange={(e) => {
            const v = parseInt(e.target.value);
            setA2(v);
            if (180 - a1 - v <= 0) setA1(180 - v - 10);
          }} />
        </div>
      </div>
      
      <div className="formula-box">
        <strong>三角形内角和恒等于 180°</strong><br />
        {a1}° + {a2}° + {a3 > 0 ? a3 : '?'}° = 180°
      </div>
    </div>
  );
}

// 条形统计图
function BarChartVisual({ data = [65, 80, 45, 90, 55, 72], onChange }) {
  const [chartData, setChartData] = useState(data);
  const categories = ["数学", "语文", "英语", "科学", "体育", "美术"];
  
  return (
    <div className="visual-container">
      <div className="visual-header">
        <h3>📊 条形统计图</h3>
      </div>
      
      <div className="barchart-display">
        <Mafs viewBox={{ x: [-0.5, 6.5], y: [0, 10] }}>
          <Coordinates />
          {chartData.map((value, i) => {
            const x = 0.5 + i;
            const height = value / 25;
            return (
              <Polygon
                key={i}
                points={[[x - 0.25, 0], [x + 0.25, 0], [x + 0.25, height], [x - 0.25, height]]}
                fill={`hsla(${(i * 60) % 360}, 70%, 60%, 0.7)`}
                stroke="none"
              />
            );
          })}
          {chartData.map((value, i) => (
            <Text key={i} x={0.5 + i} y={value / 25 + 0.3}>{value}</Text>
          ))}
        </Mafs>
        
        <div className="chart-labels">
          {categories.map((cat, i) => (
            <span key={i} className="chart-label">{cat}</span>
          ))}
        </div>
      </div>
      
      <div className="formula-box">
        <strong>各科成绩条形统计图</strong><br />
        最高分：{Math.max(...chartData)} | 最低分：{Math.min(...chartData)} | 平均分：{(chartData.reduce((a, b) => a + b, 0) / chartData.length).toFixed(1)}
      </div>
    </div>
  );
}

// ========================================
// 动态可视化选择器
// ========================================

function DynamicVisualization({ config, onParamsChange }) {
  const { visualization, params = {} } = config;
  
  switch (visualization) {
    case 'pie':
    case 'fraction':
      return <FractionVisual {...params} onChange={onParamsChange} />;
    case 'triangle':
    case 'pythagorean':
      return <PythagoreanVisual {...params} onChange={onParamsChange} />;
    case 'percentage':
    case 'percent-circle':
      return <PercentageVisual {...params} onChange={onParamsChange} />;
    case 'number-line':
    case 'positive-negative':
      return <PositiveNegativeVisual {...params} onChange={onParamsChange} />;
    case 'function':
    case 'line':
      return <FunctionVisual {...params} onChange={onParamsChange} />;
    case 'expression':
    case 'plotter':
    case 'custom-expression':
      return <ExpressionPlotter {...params} onChange={onParamsChange} />;
    case 'grid':
    case 'multiplication':
      return <MultiplicationVisual {...params} onChange={onParamsChange} />;
    case 'triangle-area':
      return <TriangleAreaVisual {...params} onChange={onParamsChange} />;
    case 'rectangle-area':
      return <RectangleAreaVisual {...params} onChange={onParamsChange} />;
    case 'polygon':
      // 根据参数判断是哪种多边形
      if (params.angle1 !== undefined) {
        return <TriangleAngleVisual {...params} onChange={onParamsChange} />;
      }
      if (params.base !== undefined && params.height !== undefined) {
        return <TriangleAreaVisual {...params} onChange={onParamsChange} />;
      }
      return <RectangleAreaVisual {...params} onChange={onParamsChange} />;
    case 'bar':
    case 'bar-chart':
      return <BarChartVisual {...params} onChange={onParamsChange} />;
    default:
      return <FunctionVisual {...params} onChange={onParamsChange} />;
  }
}

// ========================================
// 主应用
// ========================================

function App() {
  const [input, setInput] = useState("");
  const [currentConfig, setCurrentConfig] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 调用AI分析接口
  const analyzeConcept = useCallback(async (concept) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept })
      });
      
      if (!response.ok) throw new Error('分析请求失败');
      
      const data = await response.json();
      setCurrentConfig({
        visualization: data.visualization,
        title: data.title,
        params: data.params,
        explanation: data.explanation,
        tips: data.tips,
        gradeLevel: data.gradeLevel,
        rawData: data
      });
      setShowDemo(true);
    } catch (err) {
      console.error('API Error:', err);
      setError('分析失败，请重试');
      // 使用本地默认配置
      setCurrentConfig({
        visualization: 'function',
        title: concept,
        params: {},
        explanation: '数学可视化演示'
      });
      setShowDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handleSearch = () => {
    if (!input.trim()) return;
    analyzeConcept(input);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  
  const handleParamsChange = (newParams) => {
    setCurrentConfig(prev => ({
      ...prev,
      params: { ...prev.params, ...newParams }
    }));
  };
  
  // 推荐的快捷概念
  const quickConcepts = [
    { label: "分数的认识", config: { visualization: 'fraction', title: '分数的认识', params: { numerator: 3, denominator: 4 } } },
    { label: "勾股定理", config: { visualization: 'pythagorean', title: '勾股定理', params: { a: 3, b: 4 } } },
    { label: "三角形面积", config: { visualization: 'triangle-area', title: '三角形面积', params: { base: 6, height: 4 } } },
    { label: "百分比", config: { visualization: 'percentage', title: '百分比', params: { value: 65 } } },
    { label: "正负数", config: { visualization: 'positive-negative', title: '正数和负数', params: { value: 5 } } },
    { label: "乘法口诀", config: { visualization: 'multiplication', title: '乘法口诀', params: { rows: 3, cols: 4 } } },
    { label: "一次函数", config: { visualization: 'function', title: '一次函数', params: { fnType: 'linear' } } },
    { label: "表达式绘图", config: { visualization: 'expression', title: '表达式绘图器', params: {} } },
    { label: "条形统计图", config: { visualization: 'bar-chart', title: '条形统计图', params: {} } },
  ];
  
  const handleQuickClick = (item) => {
    setInput(item.label);
    setCurrentConfig(item.config);
    setShowDemo(true);
    setError(null);
  };
  
  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🧪</span>
          <span className="logo-text">数学魔法学堂</span>
        </div>
        <nav className="nav">
          <span className="nav-item active">✨ AI 动画演示</span>
        </nav>
      </header>
      
      <main className="main-content">
        {!showDemo ? (
          <>
            <section className="hero">
              <h1 className="hero-title">
                <span>让数学</span>
                <span className="gradient-text">看得见、摸得着</span>
              </h1>
              <p className="hero-subtitle">
                输入任意数学概念 ✨<br />
                <strong>AI 实时生成</strong>交互式动画演示
              </p>
              
              <div className="search-box">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入任意数学概念：分数、勾股定理、三角形面积..."
                />
                <button onClick={handleSearch} disabled={loading}>
                  {loading ? '🤔 分析中...' : <><span>开始探索</span><span>✨</span></>}
                </button>
              </div>
              
              {error && <div className="error-msg">{error}</div>}
              
              <div className="quick-concepts">
                <span className="quick-label">试试这些：</span>
                {quickConcepts.map((item, i) => (
                  <button key={i} className="quick-btn" onClick={() => handleQuickClick(item)}>
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
            
            <section className="features">
              <div className="feature-card">
                <span className="feature-icon">🤖</span>
                <h3>AI 智能分析</h3>
                <p>输入任意概念，AI 自动理解并生成演示</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🎬</span>
                <h3>动画演示</h3>
                <p>抽象概念变成动画，一看就懂</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🎮</span>
                <h3>动手探索</h3>
                <p>拖动滑块，互动中理解原理</p>
              </div>
            </section>
          </>
        ) : (
          <>
            <button className="back-btn" onClick={() => setShowDemo(false)}>
              ← 返回首页
            </button>
            
            <div className="demo-title">
              <h2>📚 {currentConfig?.title || input}</h2>
            </div>
            
            {currentConfig?.explanation && (
              <div className="explanation-banner">
                💡 {currentConfig.explanation}
              </div>
            )}
            
            <div className="demo-content">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner">🤔</div>
                  <p>AI 正在分析概念...</p>
                </div>
              ) : currentConfig ? (
                <DynamicVisualization
                  config={currentConfig}
                  onParamsChange={handleParamsChange}
                />
              ) : null}
            </div>
            
            {currentConfig?.tips && (
              <div className="tips-banner">
                💡 小贴士：{currentConfig.tips}
              </div>
            )}
            
            <div className="more-concepts">
              <h3>试试其他概念：</h3>
              <div className="more-btns">
                {quickConcepts
                  .filter(q => q.label !== currentConfig?.title)
                  .slice(0, 4)
                  .map((item, i) => (
                    <button key={i} className="more-btn" onClick={() => handleQuickClick(item)}>
                      {item.label}
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
