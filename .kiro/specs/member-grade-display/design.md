# Design Document: Member Grade Display

## Overview

本设计文档描述了前端会员等级显示功能的技术实现方案。该功能通过对接后端已有的会员等级API，在前端展示用户当前等级、等级权益、升级进度等信息，并在商品价格展示时应用会员折扣。

核心设计原则：
- **仅前端修改**：不修改任何后端代码
- **组件复用**：创建可复用的等级展示组件
- **类型安全**：使用TypeScript/JSDoc定义数据类型
- **多语言支持**：支持中文、越南语、泰语

## Architecture

```mermaid
graph TB
    subgraph Frontend
        A[Mine Page] --> B[GradeCard Component]
        B --> C[GradeBadge Component]
        B --> D[GradeProgress Component]
        E[Grade Detail Page] --> F[GradeList Component]
        G[Product Display] --> H[PriceWithDiscount Component]
    end
    
    subgraph State Management
        I[Recoil State] --> J[userGradeState]
        I --> K[gradeListState]
    end
    
    subgraph Utils
        L[gradeUtils.js] --> M[calculateProgress]
        L --> N[getAmountToNextLevel]
        L --> O[getDiscountPrice]
    end
    
    subgraph API
        P[/api/user/detail] --> Q[User Info + Grade]
    end
    
    A --> I
    E --> I
    B --> L
    H --> L
    A --> P
```

## Components and Interfaces

### 1. 数据类型定义 (src/types/grade.js)

```javascript
/**
 * @typedef {Object} UpgradeCondition
 * @property {number} expend_money - 升级所需累计消费金额
 */

/**
 * @typedef {Object} GradeEquity
 * @property {number} discount - 折扣率 (0-10, 如9.5表示95折)
 */

/**
 * @typedef {Object} UserGrade
 * @property {number} grade_id - 等级ID
 * @property {string} name - 等级名称
 * @property {number} weight - 等级权重 (数字越大等级越高)
 * @property {UpgradeCondition} upgrade - 升级条件
 * @property {GradeEquity} equity - 等级权益
 * @property {number} status - 状态 (0=禁用, 1=启用)
 */

/**
 * @typedef {Object} GradeProgress
 * @property {number} currentExpend - 当前累计消费金额
 * @property {number} nextLevelRequirement - 下一等级所需金额
 * @property {number} progressPercent - 升级进度百分比 (0-100)
 * @property {number} amountToNext - 距离下一等级还需金额
 * @property {boolean} isMaxLevel - 是否已达最高等级
 */
```

### 2. 工具函数 (src/utils/gradeUtils.js)

```javascript
/**
 * 计算升级进度百分比
 * @param {number} currentExpend - 当前累计消费
 * @param {number} nextLevelRequirement - 下一等级所需金额
 * @returns {number} 进度百分比 (0-100)
 */
export function calculateProgress(currentExpend, nextLevelRequirement) {
  if (nextLevelRequirement <= 0) return 100;
  return Math.min((currentExpend / nextLevelRequirement) * 100, 100);
}

/**
 * 计算距离下一等级还需消费金额
 * @param {number} currentExpend - 当前累计消费
 * @param {number} nextLevelRequirement - 下一等级所需金额
 * @returns {number} 还需消费金额
 */
export function getAmountToNextLevel(currentExpend, nextLevelRequirement) {
  return Math.max(nextLevelRequirement - currentExpend, 0);
}

/**
 * 计算折扣后价格
 * @param {number} originalPrice - 原价
 * @param {number} discountRate - 折扣率 (0-10)
 * @returns {number} 折扣后价格 (保留2位小数)
 */
export function getDiscountPrice(originalPrice, discountRate) {
  return Number((originalPrice * (discountRate / 10)).toFixed(2));
}

/**
 * 根据等级权重获取等级样式配置
 * @param {number} weight - 等级权重
 * @returns {Object} 样式配置 {color, bgColor, icon}
 */
export function getGradeStyle(weight) {
  if (weight >= 30) {
    return { color: '#8B5CF6', bgColor: '#EDE9FE', icon: '💎', level: 'diamond' };
  } else if (weight >= 20) {
    return { color: '#6366F1', bgColor: '#E0E7FF', icon: '🏆', level: 'platinum' };
  } else if (weight >= 10) {
    return { color: '#F59E0B', bgColor: '#FEF3C7', icon: '🥇', level: 'gold' };
  } else {
    return { color: '#6B7280', bgColor: '#F3F4F6', icon: '👤', level: 'normal' };
  }
}
```

