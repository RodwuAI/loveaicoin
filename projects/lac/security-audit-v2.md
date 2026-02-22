# LAC网站安全审计报告 v2.0

**审计日期：** 2025-02-21  
**审计范围：** 前端认证系统 + 后端Edge Functions  
**审计人员：** 小黑（AI安全专家）  
**风险等级：** 🔴Critical / 🟠High / 🟡Medium / 🟢Low  

---

## 📋 执行摘要

LAC网站在安全方面存在多个**严重漏洞**，主要集中在认证系统和会话管理。**强烈建议在上线前修复所有Critical和High级别问题**。

**关键风险统计：**
- 🔴 Critical: 3个
- 🟠 High: 4个  
- 🟡 Medium: 5个
- 🟢 Low: 2个

---

## 🔴 Critical级别安全问题

### C1: 密码哈希机制严重不安全
**文件：** `/supabase/functions/auth-email/index.ts`  
**问题：** 使用SHA-256+固定盐值存储密码

```typescript
// 当前代码（不安全）
async function hashPassword(password: string): Promise<string> {
  const data = encoder.encode(password + 'lac_salt_2026'); // 固定盐值！
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  // ...
}
```

**风险：**
- SHA-256不是密码哈希函数，易被彩虹表攻击
- 固定盐值使批量破解成为可能
- 一旦盐值泄露，所有用户密码都危险

**修复方案：**
```typescript
import { hash, verify } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12); // 每次生成随机盐值
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await verify(password, hash);
}
```

### C2: Session Token存储在localStorage
**文件：** `/lib/auth-context.tsx`  
**问题：** 认证token存储在localStorage，容易被XSS攻击窃取

```typescript
// 不安全的存储方式
localStorage.setItem('lac_token', newToken);
const storedToken = localStorage.getItem('lac_token');
```

**风险：**
- XSS攻击可直接读取token
- 没有过期控制
- 跨域脚本可访问

**修复方案：**
```typescript
// 使用httpOnly cookie + 双重cookie模式
// 1. 后端设置httpOnly cookie
response.headers.set('Set-Cookie', 
  `lac_session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);

// 2. 前端使用CSR token验证
const csrfToken = crypto.randomUUID();
localStorage.setItem('lac_csrf', csrfToken);

