## MODIFIED Requirements

### Requirement: Temperature设置
系统SHALL根据不同的三问任务类型使用差异化的temperature参数，而非全局统一值。

#### Scenario: 心智模型提取Temperature
- **WHEN** 调用 `extractMentalModels()` 进行心智模型提取时
- **THEN** 系统应设置temperature为0.3，保证输出的一致性和准确性

#### Scenario: 分歧定位Temperature
- **WHEN** 调用 `identifyDisagreements()` 进行分歧定位时
- **THEN** 系统应设置temperature为0.8，获取多样化的分歧视角

#### Scenario: 深度理解题生成Temperature
- **WHEN** 调用 `generateDeepQuestions()` 生成深度理解题时
- **THEN** 系统应设置temperature为0.6，平衡题目创意和结构规范

#### Scenario: 错误追问Temperature
- **WHEN** 调用 `explainWrongAnswer()` 进行错误追问时
- **THEN** 系统应设置temperature为0.7，提供灵活变通的解释

### Requirement: Max tokens设置
系统SHALL根据不同的三问任务类型使用差异化的max_tokens参数。

#### Scenario: 心智模型提取Max tokens
- **WHEN** 调用 `extractMentalModels()` 时
- **THEN** 系统应设置max_tokens为3000，容纳5个完整心智模型描述

#### Scenario: 分歧定位Max tokens
- **WHEN** 调用 `identifyDisagreements()` 时
- **THEN** 系统应设置max_tokens为3000，容纳3个完整分歧论据

#### Scenario: 深度理解题生成Max tokens
- **WHEN** 调用 `generateDeepQuestions()` 时
- **THEN** 系统应设置max_tokens为4000，容纳10道完整题目及解析

#### Scenario: 错误追问Max tokens
- **WHEN** 调用 `explainWrongAnswer()` 时
- **THEN** 系统应设置max_tokens为1000，提供简洁的个性化解释