### 3. 状态管理 (src/state.js 扩展)

```javascript
// 用户等级状态
export const userGradeState = atom({
  key: "userGrade",
  default: null, // UserGrade | null
});

// 等级列表状态 (用于等级详情页)
export const gradeListState = atom({
  key: "gradeList",
  default: [], // UserGrade[]
});

// 用户消费金额状态
export const userExpendState = atom({
  key: "userExpend",
  default: 0, // number
});
```

### 4. 组件设计

#### 4.1 GradeBadge 组件

```jsx
// src/components/Grade/GradeBadge.jsx
/**
 * 等级徽章组件 - 显示等级名称和图标
 * @param {Object} props
 * @param {UserGrade|null} props.grade - 等级对象
 * @param {string} props.size - 尺寸 ('sm' | 'md' | 'lg')
 */
const GradeBadge = ({ grade, size = 'md' }) => {
  const { t } = useTranslation();
  const style = getGradeStyle(grade?.weight || 0);
  const gradeName = grade?.name || t('grade.default_name');
  
  return (
    <div className={`grade-badge grade-badge--${size} grade-badge--${style.level}`}>
      <span className="grade-badge__icon">{style.icon}</span>
      <span className="grade-badge__name">{gradeName}</span>
    </div>
  );
};
```

#### 4.2 GradeProgress 组件

```jsx
// src/components/Grade/GradeProgress.jsx
/**
 * 等级进度组件 - 显示升级进度条和相关信息
 * @param {Object} props
 * @param {number} props.currentExpend - 当前累计消费
 * @param {number} props.nextLevelRequirement - 下一等级所需金额
 * @param {boolean} props.isMaxLevel - 是否最高等级
 */
const GradeProgress = ({ currentExpend, nextLevelRequirement, isMaxLevel }) => {
  const { t } = useTranslation();
  
  if (isMaxLevel) {
    return <div className="grade-progress__max">{t('grade.max_level')}</div>;
  }
  
  const progress = calculateProgress(currentExpend, nextLevelRequirement);
  const amountToNext = getAmountToNextLevel(currentExpend, nextLevelRequirement);
  
  return (
    <div className="grade-progress">
      <div className="grade-progress__bar">
        <div className="grade-progress__fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="grade-progress__info">
        <span>{t('grade.current_expend')}: ¥{currentExpend.toFixed(2)}</span>
        <span>{t('grade.amount_to_next')}: ¥{amountToNext.toFixed(2)}</span>
      </div>
    </div>
  );
};
```

#### 4.3 GradeCard 组件

```jsx
// src/components/Grade/GradeCard.jsx
/**
 * 等级卡片组件 - 组合徽章、进度和权益展示
 * @param {Object} props
 * @param {UserGrade|null} props.grade - 等级对象
 * @param {number} props.expendMoney - 累计消费金额
 * @param {UserGrade|null} props.nextGrade - 下一等级对象
 * @param {Function} props.onPress - 点击回调
 */
const GradeCard = ({ grade, expendMoney, nextGrade, onPress }) => {
  const { t } = useTranslation();
  const discount = grade?.equity?.discount || 10;
  const isMaxLevel = !nextGrade;
  const nextRequirement = nextGrade?.upgrade?.expend_money || 0;
  
  return (
    <div className="grade-card" onClick={onPress}>
      <div className="grade-card__header">
        <GradeBadge grade={grade} size="lg" />
        {discount < 10 && (
          <span className="grade-card__discount">
            {t('grade.discount_label', { rate: discount })}
          </span>
        )}
      </div>
      <GradeProgress
        currentExpend={expendMoney}
        nextLevelRequirement={nextRequirement}
        isMaxLevel={isMaxLevel}
      />
    </div>
  );
};
```

#### 4.4 PriceWithDiscount 组件