// 3. 每次请求携带CSRF token
headers: {
  'X-CSRF-Token': localStorage.getItem('lac_csrf'),
  'Content-Type': 'application/json'
}
```

### C3: Hardcoded API URLs暴露基础设施
**文件：** `/app/login/page.tsx`, `/app/register/page.tsx`  
**问题：** Supabase URL和API endpoint直接写死在前端代码

```typescript
// 暴露敏感信息
const response = await fetch('https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/auth-email/signin', {
```

**风险：**
- 暴露基础设施信息
- 攻击者可直接调用API
- 难以更换后端服务

**修复方案：**
```typescript
// .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.lac.com
NEXT_PUBLIC_API_VERSION=v1

// utils/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
export const endpoints = {
  signin: `${API_BASE}/${process.env.NEXT_PUBLIC_API_VERSION}/auth/signin`,
  signup: `${API_BASE}/${process.env.NEXT_PUBLIC_API_VERSION}/auth/signup`
};

// 使用
const response = await fetch(endpoints.signin, options);
```

---

## 🟠 High级别安全问题

### H1: 缺乏Rate Limiting机制
**文件：** 所有后端Edge Functions  
**问题：** 没有请求频率限制，易被暴力破解和DDoS攻击

**修复方案：**
```typescript
// _shared/rate-limiter.ts
import { kv } from '@vercel/kv';

export async function checkRateLimit(
  identifier: string, 
  limit: number = 10, 
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate_limit:${identifier}`;
  const current = await kv.incr(key);
  
  if (current === 1) {
    await kv.expire(key, Math.ceil(windowMs / 1000));
  }
  
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current)
  };
}

// 使用示例
const clientIP = req.headers.get('cf-connecting-ip') || 'unknown';
const { allowed, remaining } = await checkRateLimit(`auth:${clientIP}`, 5, 300000); // 5分钟5次

if (!allowed) {
  return new Response(
    JSON.stringify({ error: '请求过于频繁，请稍后重试' }),
    { status: 429, headers: corsHeaders }
  );
}
```

### H2: Session Token生成安全性不足
**文件：** `/supabase/functions/auth-email/index.ts`  
**问题：** 会话token生成缺乏足够的随机性和长度

```typescript
// 当前实现过于简单
function generateSessionToken(): string {
  return 'lac_session_' + crypto.randomUUID();
}
```

**修复方案：**
```typescript
function generateSecureToken(prefix: string, bytes: number = 32): string {
  const randomBytes = new Uint8Array(bytes);
  crypto.getRandomValues(randomBytes);
  const token = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${Date.now()}_${token}`;
}

function generateSessionToken(): string {
  return generateSecureToken('lac_session', 32);
}
```

### H3: 密码复杂度要求过低
**文件：** `/app/register/page.tsx`, `/supabase/functions/auth-email/index.ts`  
**问题：** 前后端密码要求不一致，最低要求过低

**修复方案：**
```typescript
// 统一的密码验证函数
function validatePassword(password: string): { valid: boolean; message: string } {
  const requirements = [
    { regex: /.{12,}/, message: '至少12个字符' },
    { regex: /[a-z]/, message: '包含小写字母' },
    { regex: /[A-Z]/, message: '包含大写字母' },
    { regex: /[0-9]/, message: '包含数字' },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, message: '包含特殊字符' }
  ];
  
  for (const req of requirements) {
    if (!req.regex.test(password)) {
      return { valid: false, message: req.message };
    }
  }
  
  return { valid: true, message: '密码符合要求' };
}
```

### H4: 缺乏输入验证和SQL注入防护
**文件：** 所有后端Edge Functions  
**问题：** 用户输入未经充分验证，存在注入风险

**修复方案：**
```typescript
// _shared/validators.ts
import { z } from 'zod';

export const EmailSignupSchema = z.object({
  email: z.string().email('邮箱格式不正确').max(254),
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名不超过20个字符')
    .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含中英文、数字和下划线'),
  password: z.string().min(12, '密码至少12位')
});

// 使用参数化查询
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('email', email) // Supabase会自动转义
  .eq('status', 'active')
  .single();
```

---

## 🟡 Medium级别安全问题

### M1: 缺乏CSRF保护
**文件：** 前端登录/注册页面  
**修复方案：** 实现双重cookie模式（已在C2中提及）

### M2: 用户会话管理不完善
**文件：** `/lib/auth-context.tsx`  
**问题：** 没有自动续期、没有多设备检测

**修复方案：**
```typescript
// 自动续期逻辑
useEffect(() => {
  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        logout();
      }
    } catch {
      logout();
    }
  };

  const interval = setInterval(refreshToken, 15 * 60 * 1000); // 15分钟
  return () => clearInterval(interval);
}, []);
```

### M3: 错误信息过于详细
**文件：** 所有后端函数  
**问题：** 错误消息可能泄露系统信息

**修复方案：**
```typescript
// 统一错误处理
function sanitizeError(error: any, isProduction: boolean): string {
  if (!isProduction) return error.message;
  
  // 生产环境只返回通用错误
  const safeErrors = {
    'user_not_found': '用户名或密码错误',
    'invalid_password': '用户名或密码错误',
    'rate_limited': '请求过于频繁，请稍后重试'
  };
  
  return safeErrors[error.code] || '服务暂时不可用，请稍后重试';
}
```

### M4: 防作弊机制过于简单
**文件：** `/supabase/functions/mining-learn/index.ts`  
**问题：** 反作弊检查规则过少，容易绕过

### M5: 缺乏日志和监控
**文件：** 所有后端函数  
**问题：** 没有安全相关的日志记录

---

## 🟢 Low级别安全问题

### L1: 前端代码压缩和混淆
**建议：** 启用代码压缩，增加逆向难度

### L2: 安全Headers缺失
**修复方案：**
```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' }
];
```

---

## 🛡️ 反女巫（Anti-Sybil）方案

### 核心策略

LAC的反女巫系统需要在**用户体验**和**安全性**之间找到平衡，重点防范：
1. 批量注册薅羊毛
2. 自动化脚本刷学习奖励  
3. 多设备/多账号作弊

### 1. 设备指纹采集方案

#### 客户端指纹采集
```typescript
// utils/device-fingerprint.ts
interface DeviceFingerprint {
  canvas: string;
  webgl: string;
  audio: string;
  fonts: string[];
  screen: { width: number; height: number; colorDepth: number };
  timezone: string;
  language: string[];
  platform: string;
  hardware: number; // CPU核心数
  memory: number; // 设备内存
  connection: string; // 网络类型
  battery?: { charging: boolean; level: number };
}

export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const fingerprint: DeviceFingerprint = {
    canvas: await getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    audio: await getAudioFingerprint(),
    fonts: await getAvailableFonts(),
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.languages || [navigator.language],
    platform: navigator.platform,
    hardware: navigator.hardwareConcurrency || 1,
    memory: (navigator as any).deviceMemory || 0,
    connection: (navigator as any).connection?.effectiveType || 'unknown'
  };

  // 可选：电池信息（隐私敏感）
  try {
    const battery = await (navigator as any).getBattery?.();
    if (battery) {
      fingerprint.battery = {
        charging: battery.charging,
        level: Math.round(battery.level * 10) / 10 // 降低精度
      };
    }
  } catch {}

  return fingerprint;
}

