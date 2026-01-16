# Requirements Document

## Introduction

本功能为前端应用增加会员等级显示和相关功能。通过对接后端已有的会员等级API，在前端展示用户当前等级、等级权益、升级进度等信息，并在商品价格展示时应用会员折扣。本功能仅涉及前端代码修改，不修改后端代码。

## Glossary

- **Member_Grade_System**: 会员等级系统，负责管理和展示用户会员等级相关信息
- **User_Grade**: 用户当前的会员等级对象，包含等级ID、名称、权重、升级条件和权益信息
- **Grade_Progress**: 等级升级进度，表示用户距离下一等级的消费进度
- **Discount_Rate**: 折扣率，范围0-10，如9.5表示95折
- **Expend_Money**: 累计消费金额，用于判断等级升级条件
- **Grade_List**: 所有可用会员等级的列表
- **Mine_Page**: 用户中心页面，显示用户个人信息和资产

## Requirements

### Requirement 1: 用户等级信息获取

**User Story:** As a user, I want to see my current membership grade information, so that I can understand my membership status and benefits.

#### Acceptance Criteria

1. WHEN the Mine_Page loads, THE Member_Grade_System SHALL fetch user grade information from the `/api/user/detail` endpoint
2. WHEN the API returns user data, THE Member_Grade_System SHALL extract and store the grade object containing grade_id, name, weight, upgrade conditions, and equity information
3. WHEN the API returns user data, THE Member_Grade_System SHALL extract and store the expend_money (累计消费金额) value
4. IF the API request fails, THEN THE Member_Grade_System SHALL display a fallback state showing "普通会员" as default grade
5. IF the user has no grade assigned (grade is null), THEN THE Member_Grade_System SHALL display "普通会员" as default grade

### Requirement 2: 会员等级展示

**User Story:** As a user, I want to see my membership grade displayed prominently on my profile page, so that I can quickly identify my membership status.

#### Acceptance Criteria

1. THE Mine_Page SHALL display the user's current grade name in a visible badge or label format
2. THE Mine_Page SHALL display a grade icon or visual indicator that corresponds to the grade level (普通会员、黄金会员、铂金会员、钻石会员)
3. THE Mine_Page SHALL display the user's current discount rate (e.g., "9.5折")
4. WHEN the grade information is loading, THE Mine_Page SHALL display a loading placeholder for the grade section

### Requirement 3: 升级进度展示

**User Story:** As a user, I want to see my progress towards the next membership grade, so that I can understand how much more I need to spend to upgrade.

#### Acceptance Criteria

1. THE Mine_Page SHALL display a progress bar showing the user's progress towards the next grade level
2. THE Mine_Page SHALL display the user's current cumulative spending amount (expend_money)
3. THE Mine_Page SHALL display the spending amount required to reach the next grade level
4. THE Mine_Page SHALL display the remaining amount needed to upgrade (next level requirement - current spending)
5. WHEN the user is at the highest grade level, THE Mine_Page SHALL display "最高等级" instead of upgrade progress
6. THE Grade_Progress calculation SHALL use the formula: progress = min((currentExpend / nextLevelRequirement) * 100, 100)

### Requirement 4: 等级权益展示

**User Story:** As a user, I want to see the benefits of my current membership grade and compare with other grades, so that I can understand the value of upgrading.

#### Acceptance Criteria

1. THE Mine_Page SHALL display the current grade's discount benefit (e.g., "享受9.5折优惠")
2. WHEN the user taps on the grade section, THE Member_Grade_System SHALL navigate to a grade detail page
3. THE Grade_Detail_Page SHALL display all available grades with their upgrade conditions and benefits
4. THE Grade_Detail_Page SHALL highlight the user's current grade in the list
5. THE Grade_Detail_Page SHALL display each grade's discount rate and upgrade spending requirement

### Requirement 5: 商品折扣价格计算

**User Story:** As a user, I want to see my member discount price when viewing products, so that I can understand the actual price I will pay.

#### Acceptance Criteria

1. WHEN displaying product prices, THE Member_Grade_System SHALL calculate the discounted price using the formula: discountPrice = originalPrice * (discountRate / 10)
2. THE product display SHALL show both the original price and the member discount price
3. IF the user's discount rate is 10 (no discount), THEN THE Member_Grade_System SHALL only display the original price without discount indication
4. THE discounted price SHALL be rounded to 2 decimal places

### Requirement 6: 等级数据类型定义

**User Story:** As a developer, I want clear TypeScript interfaces for grade data, so that I can ensure type safety throughout the application.

#### Acceptance Criteria

1. THE Member_Grade_System SHALL define a UserGrade interface with properties: grade_id (number), name (string), weight (number), upgrade (object with expend_money), equity (object with discount), status (number)
2. THE Member_Grade_System SHALL define a GradeProgress interface with properties: currentExpend (number), nextLevelRequirement (number), progressPercent (number), amountToNext (number)
3. THE Member_Grade_System SHALL export utility functions for grade calculations: calculateProgress, getAmountToNextLevel, getDiscountPrice

### Requirement 7: 多语言支持

**User Story:** As a user, I want to see membership grade information in my preferred language, so that I can understand the content easily.

#### Acceptance Criteria

1. THE Member_Grade_System SHALL support Chinese (zh), Vietnamese (vi), and Thai (th) translations for all grade-related text
2. THE translation keys SHALL include: grade names, discount labels, progress labels, and upgrade prompts
3. WHEN the language changes, THE grade display SHALL update to reflect the new language immediately

### Requirement 8: 等级组件复用

**User Story:** As a developer, I want reusable grade display components, so that I can easily show grade information in different parts of the application.

#### Acceptance Criteria

1. THE Member_Grade_System SHALL provide a GradeBadge component that displays the grade name and icon
2. THE Member_Grade_System SHALL provide a GradeProgress component that displays the upgrade progress bar
3. THE Member_Grade_System SHALL provide a GradeCard component that combines badge, progress, and benefits display
4. WHEN the GradeBadge component receives a grade object, THE component SHALL render the appropriate visual style based on grade weight