```jsx
// src/components/Grade/PriceWithDiscount.jsx
/**
 * 带折扣的价格展示组件
 * @param {Object} props
 * @param {number} props.originalPrice - 原价
 * @param {number} props.discountRate - 折扣率 (0-10)
 */
const PriceWithDiscount = ({ originalPrice, discountRate = 10 }) => {
  const { t } = useTranslation();
  
  if (discountRate >= 10) {
    return <span className="price">¥{originalPrice.toFixed(2)}</span>;
  }
  
  const discountPrice = getDiscountPrice(originalPrice, discountRate);
  
  return (
    <div className="price-with-discount">
      <span className="price-with-discount__original">¥{originalPrice.toFixed(2)}</span>
      <span className="price-with-discount__member">¥{discountPrice}</span>
      <span className="price-with-discount__tag">{t('grade.member_price')}</span>
    </div>
  );
};
```

## Data Models

### API 响应数据结构

```javascript
// GET /api/user/detail 响应
{
  "code": 1,
  "msg": "success",
  "data": {
    "userInfo": {
      "user_id": 123,
      "nickName": "用户昵称",
      "grade_id": 2,
      "grade": {
        "grade_id": 2,
        "name": "黄金会员",
        "weight": 10,
        "upgrade": { "expend_money": 1000 },
        "equity": { "discount": 9.5 },
        "status": 1
      },
      "expend_money": "1500.00",
      "pay_money": "2000.00"
    }
  }
}
```

### 默认等级配置

```javascript
// 当用户无等级时的默认配置
const DEFAULT_GRADE = {
  grade_id: 0,
  name: '普通会员',
  weight: 0,
  upgrade: { expend_money: 0 },
  equity: { discount: 10 },
  status: 1
};

// 预设等级列表 (用于前端展示，无需API)
const PRESET_GRADES = [
  { grade_id: 1, name: '普通会员', weight: 1, upgrade: { expend_money: 0 }, equity: { discount: 10 } },
  { grade_id: 2, name: '黄金会员', weight: 10, upgrade: { expend_money: 1000 }, equity: { discount: 9.5 } },
  { grade_id: 3, name: '铂金会员', weight: 20, upgrade: { expend_money: 5000 }, equity: { discount: 9 } },
  { grade_id: 4, name: '钻石会员', weight: 30, upgrade: { expend_money: 10000 }, equity: { discount: 8.5 } }
];
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Response Data Extraction

*For any* valid API response from `/api/user/detail` containing user data, the Member_Grade_System SHALL correctly extract the grade object (grade_id, name, weight, upgrade, equity) and expend_money value, preserving all field values exactly as returned by the API.

**Validates: Requirements 1.2, 1.3**

### Property 2: Grade Progress Calculation

*For any* currentExpend value and nextLevelRequirement value where nextLevelRequirement > 0, the calculateProgress function SHALL return a value equal to min((currentExpend / nextLevelRequirement) * 100, 100), and the result SHALL always be between 0 and 100 inclusive.

**Validates: Requirements 3.6**

### Property 3: Discount Price Calculation

*For any* originalPrice and discountRate (where 0 < discountRate <= 10), the getDiscountPrice function SHALL return originalPrice * (discountRate / 10) rounded to exactly 2 decimal places.

**Validates: Requirements 5.1, 5.4**

### Property 4: Grade Style Mapping

*For any* grade weight value, the getGradeStyle function SHALL return a consistent style configuration where:
- weight >= 30 returns diamond style
- weight >= 20 and < 30 returns platinum style  
- weight >= 10 and < 20 returns gold style
- weight < 10 returns normal style

**Validates: Requirements 2.2, 8.4**

### Property 5: Amount To Next Level Calculation

*For any* currentExpend and nextLevelRequirement values, the getAmountToNextLevel function SHALL return max(nextLevelRequirement - currentExpend, 0), ensuring the result is never negative.

**Validates: Requirements 3.4**

## Error Handling

### API 错误处理

```javascript
// 在 Mine Page 中处理 API 错误
const fetchUserGrade = async () => {
  try {
    setLoading(true);
    const res = await request.post("user/detail&wxapp_id=10001");
    
    if (res.code === 1 && res.data?.userInfo) {
      const userInfo = res.data.userInfo;
      setUserGrade(userInfo.grade || DEFAULT_GRADE);
      setExpendMoney(parseFloat(userInfo.expend_money) || 0);
    } else {
      // API 返回错误码，使用默认等级
      setUserGrade(DEFAULT_GRADE);
      setExpendMoney(0);
    }
  } catch (error) {
    console.error('Failed to fetch user grade:', error);
    // 网络错误，使用默认等级
    setUserGrade(DEFAULT_GRADE);
    setExpendMoney(0);
  } finally {
    setLoading(false);
  }
};
```

### 数据验证

```javascript
// 验证等级数据完整性
function validateGradeData(grade) {
  if (!grade) return false;
  return (
    typeof grade.grade_id === 'number' &&
    typeof grade.name === 'string' &&
    typeof grade.weight === 'number' &&
    grade.upgrade && typeof grade.upgrade.expend_money === 'number' &&
    grade.equity && typeof grade.equity.discount === 'number'
  );
}
```

## Testing Strategy

### 单元测试

使用 Vitest 进行单元测试，测试工具函数的正确性：

```javascript
// src/utils/__tests__/gradeUtils.test.js
import { describe, it, expect } from 'vitest';
import { calculateProgress, getAmountToNextLevel, getDiscountPrice, getGradeStyle } from '../gradeUtils';