async function getCanvasFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('LAC Device ID 🔒', 2, 15);
  
  return canvas.toDataURL();
}
```

#### 指纹存储和匹配
```typescript
// 后端：设备指纹分析
interface DeviceFingerprintAnalysis {
  deviceId: string;
  confidence: number; // 0-1，设备匹配置信度
  riskScore: number; // 0-100，风险分数
  flags: string[]; // 异常标记
}

export async function analyzeDeviceFingerprint(
  fingerprint: DeviceFingerprint,
  userId?: string
): Promise<DeviceFingerprintAnalysis> {
  // 1. 生成设备ID（基于稳定特征）
  const stableFeatures = [
    fingerprint.canvas,
    fingerprint.webgl,
    fingerprint.screen.width + 'x' + fingerprint.screen.height,
    fingerprint.timezone,
    fingerprint.platform
  ].join('|');
  
  const deviceId = await hashSHA256(stableFeatures);
  
  // 2. 检查设备重复使用
  const { data: existingDevices } = await supabase
    .from('device_fingerprints')
    .select('user_id, created_at, risk_score')
    .eq('device_id', deviceId);
    
  let riskScore = 0;
  const flags: string[] = [];
  
  // 3. 风险评估
  if (existingDevices && existingDevices.length > 1) {
    const uniqueUsers = new Set(existingDevices.map(d => d.user_id));
    if (uniqueUsers.size > 3) { // 同一设备超过3个用户
      riskScore += 40;
      flags.push('device_shared_multiple_users');
    }
  }
  
  // 检查常见虚拟机特征
  if (fingerprint.platform.includes('Linux') && 
      fingerprint.hardware <= 2 && 
      fingerprint.memory <= 4) {
    riskScore += 25;
    flags.push('possible_vm');
  }
  
  // 检查自动化工具特征
  if (!fingerprint.battery && fingerprint.memory === 0) {
    riskScore += 30;
    flags.push('headless_browser');
  }
  
  return {
    deviceId,
    confidence: 0.8, // 简化的置信度计算
    riskScore: Math.min(riskScore, 100),
    flags
  };
}
```

### 2. IP频率限制规则

```typescript
// IP风险评估系统
interface IPRiskProfile {
  ip: string;
  countryCode: string;
  isVPN: boolean;
  isDataCenter: boolean;
  reputationScore: number; // 0-100
  userCount: number; // 该IP注册的用户数
  activityPattern: 'normal' | 'suspicious' | 'bot-like';
}

export async function evaluateIPRisk(ip: string): Promise<IPRiskProfile> {
  // 1. 获取IP地理信息和类型
  const ipInfo = await fetchIPInfo(ip); // 使用MaxMind或类似服务
  
  // 2. 检查IP历史活动
  const { data: ipHistory } = await supabase
    .from('ip_activities')
    .select('user_id, action_type, created_at')
    .eq('ip_address', ip)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
  let riskScore = 0;
  let activityPattern: 'normal' | 'suspicious' | 'bot-like' = 'normal';
  
  // 3. 风险因子计算
  const uniqueUsers = new Set(ipHistory?.map(h => h.user_id) || []).size;
  
  if (uniqueUsers > 10) { // 一个IP超过10个用户
    riskScore += 60;
    activityPattern = 'suspicious';
  }
  
  if (ipInfo.isDataCenter) {
    riskScore += 40;
    activityPattern = 'suspicious';
  }
  
  if (ipInfo.isVPN) {
    riskScore += 30;
  }
  
  // 检查活动时间模式
  if (ipHistory && ipHistory.length > 50) {
    const timeIntervals = ipHistory
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((activity, i, arr) => 
        i > 0 ? new Date(activity.created_at).getTime() - new Date(arr[i-1].created_at).getTime() : 0
      )
      .filter(interval => interval > 0);
      
    const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;
    
    if (avgInterval < 5000) { // 平均间隔小于5秒
      riskScore += 50;
      activityPattern = 'bot-like';
    }
  }
  
  return {
    ip,
    countryCode: ipInfo.country,
    isVPN: ipInfo.isVPN,
    isDataCenter: ipInfo.isDataCenter,
    reputationScore: Math.max(0, 100 - riskScore),
    userCount: uniqueUsers,
    activityPattern
  };
}

// IP频率限制配置
const IP_LIMITS = {
  registration: {
    limit: 3,       // 每个IP最多3次注册
    window: 86400,  // 24小时窗口
    penalty: 86400  // 超限后封禁24小时
  },
  checkin: {
    limit: 50,      // 每个IP每天最多50次签到
    window: 86400,
    penalty: 3600   // 超限后冷却1小时
  },
  learning: {
    limit: 200,     // 每个IP每天最多200次学习完成
    window: 86400,
    penalty: 7200   // 超限后冷却2小时
  }
};
```

### 3. 行为分析模型（简化版）

```typescript
// 用户行为模式分析
interface UserBehaviorPattern {
  userId: string;
  sessionDuration: number[];     // 会话时长分布
  actionIntervals: number[];     // 操作间隔分布
  clickPatterns: ClickPattern[]; // 点击模式
  typingPatterns: TypingPattern[]; // 输入模式
  suspiciousScore: number;       // 可疑度 0-100
}

