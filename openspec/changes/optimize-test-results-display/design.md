# 技术设计文档

## 背景与约束

### 当前问题
- 测试历史页面显示数据冗余，包含等级判断
- 结算页面与历史页面展示逻辑不统一
- 百分位数计算可能不准确
- 用户无法快速识别个人最优成绩

### 利益相关者
- 用户：期望快速了解成绩，对标他人
- 数据分析：需要成绩追踪和删除功能
- 系统：需要支持大量历史数据的查询

## 目标与非目标

### 目标
- 统一所有页面的成绩显示规范
- 移除等级评分，保留百分位排名
- 支持成绩删除和详情查询
- 优化用户获取关键信息的体验

### 非目标
- 不修改成绩的存储结构（使用迁移或兼容方案）
- 不改变百分位计算的数学模型
- 不新增其他评分维度

## 技术决策

### 1. 数据模型调整

**决策**：使用适配器模式隐藏等级字段，而不是直接删除

**原因**：
- 避免数据迁移的复杂性
- 支持向后兼容
- 便于回滚

**实现**：
```typescript
// 数据库层保留等级字段，应用层不显示
interface TestScore {
  id: string
  testType: string
  score: number
  grade?: string  // 标记为弃用，但保留在DB中
  percentile: number
  completedAt: Date
  isPersonalBest: boolean
}

// UI展示模型，不包含等级
interface TestScoreDisplay {
  id: string
  testType: string
  score: number
  percentile: number
  completedAt: Date
  keyMetrics: Record<string, any>
}
```

### 2. 百分位计算与缓存

**决策**：使用分层缓存策略

**实现**：
- L1 缓存：内存中缓存最近 24 小时的计算结果
- L2 缓存：数据库中定期更新的百分位快照
- 过期策略：每天凌晨 2 点重新计算全量百分位

**理由**：
- 避免每次查询都重新计算（性能）
- 确保数据相对最新
- 支持离线场景

### 3. 最优成绩判断

**决策**：在应用层实现，支持客户端和服务端两种判断

```typescript
function isPersonalBest(
  currentScore: TestScore,
  previousBestScore?: TestScore
): boolean {
  if (!previousBestScore) return true
  // 根据测试类型的评分标准判断
  return compareScores(currentScore, previousBestScore) > 0
}
```

### 4. UI 组件架构

```
TestResultCard（基础卡片）
├── TestScoreBrief（简化视图）
│   ├── KeyMetricsDisplay（关键指标）
│   ├── PercentileRank（百分位）
│   └── CompletionDate（完成日期）
└── TestScoreDetail（详情视图）
    ├── FullMetrics（完整指标）
    ├── ComparisonStats（对比数据）
    └── Actions（操作按钮）
```

### 5. 成绩删除流程

**决策**：异步删除 + 乐观更新

```typescript
async function deleteTestScore(scoreId: string) {
  // 1. 乐观删除UI
  updateLocalCache(scoreId, { deleted: true })
  
  // 2. 发起异步删除
  try {
    await deleteScoreAPI(scoreId)
    // 成功：刷新百分位数据
    refreshPercentileCache()
  } catch (error) {
    // 失败：回滚UI
    rollbackLocalCache(scoreId)
  }
}
```

## 实现步骤

### Phase 1: 数据层（第1-2天）
1. 添加 `isPersonalBest` 字段到成绩表
2. 完善百分位计算函数
3. 实现缓存机制

### Phase 2: API 层（第2-3天）
1. 修改成绩查询端点，返回简化数据
2. 添加删除端点
3. 添加详情查询端点

### Phase 3: 前端组件（第3-5天）
1. 创建展示组件
2. 创建详情对话框组件
3. 集成删除功能

### Phase 4: 页面迁移（第5-6天）
1. 重构 TestHistory 页面
2. 重构 TestResult 页面
3. 集成恭喜提示

### Phase 5: 测试与优化（第6-7天）
1. 单元测试
2. 集成测试
3. 性能优化

## 风险与缓解

| 风险 | 影响 | 缓解方案 |
|------|------|---------|
| 百分位计算不准确 | 用户排名错误 | 单元测试覆盖所有测试类型 |
| 缓存过期不及时 | 排名陈旧 | 设置合理的过期时间，支持手动刷新 |
| 删除操作导致统计不准 | 排名变化 | 软删除方案，定期清理 |
| 大量历史数据查询慢 | 页面加载卡顿 | 分页加载，只显示最优成绩 |

## 迁移计划

### 向后兼容性
- 旧数据中的等级字段不显示，但保留在数据库
- 新增 `isPersonalBest` 字段时使用默认值

### 数据迁移脚本
```sql
-- 添加新字段
ALTER TABLE test_scores ADD COLUMN is_personal_best BOOLEAN DEFAULT FALSE;

-- 回填数据：标记每种类型的最高分
UPDATE test_scores SET is_personal_best = TRUE
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY test_type ORDER BY score DESC) as rn
    FROM test_scores
  ) WHERE rn = 1
)
```

## 开放问题

1. **百分位显示精度**：是否所有百分位都显示小数点后两位，还是仅当 >99% 时？
   - 建议：仅 >99% 时显示小数点后两位

2. **删除确认**：是否需要输入确认码防止误删？
   - 建议：使用简单确认对话框即可

3. **数据导出**：是否需要支持用户导出自己的所有历史成绩？
   - 建议：后续版本考虑