describe('gradeUtils', () => {
  describe('calculateProgress', () => {
    it('should return 0 when currentExpend is 0', () => {
      expect(calculateProgress(0, 1000)).toBe(0);
    });
    
    it('should return 100 when currentExpend >= nextLevelRequirement', () => {
      expect(calculateProgress(1500, 1000)).toBe(100);
    });
    
    it('should return correct percentage', () => {
      expect(calculateProgress(500, 1000)).toBe(50);
    });
  });
  
  describe('getDiscountPrice', () => {
    it('should calculate correct discount price', () => {
      expect(getDiscountPrice(100, 9.5)).toBe(95);
    });
    
    it('should round to 2 decimal places', () => {
      expect(getDiscountPrice(99.99, 9.5)).toBe(94.99);
    });
  });
});
```

### 属性测试

使用 fast-check 进行属性测试，验证核心计算逻辑：

```javascript
// src/utils/__tests__/gradeUtils.property.test.js
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateProgress, getAmountToNextLevel, getDiscountPrice, getGradeStyle } from '../gradeUtils';

describe('gradeUtils property tests', () => {
  // Feature: member-grade-display, Property 2: Grade Progress Calculation
  // Validates: Requirements 3.6
  it('calculateProgress should always return value between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100000 }),
        fc.float({ min: 0.01, max: 100000 }),
        (currentExpend, nextLevelRequirement) => {
          const result = calculateProgress(currentExpend, nextLevelRequirement);
          return result >= 0 && result <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: member-grade-display, Property 3: Discount Price Calculation
  // Validates: Requirements 5.1, 5.4
  it('getDiscountPrice should correctly apply discount and round to 2 decimals', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10000 }),
        fc.float({ min: 0.1, max: 10 }),
        (originalPrice, discountRate) => {
          const result = getDiscountPrice(originalPrice, discountRate);
          const expected = Number((originalPrice * (discountRate / 10)).toFixed(2));
          return result === expected;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: member-grade-display, Property 4: Grade Style Mapping
  // Validates: Requirements 2.2, 8.4
  it('getGradeStyle should return consistent style based on weight', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (weight) => {
          const style = getGradeStyle(weight);
          if (weight >= 30) return style.level === 'diamond';
          if (weight >= 20) return style.level === 'platinum';
          if (weight >= 10) return style.level === 'gold';
          return style.level === 'normal';
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: member-grade-display, Property 5: Amount To Next Level Calculation
  // Validates: Requirements 3.4
  it('getAmountToNextLevel should never return negative value', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100000 }),
        fc.float({ min: 0, max: 100000 }),
        (currentExpend, nextLevelRequirement) => {
          const result = getAmountToNextLevel(currentExpend, nextLevelRequirement);
          return result >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 组件测试

使用 React Testing Library 测试组件渲染：

```javascript
// src/components/Grade/__tests__/GradeBadge.test.jsx
import { render, screen } from '@testing-library/react';
import { GradeBadge } from '../GradeBadge';

describe('GradeBadge', () => {
  it('should render grade name', () => {
    const grade = { name: '黄金会员', weight: 10 };
    render(<GradeBadge grade={grade} />);
    expect(screen.getByText('黄金会员')).toBeInTheDocument();
  });
  
  it('should render default name when grade is null', () => {
    render(<GradeBadge grade={null} />);
    expect(screen.getByText('普通会员')).toBeInTheDocument();
  });
});
```