interface ClickPattern {
  x: number;
  y: number;
  timestamp: number;
  element: string;
}

interface TypingPattern {
  keydownIntervals: number[]; // 按键间隔
  correctionRate: number;     // 修正率（删除/总输入）
  pasteEvents: number;        // 粘贴次数
}

export class BehaviorAnalyzer {
  // 分析用户行为是否像机器人
  static analyzeBehavior(pattern: UserBehaviorPattern): {
    isBot: boolean;
    confidence: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let botScore = 0;
    
    // 1. 会话时长分析
    if (pattern.sessionDuration.length > 0) {
      const avgSession = pattern.sessionDuration.reduce((a, b) => a + b) / pattern.sessionDuration.length;
      
      if (avgSession < 30) { // 平均会话时长过短
        botScore += 30;
        reasons.push('session_too_short');
      }
      
      // 检查时长方差（机器人倾向于固定时长）
      const variance = this.calculateVariance(pattern.sessionDuration);
      if (variance < 100) { // 方差过小，行为过于规律
        botScore += 25;
        reasons.push('regular_session_pattern');
      }
    }
    
    // 2. 操作间隔分析
    if (pattern.actionIntervals.length > 10) {
      const avgInterval = pattern.actionIntervals.reduce((a, b) => a + b) / pattern.actionIntervals.length;
      
      if (avgInterval < 500) { // 平均间隔小于0.5秒
        botScore += 40;
        reasons.push('actions_too_fast');
      }
      
      // 检查是否有完全相同的时间间隔（机器人特征）
      const intervalCounts = new Map<number, number>();
      pattern.actionIntervals.forEach(interval => {
        const rounded = Math.round(interval / 100) * 100; // 100ms精度
        intervalCounts.set(rounded, (intervalCounts.get(rounded) || 0) + 1);
      });
      
      const maxRepeats = Math.max(...intervalCounts.values());
      if (maxRepeats > pattern.actionIntervals.length * 0.5) { // 超过50%的间隔相同
        botScore += 35;
        reasons.push('identical_intervals');
      }
    }
    
    // 3. 鼠标轨迹分析
    if (pattern.clickPatterns.length > 5) {
      const straightLines = this.detectStraightLines(pattern.clickPatterns);
      if (straightLines > pattern.clickPatterns.length * 0.8) {
        botScore += 30;
        reasons.push('straight_mouse_movement');
      }
    }
    
    // 4. 输入模式分析
    pattern.typingPatterns.forEach(typing => {
      if (typing.pasteEvents > typing.keydownIntervals.length * 0.8) { // 大量粘贴
        botScore += 25;
        reasons.push('excessive_pasting');
      }
      
      if (typing.keydownIntervals.length > 10) {
        const avgTypingSpeed = typing.keydownIntervals.reduce((a, b) => a + b) / typing.keydownIntervals.length;
        if (avgTypingSpeed < 50) { // 平均按键间隔小于50ms（超人类速度）
          botScore += 40;
          reasons.push('superhuman_typing_speed');
        }
      }
    });
    
    return {
      isBot: botScore > 50,
      confidence: Math.min(botScore / 100, 1),
      reasons
    };
  }
  
  private static calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b) / numbers.length;
  }
  
  private static detectStraightLines(clicks: ClickPattern[]): number {
    let straightLines = 0;
    
    for (let i = 2; i < clicks.length; i++) {
      const p1 = clicks[i-2];
      const p2 = clicks[i-1];
      const p3 = clicks[i];
      
      // 计算三点是否共线
      const slope1 = (p2.y - p1.y) / (p2.x - p1.x || 1);
      const slope2 = (p3.y - p2.y) / (p3.x - p2.x || 1);
      
      if (Math.abs(slope1 - slope2) < 0.1) { // 近似共线
        straightLines++;
      }
    }
    
    return straightLines;
  }
}
```

### 4. 验证码/人机验证接入方案

```typescript
// CAPTCHA集成方案
interface CAPTCHAConfig {
  provider: 'recaptcha' | 'hcaptcha' | 'cloudflare';
  siteKey: string;
  secretKey: string;
  scoreThreshold: number; // reCAPTCHA v3分数阈值
}

export class CAPTCHAService {
  constructor(private config: CAPTCHAConfig) {}
  
  // 前端触发CAPTCHA的条件
  static shouldShowCAPTCHA(context: {
    userRiskScore: number;
    ipRiskScore: number;
    deviceRiskScore: number;
    actionType: 'register' | 'signin' | 'checkin' | 'learn';
    recentFailures: number;
  }): boolean {
    const { userRiskScore, ipRiskScore, deviceRiskScore, actionType, recentFailures } = context;
    
    // 总风险分数
    const totalRisk = (userRiskScore * 0.4) + (ipRiskScore * 0.3) + (deviceRiskScore * 0.3);
    
    // 不同操作的阈值
    const thresholds = {
      register: 30,  // 注册：风险>30就要验证
      signin: 50,    // 登录：风险>50才验证
      checkin: 70,   // 签到：风险>70才验证
      learn: 80      // 学习：风险>80才验证
    };
    
    // 连续失败则降低阈值
    const adjustedThreshold = thresholds[actionType] - (recentFailures * 10);
    
    return totalRisk > adjustedThreshold;
  }
  
  // 验证CAPTCHA响应
  async verifyCAPTCHA(token: string, clientIP: string): Promise<{
    success: boolean;
    score?: number;
    errors?: string[];
  }> {
    if (this.config.provider === 'recaptcha') {
      return this.verifyRecaptcha(token, clientIP);
    } else if (this.config.provider === 'hcaptcha') {
      return this.verifyHCaptcha(token, clientIP);
    } else {
      return this.verifyCloudflare(token, clientIP);
    }
  }
  
  private async verifyRecaptcha(token: string, clientIP: string) {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${this.config.secretKey}&response=${token}&remoteip=${clientIP}`
    });
    
    const result = await response.json();
    
    return {
      success: result.success && (result.score >= this.config.scoreThreshold),
      score: result.score,
      errors: result['error-codes']
    };
  }
}

// 智能CAPTCHA触发策略
export async function checkCAPTCHARequired(req: Request, action: string): Promise<boolean> {
  const clientIP = req.headers.get('cf-connecting-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || '';
  
  // 1. IP风险评估
  const ipRisk = await evaluateIPRisk(clientIP);
  
  // 2. User-Agent分析
  const uaRisk = analyzeUserAgent(userAgent);
  
  // 3. 时间模式分析（防止定时脚本）
  const timeRisk = await analyzeTimePattern(clientIP, action);
  
  const totalRisk = (ipRisk.reputationScore * 0.4) + (uaRisk * 0.3) + (timeRisk * 0.3);
  
  return totalRisk > 60; // 风险超过60%需要验证
}

function analyzeUserAgent(userAgent: string): number {
  let risk = 0;
  
  // 检查自动化工具特征
  const botPatterns = [
    /headless/i,
    /selenium/i,
    /phantomjs/i,
    /chrome.*automation/i,
    /puppeteer/i
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    risk += 80;
  }
  
  // 检查是否为常见浏览器
  const browserPatterns = [
    /chrome/i,
    /firefox/i,
    /safari/i,
    /edge/i
  ];
  
  if (!browserPatterns.some(pattern => pattern.test(userAgent))) {
    risk += 40;
  }
  
  return Math.min(risk, 100);
}
```

### 5. 经济学惩罚机制

```typescript
// 经济惩罚系统
interface PenaltySystem {
  userId: string;
  violations: Violation[];
  currentPenalty: Penalty | null;
  trustScore: number; // 0-100，用户信任度
}

interface Violation {
  type: 'multiple_accounts' | 'automated_behavior' | 'fake_device' | 'ip_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  evidence: any;
}

interface Penalty {
  type: 'earning_reduction' | 'feature_restriction' | 'temporary_ban' | 'permanent_ban';
  multiplier: number; // 收益倍率（0-1）
  duration: number;   // 持续时间（秒）
  startTime: Date;
}

export class AntiSybilPenaltySystem {
  // 违规检测和处罚
  static async processPotentialViolation(
    userId: string,
    violationType: Violation['type'],
    evidence: any
  ): Promise<void> {
    // 1. 记录违规行为
    const violation: Violation = {
      type: violationType,
      severity: this.calculateSeverity(violationType, evidence),
      detectedAt: new Date(),
      evidence
    };
    
    await supabase.from('user_violations').insert({
      user_id: userId,
      violation_type: violation.type,
      severity: violation.severity,
      evidence: violation.evidence,
      created_at: violation.detectedAt.toISOString()
    });
    
    // 2. 获取用户历史违规记录
    const { data: userViolations } = await supabase
      .from('user_violations')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30天内
      
    // 3. 计算累计风险分数
    const riskScore = this.calculateRiskScore(userViolations || []);
    
    // 4. 确定处罚措施
    const penalty = this.determinePenalty(riskScore, violation.severity);
    
    if (penalty) {
      await this.applyPenalty(userId, penalty);
    }
    
    // 5. 更新用户信任度
    await this.updateTrustScore(userId, riskScore);
  }
  
  private static calculateSeverity(
    type: Violation['type'], 
    evidence: any
  ): Violation['severity'] {
    switch (type) {
      case 'multiple_accounts':
        const accountCount = evidence.suspectedAccounts?.length || 0;
        if (accountCount >= 10) return 'critical';
        if (accountCount >= 5) return 'high';
        if (accountCount >= 2) return 'medium';
        return 'low';
        
      case 'automated_behavior':
        const botConfidence = evidence.botConfidence || 0;
        if (botConfidence >= 0.9) return 'critical';
        if (botConfidence >= 0.7) return 'high';
        if (botConfidence >= 0.5) return 'medium';
        return 'low';
        
      case 'fake_device':
        const deviceRisk = evidence.deviceRiskScore || 0;
        if (deviceRisk >= 80) return 'high';
        if (deviceRisk >= 60) return 'medium';
        return 'low';
        
      case 'ip_abuse':
        const ipRisk = evidence.ipRiskScore || 0;
        if (ipRisk >= 90) return 'critical';
        if (ipRisk >= 70) return 'high';
        if (ipRisk >= 50) return 'medium';
        return 'low';
        
      default:
        return 'low';
    }
  }
  
  private static calculateRiskScore(violations: any[]): number {
    const severityWeights = { low: 10, medium: 25, high: 50, critical: 100 };
    const timeDecay = 0.9; // 时间衰减因子
    
    let totalRisk = 0;
    const now = Date.now();
    
    violations.forEach(violation => {
      const age = (now - new Date(violation.created_at).getTime()) / (24 * 60 * 60 * 1000); // 天数
      const decayFactor = Math.pow(timeDecay, age);
      totalRisk += severityWeights[violation.severity] * decayFactor;
    });
    
    return Math.min(totalRisk, 100);
  }
  
  private static determinePenalty(riskScore: number, severity: Violation['severity']): Penalty | null {
    if (riskScore < 20) return null; // 低风险无处罚
    
    // 根据风险分数和违规严重程度确定处罚
    if (riskScore >= 80 || severity === 'critical') {
      return {
        type: 'permanent_ban',
        multiplier: 0,
        duration: 0, // 永久
        startTime: new Date()
      };
    }
    
    if (riskScore >= 60 || severity === 'high') {
      return {
        type: 'temporary_ban',
        multiplier: 0,
        duration: 7 * 24 * 60 * 60, // 7天
        startTime: new Date()
      };
    }
    
    if (riskScore >= 40 || severity === 'medium') {
      return {
        type: 'earning_reduction',
        multiplier: 0.1, // 收益减少90%
        duration: 3 * 24 * 60 * 60, // 3天
        startTime: new Date()
      };
    }
    
    // 低级处罚：收益减半1天
    return {
      type: 'earning_reduction',
      multiplier: 0.5,
      duration: 24 * 60 * 60,
      startTime: new Date()
    };
  }
  
  private static async applyPenalty(userId: string, penalty: Penalty): Promise<void> {
    await supabase.from('user_penalties').insert({
      user_id: userId,
      penalty_type: penalty.type,
      multiplier: penalty.multiplier,
      duration_seconds: penalty.duration,
      start_time: penalty.startTime.toISOString(),
      end_time: penalty.duration > 0 
        ? new Date(penalty.startTime.getTime() + penalty.duration * 1000).toISOString()
        : null,
      status: 'active'
    });
    
    // 如果是封禁，立即使所有会话失效
    if (penalty.type.includes('ban')) {
      await supabase
        .from('user_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('user_id', userId);
    }
  }
  
  private static async updateTrustScore(userId: string, riskScore: number): Promise<void> {
    const trustScore = Math.max(0, 100 - riskScore);
    
    await supabase
      .from('users')
      .update({ 
        trust_score: trustScore,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);
  }
  
  // 检查用户是否受到处罚影响
  static async checkActivePenalty(userId: string): Promise<{
    hasPenalty: boolean;
    penalty?: Penalty;
    canEarn: boolean;
    earningMultiplier: number;
  }> {
    const { data: activePenalty } = await supabase
      .from('user_penalties')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .or('end_time.is.null,end_time.gt.' + new Date().toISOString())
      .single();
    
    if (!activePenalty) {
      return {
        hasPenalty: false,
        canEarn: true,
        earningMultiplier: 1.0
      };
    }
    
    return {
      hasPenalty: true,
      penalty: {
        type: activePenalty.penalty_type,
        multiplier: activePenalty.multiplier,
        duration: activePenalty.duration_seconds,
        startTime: new Date(activePenalty.start_time)
      },
      canEarn: activePenalty.penalty_type !== 'temporary_ban' && activePenalty.penalty_type !== 'permanent_ban',
      earningMultiplier: activePenalty.multiplier
    };
  }
}
```

### 6. 综合反女巫流程

```typescript
// 主要的反女巫检查流程
export class AntiSybilOrchestrator {
  static async performComprehensiveCheck(request: {
    userId?: string;
    ip: string;
    userAgent: string;
    deviceFingerprint: DeviceFingerprint;
    actionType: 'register' | 'signin' | 'checkin' | 'learn';
    metadata?: any;
  }): Promise<{
    allowed: boolean;
    riskScore: number;
    requiresCAPTCHA: boolean;
    violations: string[];
    penaltyMultiplier: number;
  }> {
    const { userId, ip, userAgent, deviceFingerprint, actionType, metadata } = request;
    
    let totalRiskScore = 0;
    const violations: string[] = [];
    
    // 1. IP风险评估
    const ipAnalysis = await evaluateIPRisk(ip);
    totalRiskScore += (100 - ipAnalysis.reputationScore) * 0.3;
    
    if (ipAnalysis.isDataCenter) violations.push('datacenter_ip');
    if (ipAnalysis.userCount > 5) violations.push('shared_ip');
    
    // 2. 设备指纹分析
    const deviceAnalysis = await analyzeDeviceFingerprint(deviceFingerprint, userId);
    totalRiskScore += deviceAnalysis.riskScore * 0.25;
    violations.push(...deviceAnalysis.flags);
    
    // 3. 用户行为分析（如果有用户ID）
    let behaviorRisk = 0;
    if (userId) {
      const userBehavior = await this.getUserBehaviorPattern(userId);
      const behaviorAnalysis = BehaviorAnalyzer.analyzeBehavior(userBehavior);
      
      if (behaviorAnalysis.isBot) {
        behaviorRisk = behaviorAnalysis.confidence * 100;
        violations.push(...behaviorAnalysis.reasons);
      }
      
      // 检查现有处罚
      const penaltyCheck = await AntiSybilPenaltySystem.checkActivePenalty(userId);
      if (penaltyCheck.hasPenalty) {
        if (!penaltyCheck.canEarn) {
          return {
            allowed: false,
            riskScore: 100,
            requiresCAPTCHA: false,
            violations: ['active_ban'],
            penaltyMultiplier: 0
          };
        }
      }
    }
    
    totalRiskScore += behaviorRisk * 0.25;
    
    // 4. 时间模式分析
    const timeRisk = await this.analyzeTimePattern(ip, actionType);
    totalRiskScore += timeRisk * 0.2;
    
    // 5. 确定是否需要CAPTCHA
    const requiresCAPTCHA = CAPTCHAService.shouldShowCAPTCHA({
      userRiskScore: behaviorRisk,
      ipRiskScore: 100 - ipAnalysis.reputationScore,
      deviceRiskScore: deviceAnalysis.riskScore,
      actionType,
      recentFailures: 0 // 可以从数据库获取
    });
    
    // 6. 决定是否允许操作
    const riskThresholds = {
      register: 70,  // 注册比较严格
      signin: 85,    // 登录相对宽松
      checkin: 80,   // 签到中等严格
      learn: 75      // 学习中等严格
    };
    
    const allowed = totalRiskScore < riskThresholds[actionType];
    
    // 7. 计算收益倍率
    let penaltyMultiplier = 1.0;
    if (userId) {
      const penaltyCheck = await AntiSybilPenaltySystem.checkActivePenalty(userId);
      penaltyMultiplier = penaltyCheck.earningMultiplier;
    }
    
    // 根据风险分数调整收益
    if (totalRiskScore > 30) {
      penaltyMultiplier *= Math.max(0.1, 1 - (totalRiskScore - 30) / 100);
    }
    
    // 8. 记录检查结果用于后续分析
    if (userId) {
      await supabase.from('antisybil_checks').insert({
        user_id: userId,
        check_type: actionType,
        risk_score: totalRiskScore,
        violations: violations,
        allowed: allowed,
        ip_address: ip,
        device_id: deviceAnalysis.deviceId,
        created_at: new Date().toISOString()
      });
    }
    
    // 9. 如果风险较高，记录为潜在违规
    if (totalRiskScore > 60 && userId) {
      const violationType = this.determineViolationType(violations);
      await AntiSybilPenaltySystem.processPotentialViolation(
        userId,
        violationType,
        {
          riskScore: totalRiskScore,
          violations,
          ip,
          deviceFingerprint: deviceAnalysis.deviceId,
          timestamp: new Date()
        }
      );
    }
    
    return {
      allowed,
      riskScore: Math.round(totalRiskScore),
      requiresCAPTCHA,
      violations,
      penaltyMultiplier: Math.round(penaltyMultiplier * 100) / 100
    };
  }
  
  private static async getUserBehaviorPattern(userId: string): Promise<UserBehaviorPattern> {
    // 从数据库获取用户行为数据
    const { data: sessions } = await supabase
      .from('user_behavior_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1000);
    
    // 分析会话时长、操作间隔等
    // 这里简化实现，实际可以更复杂
    return {
      userId,
      sessionDuration: sessions?.map(s => s.session_duration || 0) || [],
      actionIntervals: sessions?.map(s => s.action_interval || 0) || [],
      clickPatterns: [],
      typingPatterns: [],
      suspiciousScore: 0
    };
  }
  
  private static async analyzeTimePattern(ip: string, actionType: string): Promise<number> {
    const { data: recentActions } = await supabase
      .from('ip_activities')
      .select('created_at')
      .eq('ip_address', ip)
      .eq('action_type', actionType)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 最近1小时
      .order('created_at', { ascending: true });
    
    if (!recentActions || recentActions.length < 3) return 0;
    
    // 计算时间间隔的规律性
    const intervals = [];
    for (let i = 1; i < recentActions.length; i++) {
      const interval = new Date(recentActions[i].created_at).getTime() - 
                      new Date(recentActions[i-1].created_at).getTime();
      intervals.push(interval);
    }
    
    // 如果间隔太规律（方差小），风险较高
    if (intervals.length > 0) {
      const mean = intervals.reduce((a, b) => a + b) / intervals.length;
      const variance = intervals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      
      // 标准差小于平均值的10%，认为是机器人行为
      if (stdDev < mean * 0.1) {
        return 60;
      }
    }
    
    return 0;
  }
  
  private static determineViolationType(violations: string[]): Violation['type'] {
    if (violations.includes('device_shared_multiple_users') || violations.includes('shared_ip')) {
      return 'multiple_accounts';
    }
    
    if (violations.includes('headless_browser') || violations.includes('actions_too_fast')) {
      return 'automated_behavior';
    }
    
    if (violations.includes('possible_vm') || violations.includes('fake_device')) {
      return 'fake_device';
    }
    
    return 'ip_abuse';
  }
}
```

---

## 📊 实施优先级建议

### 立即修复（上线前必须完成）
1. **C1**: 替换密码哈希机制为bcrypt
2. **C2**: 实现httpOnly cookie + CSRF保护
3. **H1**: 添加基础Rate Limiting
4. **H2**: 加强Session Token生成

### 第二阶段（上线后1周内）
1. **C3**: 配置API endpoint环境变量
2. **H3**: 提升密码复杂度要求
3. **M1-M3**: 完善会话管理和错误处理

### 第三阶段（上线后1个月内）
1. 部署基础反女巫系统（设备指纹+IP分析）
2. 集成CAPTCHA服务
3. 实施行为分析模型

### 长期优化（持续进行）
1. 完善经济学惩罚机制
2. 增强机器学习反作弊模型
3. 建立安全监控和告警系统

---

## 🔧 技术实施清单

### 后端依赖添加
```json
{
  "dependencies": {
    "bcrypt": "^5.1.0",
    "@vercel/kv": "^1.0.0", // Redis缓存，用于Rate Limiting
    "zod": "^3.22.0",      // 输入验证
    "ua-parser-js": "^1.0.0" // User-Agent解析
  }
}
```

### 环境变量配置
```bash
# .env
BCRYPT_ROUNDS=12
RATE_LIMIT_REDIS_URL=redis://...
RECAPTCHA_SECRET_KEY=...
IP_GEOLOCATION_API_KEY=...
ENABLE_ANTISYBIL=true
ANTISYBIL_RISK_THRESHOLD=70
```

### 数据库表增加
```sql
-- 设备指纹表
CREATE TABLE device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(64) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  fingerprint_data JSONB NOT NULL,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 反女巫检查记录
CREATE TABLE antisybil_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  check_type VARCHAR(20) NOT NULL,
  risk_score INTEGER NOT NULL,
  violations TEXT[] DEFAULT '{}',
  allowed BOOLEAN NOT NULL,
  ip_address INET,
  device_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户违规记录
CREATE TABLE user_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  violation_type VARCHAR(30) NOT NULL,
  severity VARCHAR(10) NOT NULL,
  evidence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户处罚记录
CREATE TABLE user_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  penalty_type VARCHAR(20) NOT NULL,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  duration_seconds INTEGER,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status VARCHAR(10) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📞 联系方式

如有安全问题或需要进一步澄清，请联系：
- **安全负责人：** 小黑
- **技术负责人：** 小技/小小技  
- **项目负责人：** 吴总

**注意：本报告包含敏感安全信息，请妥善保管，不要泄露给未授权人员。**

---

*审计完成时间：2025-02-21 21:45*  
*下次审计建议：上线后1个月进行第二轮安全审计*